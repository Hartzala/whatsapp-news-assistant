import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getUserByOpenId, getSubscriptionByUserId, createOrUpdateUserPreferences, getUserPreferences } from "../db";

/**
 * WhatsApp webhook handler for incoming messages
 * This router handles:
 * 1. Webhook verification (GET request)
 * 2. Incoming message processing (POST request)
 */
export const whatsappRouter = router({
  /**
   * Webhook verification endpoint
   * WhatsApp sends a GET request with challenge token to verify the endpoint
   */
  webhook: publicProcedure
    .input(z.object({
      mode: z.string().optional(),
      challenge: z.string().optional(),
      verify_token: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";
      
      if (input.mode === "subscribe" && input.verify_token === VERIFY_TOKEN) {
        return {
          success: true,
          challenge: input.challenge,
        };
      }
      
      return {
        success: false,
        error: "Invalid verification token",
      };
    }),

  /**
   * Handle incoming WhatsApp messages
   * Processes user messages and responds with appropriate actions
   */
  handleMessage: publicProcedure
    .input(z.object({
      from: z.string(), // Phone number in format 33612345678
      message: z.string(), // User's message text
      messageId: z.string(), // WhatsApp message ID
    }))
    .mutation(async ({ input }) => {
      const { from, message, messageId } = input;
      
      // Parse the message to determine user intent
      const lowerMessage = message.toLowerCase().trim();
      
      // Handle different commands
      if (lowerMessage === "menu" || lowerMessage === "help") {
        return {
          success: true,
          response: `Bienvenue ! Voici les commandes disponibles:
          
📰 *Thèmes* - Choisir vos thèmes d'actualités
⏰ *Fréquence* - Choisir quotidien ou hebdomadaire
💳 *Abonnement* - Gérer votre abonnement
📊 *Synthèses* - Voir vos synthèses précédentes
❌ *Arrêter* - Annuler votre abonnement`,
        };
      }
      
      if (lowerMessage.startsWith("thèmes") || lowerMessage.startsWith("themes")) {
        return {
          success: true,
          response: `Quels thèmes vous intéressent ? Entrez-les séparés par des virgules.
          
Exemples: technologie, finance, sport, politique, santé, environnement`,
        };
      }
      
      if (lowerMessage.startsWith("fréquence") || lowerMessage.startsWith("frequence")) {
        return {
          success: true,
          response: `Choisissez votre fréquence:
          
1️⃣ *Quotidien* - Synthèse chaque jour
7️⃣ *Hebdomadaire* - Synthèse chaque semaine`,
        };
      }
      
      // Default response
      return {
        success: true,
        response: "Message reçu. Tapez *menu* pour voir les commandes disponibles.",
      };
    }),

  /**
   * Update user preferences (topics and frequency)
   */
  updatePreferences: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      topics: z.array(z.string()),
      frequency: z.enum(["daily", "weekly"]),
      sendTime: z.string().optional(), // HH:MM format
    }))
    .mutation(async ({ input }) => {
      try {
        // In a real scenario, we'd look up the user by phone number
        // For now, this is a placeholder
        
        return {
          success: true,
          message: "Préférences mises à jour avec succès",
        };
      } catch (error) {
        console.error("Error updating preferences:", error);
        return {
          success: false,
          error: "Erreur lors de la mise à jour des préférences",
        };
      }
    }),
});
