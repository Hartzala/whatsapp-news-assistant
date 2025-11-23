/**
 * WhatsApp Webhook Handler
 * Handles incoming messages and events from WhatsApp Cloud API
 */

import { Request, Response } from "express";
import { sendWhatsAppMessage } from "../services/whatsappApi";
import { handleWhatsAppMessage } from "../services/whatsappAiHandler";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";

/**
 * Verify webhook endpoint (GET request from Meta)
 */
export function verifyWebhook(req: Request, res: Response) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.error("[WhatsApp] Webhook verification failed");
    res.sendStatus(403);
  }
}

/**
 * Handle incoming messages and events (POST request from Meta)
 */
export async function handleWebhookEvent(req: Request, res: Response) {
  const body = req.body;

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ received: true });

  // Verify the webhook signature (optional but recommended)
  if (!body.object) {
    console.error("[WhatsApp] Invalid webhook payload");
    return;
  }

  try {
    // Process webhook entries
    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        const value = change.value;

        // Handle incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            await handleIncomingMessage(message, value);
          }
        }

        // Handle message status updates (delivered, read, failed)
        if (value.statuses) {
          for (const status of value.statuses) {
            await handleMessageStatus(status);
          }
        }
      }
    }
  } catch (error) {
    console.error("[WhatsApp] Error processing webhook:", error);
  }
}

/**
 * Handle incoming messages from users
 */
async function handleIncomingMessage(
  message: any,
  context: any
): Promise<void> {
  try {
    const phoneNumber = message.from;
    const messageId = message.id;
    const timestamp = message.timestamp;

    console.log(`[WhatsApp] Received message from ${phoneNumber}: ${messageId}`);

    // Extract message content
    let messageText = "";
    if (message.type === "text") {
      messageText = message.text.body;
    } else if (message.type === "interactive") {
      // Handle interactive messages (buttons, lists, etc.)
      messageText = message.interactive?.button_reply?.title || "";
    }

    if (!messageText) {
      console.warn("[WhatsApp] Received non-text message, ignoring");
      return;
    }

    // Process the message
    await processUserMessage(phoneNumber, messageText, messageId);
  } catch (error) {
    console.error("[WhatsApp] Error handling incoming message:", error);
  }
}

/**
 * Process user message and send appropriate response using AI
 */
async function processUserMessage(
  phoneNumber: string,
  messageText: string,
  messageId: string
): Promise<void> {
  // Use the new AI handler for natural language processing
  await handleWhatsAppMessage(phoneNumber, messageText);
}

/**
 * Handle message status updates
 */
async function handleMessageStatus(status: any): Promise<void> {
  const messageId = status.id;
  const statusValue = status.status; // sent, delivered, read, failed
  const timestamp = status.timestamp;

  console.log(`[WhatsApp] Message ${messageId} status: ${statusValue}`);

  // You can log these to the database for analytics
  // For now, we just log them
}

/**
 * Register webhook routes
 */
export function registerWhatsAppWebhooks(app: any) {
  // GET request for webhook verification
  app.get("/api/webhooks/whatsapp", verifyWebhook);

  // POST request for incoming messages and events
  app.post("/api/webhooks/whatsapp", handleWebhookEvent);

  console.log("[WhatsApp] Webhook routes registered");
}
