/**
 * Twilio WhatsApp Webhook Handler
 * Handles incoming WhatsApp messages from Twilio
 */

import { Router } from "express";
import twilio from "twilio";
const { MessagingResponse } = twilio.twiml;
import { extractPhoneNumber } from "../services/twilioWhatsapp";
import { handleWhatsAppMessage } from "../services/whatsappAiHandler";
import { getOrCreateUserByWhatsAppPhone } from "../db";

const router = Router();

/**
 * POST /api/webhooks/twilio/whatsapp
 * Webhook endpoint for incoming WhatsApp messages from Twilio
 */
router.post("/whatsapp", async (req, res) => {
  try {
    console.log("[Twilio Webhook] === START ===");
    console.log("[Twilio Webhook] Received message:", req.body);

    const {
      From,
      Body,
      MessageSid,
      ProfileName,
      NumMedia,
    } = req.body;

    console.log("[Twilio Webhook] From:", From, "Body:", Body);

    // Extract phone number from Twilio format (whatsapp:+33612345678)
    const phoneNumber = extractPhoneNumber(From);
    console.log("[Twilio Webhook] Extracted phone:", phoneNumber);

    // Get or create user automatically (first message = auto registration)
    console.log("[Twilio Webhook] Getting or creating user...");
    const user = await getOrCreateUserByWhatsAppPhone(phoneNumber);
    const userId = user?.id;
    console.log("[Twilio Webhook] User ID:", userId);

    // Handle the incoming message with AI
    console.log("[Twilio Webhook] Calling handleWhatsAppMessage...");
    const result = await handleWhatsAppMessage(phoneNumber, Body || "", userId);
    console.log("[Twilio Webhook] Handler result:", result);

    // Create Twilio MessagingResponse
    const twiml = new MessagingResponse();
    
    if (result.success && result.response) {
      twiml.message(result.response);
    } else {
      // Default response if something went wrong
      twiml.message("Désolé, une erreur s'est produite. Veuillez réessayer.");
    }

    // Return TwiML response
    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("[Twilio Webhook] === ERROR ===");
    console.error("[Twilio Webhook] Error details:", error);
    console.error("[Twilio Webhook] Stack:", error instanceof Error ? error.stack : "No stack");

    // Return error response
    const twiml = new MessagingResponse();
    twiml.message("Une erreur s'est produite. Veuillez réessayer plus tard.");
    
    res.type("text/xml");
    res.status(200); // Always return 200 to Twilio to avoid retries
    res.send(twiml.toString());
  }
});

/**
 * GET /api/webhooks/twilio/whatsapp
 * Status check endpoint
 */
router.get("/whatsapp", (req, res) => {
  res.json({
    status: "ok",
    message: "Twilio WhatsApp webhook is ready",
  });
});

/**
 * POST /api/webhooks/twilio/status
 * Webhook endpoint for message status updates
 */
router.post("/status", (req, res) => {
  const {
    MessageSid,
    MessageStatus,
    To,
    ErrorCode,
    ErrorMessage,
  } = req.body;

  console.log(`[Twilio Status] Message ${MessageSid} to ${To}: ${MessageStatus}`);

  if (ErrorCode) {
    console.error(`[Twilio Status] Error ${ErrorCode}: ${ErrorMessage}`);
  }

  // Acknowledge receipt
  res.sendStatus(200);
});

export default router;
