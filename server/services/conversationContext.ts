import { invokeLLM } from "../_core/llm";

export type ConversationState = "greeting" | "selecting_topics" | "selecting_frequency" | "confirming_setup" | "active";

export interface UserContext {
  phoneNumber: string;
  userId?: number;
  state: ConversationState;
  selectedTopics: string[];
  selectedFrequency?: "daily" | "weekly";
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>;
  isFirstMessage: boolean;
  createdAt: Date;
  lastMessageAt: Date;
}

// In-memory store for conversation contexts (in production, use database)
const contextStore = new Map<string, UserContext>();

export function initializeContext(phoneNumber: string): UserContext {
  const context: UserContext = {
    phoneNumber,
    state: "greeting",
    selectedTopics: [],
    messageHistory: [],
    isFirstMessage: true,
    createdAt: new Date(),
    lastMessageAt: new Date(),
  };
  contextStore.set(phoneNumber, context);
  return context;
}

export function getContext(phoneNumber: string): UserContext {
  let context = contextStore.get(phoneNumber);
  if (!context) {
    context = initializeContext(phoneNumber);
  }
  context.lastMessageAt = new Date();
  return context;
}

export function updateContext(phoneNumber: string, updates: Partial<UserContext>): UserContext {
  const context = getContext(phoneNumber);
  const updated = { ...context, ...updates };
  contextStore.set(phoneNumber, updated);
  return updated;
}

export async function analyzeUserIntent(
  userMessage: string,
  context: UserContext
): Promise<{
  intent: "greeting" | "set_topics" | "set_frequency" | "confirm" | "help" | "ask_question" | "subscribe_premium" | "other";
  confidence: number;
  extractedData?: {
    topics?: string[];
    frequency?: "daily" | "weekly";
  };
}> {
  const systemPrompt = `Tu es un assistant IA qui analyse les messages utilisateurs dans une conversation WhatsApp sur un service d'actualités.

**Contexte actuel:**
- État de la conversation: ${context.state}
- Thèmes sélectionnés: ${context.selectedTopics.join(", ") || "aucun"}
- Fréquence: ${context.selectedFrequency || "non définie"}
- Premier message: ${context.isFirstMessage}

**Instructions:**
Analyse le message de l'utilisateur et détermine son intention. Réponds avec un objet JSON contenant:
- intent: "greeting" | "set_topics" | "set_frequency" | "confirm" | "help" | "ask_question" | "subscribe_premium" | "other"
- confidence: nombre entre 0 et 1
- extractedData: objet optionnel avec topics (array) ou frequency (string)

**Détection des intentions:**
- "greeting": Salutations, premiers contacts ("bonjour", "salut", "hello", "hey")
- "set_topics": Mention de thèmes d'actualité (tech, technologie, finance, sport, politique, santé, environnement, divertissement, science, affaires, voyages)
- "set_frequency": Mention de fréquence (quotidien, daily, hebdomadaire, weekly, tous les jours, une fois par semaine, chaque jour, chaque semaine)
- "confirm": Confirmation ou validation ("oui", "ok", "d'accord", "valider", "confirmer", "payer")
- "help": Demande d'aide ou d'explication ("aide", "comment ça marche", "à quoi tu sers", "fonctionnalités", "c'est quoi")
- "ask_question": Question sur l'actualité ("actualités", "news", "quoi de neuf", "dernières infos", "que se passe-t-il", "infos sur", "parle-moi de")
- "subscribe_premium": Demande d'abonnement payant ("premium", "abonnement", "payer", "s'abonner", "résumés automatiques", "m'abonner", "souscrire")
- "other": Autre intention

**Exemples:**
- "Quelles sont les dernières actualités tech ?" → intent: "ask_question", extractedData: { topics: ["Technologie"] }
- "Je veux des résumés quotidiens" → intent: "set_frequency", extractedData: { frequency: "daily" }
- "Comment ça marche ?" → intent: "help"
- "Je veux m'abonner" → intent: "subscribe_premium"
- "Tech et finance" → intent: "set_topics", extractedData: { topics: ["Technologie", "Finance"] }`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "intent_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            intent: {
              type: "string",
              enum: ["greeting", "set_topics", "set_frequency", "confirm", "help", "ask_question", "subscribe_premium", "other"],
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            extractedData: {
              type: "object",
              properties: {
                topics: { type: "array", items: { type: "string" } },
                frequency: { type: "string", enum: ["daily", "weekly"] },
              },
            },
          },
          required: ["intent", "confidence"],
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") throw new Error("No response content");
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error("Failed to parse intent analysis:", error);
    return { intent: "other", confidence: 0 };
  }
}

