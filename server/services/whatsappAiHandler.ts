import {
  getContext,
  updateContext,
  analyzeUserIntent,
  generateNaturalResponse,
  addMessageToHistory,
  ConversationState,
} from "./conversationContext";
import { createOrUpdateUserPreferences, getSubscriptionByUserId, getUserByOpenId } from "../db";
import { sendWhatsAppMessage } from "./twilioWhatsapp";
import { fetchNewsByTopic } from "./newsApi";
import { generateSynthesisWithOpenAI } from "./openaiSynthesis";

const AVAILABLE_TOPICS = [
  "Technologie",
  "Finance",
  "Sport",
  "Politique",
  "Santé",
  "Environnement",
  "Divertissement",
  "Science",
  "Affaires",
  "Voyages",
];

// Track free questions per user per day
const freeQuestionsTracker = new Map<string, { count: number; date: string }>();
const MAX_FREE_QUESTIONS_PER_DAY = 5;

function checkFreeQuestionLimit(phoneNumber: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().split("T")[0];
  const tracker = freeQuestionsTracker.get(phoneNumber);

  if (!tracker || tracker.date !== today) {
    // New day, reset counter
    freeQuestionsTracker.set(phoneNumber, { count: 0, date: today });
    return { allowed: true, remaining: MAX_FREE_QUESTIONS_PER_DAY };
  }

  if (tracker.count >= MAX_FREE_QUESTIONS_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_FREE_QUESTIONS_PER_DAY - tracker.count };
}

function incrementFreeQuestionCount(phoneNumber: string) {
  const today = new Date().toISOString().split("T")[0];
  const tracker = freeQuestionsTracker.get(phoneNumber);

  if (!tracker || tracker.date !== today) {
    freeQuestionsTracker.set(phoneNumber, { count: 1, date: today });
  } else {
    tracker.count++;
  }
}

export async function handleWhatsAppMessage(phoneNumber: string, messageText: string, userId?: number) {
  try {
    // Get or create user context
    let context = getContext(phoneNumber);
    context.userId = userId;

    // Add user message to history
    addMessageToHistory(context, "user", messageText);

    // Analyze user intent
    const intentAnalysis = await analyzeUserIntent(messageText, context);

    // Generate response based on intent and state
    let response: string;
    let newState: ConversationState = context.state;

    if (context.isFirstMessage) {
      // First message: send greeting and explain functionality
      response = await generateGreeting();
      newState = "greeting";
      context.isFirstMessage = false;
    } else {
      // Handle based on intent
      switch (intentAnalysis.intent) {
        case "ask_question":
          // Free feature: answer questions in real-time (limited to 5/day)
          response = await handleQuestion(phoneNumber, messageText, userId);
          break;

        case "set_topics":
          response = await handleTopicSelection(messageText, context, intentAnalysis.extractedData?.topics);
          if (intentAnalysis.extractedData?.topics && intentAnalysis.extractedData.topics.length > 0) {
            context.selectedTopics = intentAnalysis.extractedData.topics;
            newState = "selecting_frequency";
          }
          break;

        case "set_frequency":
          response = await handleFrequencySelection(messageText, context, intentAnalysis.extractedData?.frequency);
          if (intentAnalysis.extractedData?.frequency) {
            context.selectedFrequency = intentAnalysis.extractedData.frequency;
            newState = "confirming_setup";
          }
          break;

        case "confirm":
          response = await handleSubscriptionRequest(phoneNumber, userId);
          break;

        case "help":
          response = await generateGreeting();
          break;

        default:
          response = await generateNaturalResponse(messageText, context, intentAnalysis.intent);
      }
    }

    // Update context
    updateContext(phoneNumber, {
      state: newState,
      selectedTopics: context.selectedTopics,
      selectedFrequency: context.selectedFrequency,
    });

    // Add assistant response to history
    addMessageToHistory(context, "assistant", response);

    // Response will be sent via TwiML by the webhook (not via Twilio API)
    // await sendWhatsAppMessage(phoneNumber, response);

    return { success: true, response };
  } catch (error) {
    console.error("[WhatsApp AI Handler] Error:", error);
    const errorMessage = "Désolé, une erreur s'est produite. Veuillez réessayer.";
    // Error will be sent via TwiML by the webhook
    // try {
    //   await sendWhatsAppMessage(phoneNumber, errorMessage);
    // } catch (sendError) {
    //   console.error("[WhatsApp AI Handler] Failed to send error message:", sendError);
    // }
    return { success: false, error: String(error), response: errorMessage };
  }
}

