/**
 * WhatsApp Cloud API Service
 * Handles sending messages via WhatsApp Business API
 */

const WHATSAPP_API_URL = "https://graph.instagram.com/v18.0";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";

interface WhatsAppTextMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: {
    preview_url: boolean;
    body: string;
  };
}

interface WhatsAppResponse {
  messages: Array<{
    id: string;
  }>;
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("WhatsApp credentials not configured");
    return {
      success: false,
      error: "WhatsApp credentials not configured",
    };
  }

  try {
    const payload: WhatsAppTextMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "text",
      text: {
        preview_url: true,
        body: message,
      },
    };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`WhatsApp API error: ${response.status} ${error}`);
      return {
        success: false,
        error: `WhatsApp API error: ${response.status}`,
      };
    }

    const data: WhatsAppResponse = await response.json();

    if (data.messages && data.messages.length > 0) {
      return {
        success: true,
        messageId: data.messages[0].id,
      };
    }

    return {
      success: false,
      error: "No message ID returned from WhatsApp API",
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a synthesis to a user
 */
export async function sendSynthesisToUser(
  phoneNumber: string,
  topics: string[],
  synthesisContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `📰 *Synthèse d'actualités - ${new Date().toLocaleDateString("fr-FR")}*

Thèmes: ${topics.join(", ")}

${synthesisContent}

---
Répondez avec *menu* pour voir les commandes disponibles.`;

  return sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Send a welcome message to a new user
 */
export async function sendWelcomeMessage(
  phoneNumber: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `Bienvenue sur WhatsApp News Assistant! 👋

Je suis votre assistant personnel pour recevoir des synthèses d'actualités personnalisées.

Tapez *menu* pour commencer.`;

  return sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Send a menu message
 */
export async function sendMenuMessage(
  phoneNumber: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `📋 *Menu Principal*

Voici ce que vous pouvez faire:

1️⃣ *Thèmes* - Choisir vos thèmes d'actualités
⏰ *Fréquence* - Choisir quotidien ou hebdomadaire
💳 *Abonnement* - Gérer votre abonnement
📊 *Synthèses* - Voir vos synthèses précédentes
❌ *Arrêter* - Annuler votre abonnement

Tapez simplement le mot-clé pour continuer.`;

  return sendWhatsAppMessage(phoneNumber, message);
}
