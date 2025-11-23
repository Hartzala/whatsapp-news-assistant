/**
 * Twilio WhatsApp Service
 * Handles sending WhatsApp messages via Twilio API
 */

import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

// Initialize Twilio client
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

/**
 * Send a WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      console.error("Twilio client not initialized. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN");
      return {
        success: false,
        error: "Twilio client not configured",
      };
    }

    // Ensure the 'to' number has the whatsapp: prefix
    const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      body: message,
    });

    console.log(`[Twilio] Message sent successfully: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error("[Twilio] Error sending message:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Send a WhatsApp message with media via Twilio
 */
export async function sendWhatsAppMessageWithMedia(
  to: string,
  message: string,
  mediaUrl: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      console.error("Twilio client not initialized");
      return {
        success: false,
        error: "Twilio client not configured",
      };
    }

    const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      body: message,
      mediaUrl: [mediaUrl],
    });

    console.log(`[Twilio] Message with media sent successfully: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error("[Twilio] Error sending message with media:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Validate Twilio webhook signature
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, any>
): boolean {
  try {
    if (!TWILIO_AUTH_TOKEN) {
      console.warn("[Twilio] Cannot validate signature: TWILIO_AUTH_TOKEN not set");
      return false;
    }

    return twilio.validateRequest(
      TWILIO_AUTH_TOKEN,
      signature,
      url,
      params
    );
  } catch (error) {
    console.error("[Twilio] Error validating signature:", error);
    return false;
  }
}

/**
 * Format phone number for WhatsApp (ensure E.164 format)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // If it doesn't start with +, assume it's a French number
  if (!phoneNumber.startsWith("+")) {
    // Remove leading 0 if present (French format)
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    // Add French country code
    cleaned = `33${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * Extract phone number from Twilio WhatsApp format (whatsapp:+33612345678)
 */
export function extractPhoneNumber(twilioFormat: string): string {
  return twilioFormat.replace("whatsapp:", "");
}