async function generateGreeting(): Promise<string> {
  return `Bonjour ! 👋

Je suis votre assistant d'actualités personnalisées. Voici ce que je peux faire pour vous :

**GRATUIT** 🆓
• Posez-moi des questions sur l'actualité, je vous réponds en temps réel
• Limite : 5 questions par jour
• Exemple : "Quoi de neuf en technologie ?" ou "Résume-moi l'actualité sportive"

**PREMIUM** ⭐ (3,99€/mois)
• Recevez des résumés automatiques quotidiens ou hebdomadaires
• Choisissez vos thèmes parmi 10 catégories
• Synthèses intelligentes générées par IA
• Questions illimitées

💬 **Essayez gratuitement** : Posez-moi une question !
💳 **Pour vous abonner** : Tapez "abonnement"`;
}

/**
 * Handle free questions - answer in real-time using NewsAPI (limited to 5/day)
 */
async function handleQuestion(phoneNumber: string, question: string, userId?: number): Promise<string> {
  try {
    // Check if user is a premium subscriber
    let isPremium = false;
    if (userId) {
      const subscription = await getSubscriptionByUserId(userId);
      isPremium = subscription?.status === "active";
    }

    // If not premium, check free question limit
    if (!isPremium) {
      const limit = checkFreeQuestionLimit(phoneNumber);

      if (!limit.allowed) {
        return `❌ Vous avez atteint la limite de ${MAX_FREE_QUESTIONS_PER_DAY} questions gratuites par jour.

💳 **Passez à Premium** pour des questions illimitées et des résumés automatiques !
Tapez "abonnement" pour en savoir plus.`;
      }

      // Increment counter
      incrementFreeQuestionCount(phoneNumber);

      console.log(`[WhatsApp AI] Free question ${MAX_FREE_QUESTIONS_PER_DAY - limit.remaining + 1}/${MAX_FREE_QUESTIONS_PER_DAY} for ${phoneNumber}`);
    }

    console.log(`[WhatsApp AI] Handling question: ${question}`);

    // Search for recent articles
    const articles = await fetchNewsByTopic("Actualités", 5, 2); // Last 2 days

    if (!articles || articles.length === 0) {
      return `Je n'ai pas trouvé d'actualités récentes sur ce sujet. Essayez une autre question ou un thème différent.

💡 **Astuce** : Pour recevoir des résumés quotidiens automatiques, tapez "abonnement"`;
    }

    // Generate synthesis with OpenAI
    const result = await generateSynthesisWithOpenAI(["Actualités"], 5, 2);

    if (!result.success || !result.synthesis) {
      return `Désolé, je n'ai pas pu générer une réponse. Veuillez réessayer.`;
    }

    const limit2 = checkFreeQuestionLimit(phoneNumber);
    const remainingQuestions = isPremium ? "∞" : `${limit2.remaining}`;

    return `${result.synthesis}

---
${isPremium ? "⭐ **Premium**" : `🆓 **Questions restantes aujourd'hui : ${remainingQuestions}**`}
${!isPremium ? "Pour des questions illimitées, tapez \"abonnement\"" : ""}`;
  } catch (error) {
    console.error("[WhatsApp AI] Error handling question:", error);
    return `Désolé, je n'ai pas pu répondre à votre question. Veuillez réessayer.`;
  }
}