export async function generateNaturalResponse(
  userMessage: string,
  context: UserContext,
  intent: string
): Promise<string> {
  const systemPrompt = `Tu es un assistant WhatsApp intelligent pour un service d'actualités personnalisées.

**Contexte utilisateur:**
- État: ${context.state}
- Thèmes sélectionnés: ${context.selectedTopics.join(", ") || "aucun"}
- Fréquence: ${context.selectedFrequency || "non définie"}
- Premier message: ${context.isFirstMessage}
- Statut abonnement: ${context.userId ? "Potentiellement Premium" : "Gratuit"}

**Fonctionnalités du service:**

### 🆓 Version Gratuite (par défaut)
- Poser des questions sur l'actualité en temps réel
- Recevoir des réponses instantanées avec sources
- Limite: 5 questions par jour
- Aucune inscription requise

### 💎 Version Premium (3,99€/mois)
- Résumés d'actualités automatiques (quotidiens ou hebdomadaires)
- Personnalisation des thèmes d'intérêt
- Questions illimitées
- Synthèses IA de qualité

**Instructions de réponse:**
1. **Ton et style:**
   - Conversationnel et amical
   - Utilise le français
   - Réponses détaillées pour les actualités (pas de limite stricte)
   - Emojis avec modération (1-2 par message)

2. **Premier message:**
   - Présente brièvement les fonctionnalités (gratuit vs Premium)
   - Explique qu'aucune inscription n'est nécessaire
   - Propose d'essayer gratuitement

3. **Questions d'actualité:**
   - Réponds directement avec les informations disponibles
   - Cite les sources
   - Propose d'autres thèmes si pertinent

4. **Configuration Premium:**
   - Explique les avantages Premium
   - Guide pour choisir thèmes et fréquence
   - Propose le lien de paiement Stripe à la fin

5. **Ce qu'il NE FAUT PAS dire:**
   - ❌ "Créez un compte sur notre site"
   - ❌ "Inscrivez-vous d'abord"
   - ❌ "Visitez notre plateforme web"
   - ✅ Tout se fait directement par WhatsApp

**Thèmes disponibles:**
Technologie, Finance, Sport, Politique, Santé, Environnement, Divertissement, Science, Affaires, Voyages

**Fréquences disponibles:**
- Quotidien (chaque jour à 8h)
- Hebdomadaire (chaque lundi à 8h)`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      ...context.messageHistory.slice(-4), // Keep last 4 messages for context
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  return "Je n'ai pas compris votre message. Pouvez-vous reformuler ?";
}

export function addMessageToHistory(context: UserContext, role: "user" | "assistant", content: string): void {
  context.messageHistory.push({ role, content });
  // Keep only last 10 messages to avoid token limits
  if (context.messageHistory.length > 10) {
    context.messageHistory = context.messageHistory.slice(-10);
  }
}

export function resetContext(phoneNumber: string): void {
  contextStore.delete(phoneNumber);
}

export function cleanupOldContexts(maxAgeHours: number = 24): void {
  const now = new Date();
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  const keysToDelete: string[] = [];
  contextStore.forEach((context, phoneNumber) => {
    if (now.getTime() - context.lastMessageAt.getTime() > maxAge) {
      keysToDelete.push(phoneNumber);
    }
  });

  keysToDelete.forEach((key) => contextStore.delete(key));
}