async function handleTopicSelection(
  messageText: string,
  context: any,
  extractedTopics?: string[]
): Promise<string> {
  if (!extractedTopics || extractedTopics.length === 0) {
    return `Je n'ai pas bien compris les thèmes. Voici les catégories disponibles :

${AVAILABLE_TOPICS.map((t) => `• ${t}`).join("\n")}

Lesquels vous intéressent ? (ex: "Technologie, Finance, Sport")`;
  }

  const validTopics = extractedTopics.filter((t) =>
    AVAILABLE_TOPICS.some((at) => at.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(at.toLowerCase()))
  );

  if (validTopics.length === 0) {
    return `Je n'ai pas reconnu ces thèmes. Voici les catégories disponibles :

${AVAILABLE_TOPICS.map((t) => `• ${t}`).join("\n")}

Lesquels vous intéressent ?`;
  }

  context.selectedTopics = validTopics;

  return `Parfait ! Vous avez choisi : ${validTopics.join(", ")}

Maintenant, à quelle fréquence souhaitez-vous recevoir vos synthèses ?
• **Quotidien** - Résumé de l'actualité de la veille (chaque jour à 8h)
• **Hebdomadaire** - Résumé des 7 derniers jours (chaque lundi à 8h)`;
}

async function handleFrequencySelection(
  messageText: string,
  context: any,
  extractedFrequency?: "daily" | "weekly"
): Promise<string> {
  if (!extractedFrequency) {
    return `Je n'ai pas bien compris. Préférez-vous :
• **Quotidien** - Résumé de l'actualité de la veille
• **Hebdomadaire** - Résumé des 7 derniers jours`;
  }

  context.selectedFrequency = extractedFrequency;
  const frequencyText = extractedFrequency === "daily" ? "quotidienne" : "hebdomadaire";

  return `Excellent ! Vous recevrez une synthèse ${frequencyText}.

📋 **Récapitulatif** :
• Thèmes : ${context.selectedTopics.join(", ")}
• Fréquence : ${frequencyText}
• Prix : 3,99€/mois

💳 Tapez "payer" pour vous abonner et commencer à recevoir vos résumés !`;
}

async function handleSubscriptionRequest(phoneNumber: string, userId?: number): Promise<string> {
  try {
    if (!userId) {
      return `Pour vous abonner, vous devez d'abord vous connecter sur notre site : https://votre-domaine.com

Une fois connecté, revenez ici et tapez "payer" pour obtenir votre lien de paiement.`;
    }

    // Check if user already has an active subscription
    const subscription = await getSubscriptionByUserId(userId);
    if (subscription && subscription.status === "active") {
      return `✅ Vous êtes déjà abonné !

Votre abonnement est actif jusqu'au ${subscription.currentPeriodEnd?.toLocaleDateString("fr-FR")}.

Pour gérer votre abonnement, visitez : https://votre-domaine.com/dashboard`;
    }

    // Generate Stripe payment link
    // Note: This would typically call the Stripe API to create a checkout session
    // For now, we return a placeholder
    return `💳 **Lien de paiement**

Cliquez sur ce lien pour vous abonner (3,99€/mois) :
https://votre-domaine.com/checkout

Une fois le paiement effectué, vos résumés commenceront automatiquement ! 🎉`;
  } catch (error) {
    console.error("[WhatsApp AI] Error handling subscription request:", error);
    return `Une erreur s'est produite. Veuillez réessayer ou contactez le support.`;
  }
}

async function handleConfirmation(context: any): Promise<string> {
  if (!context.userId) {
    return "Vous devez d'abord vous connecter pour confirmer votre abonnement.";
  }

  try {
    // Save preferences to database
    await createOrUpdateUserPreferences(context.userId, {
      topics: JSON.stringify(context.selectedTopics),
      frequency: context.selectedFrequency || "weekly",
    });

    return `✅ Vos préférences ont été enregistrées !

Vous recevrez bientôt votre première synthèse d'actualités.

Pour gérer votre abonnement ou modifier vos préférences, visitez notre tableau de bord : https://votre-domaine.com/dashboard`;
  } catch (error) {
    console.error("Error saving preferences:", error);
    return "Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer.";
  }
}
