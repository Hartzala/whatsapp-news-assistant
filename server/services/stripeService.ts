/**
 * Stripe Service
 * Handles subscription management with Stripe
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || "http://localhost:3000";

// Initialize Stripe client
let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  if (!stripeClient && STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
    });
  }
  return stripeClient;
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  userEmail: string,
  userId: number,
  phoneNumber: string
): Promise<{
  success: boolean;
  sessionUrl?: string;
  sessionId?: string;
  error?: string;
}> {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      console.error("[Stripe] Client not initialized. Check STRIPE_SECRET_KEY");
      return {
        success: false,
        error: "Stripe client not configured",
      };
    }

    if (!STRIPE_PRICE_ID) {
      console.error("[Stripe] STRIPE_PRICE_ID not configured");
      return {
        success: false,
        error: "Stripe price ID not configured",
      };
    }

    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customer: Stripe.Customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId.toString(),
          phoneNumber,
        },
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/dashboard?canceled=true`,
      metadata: {
        userId: userId.toString(),
        phoneNumber,
      },
    });

    console.log(`[Stripe] Checkout session created: ${session.id}`);

    return {
      success: true,
      sessionUrl: session.url || undefined,
      sessionId: session.id,
    };
  } catch (error: any) {
    console.error("[Stripe] Error creating checkout session:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Create a Stripe Customer Portal Session
 */
export async function createPortalSession(
  customerId: string
): Promise<{
  success: boolean;
  portalUrl?: string;
  error?: string;
}> {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe client not configured",
      };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${FRONTEND_URL}/dashboard`,
    });

    return {
      success: true,
      portalUrl: session.url,
    };
  } catch (error: any) {
    console.error("[Stripe] Error creating portal session:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Retrieve a Stripe Subscription
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return null;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("[Stripe] Error retrieving subscription:", error);
    return null;
  }
}

/**
 * Cancel a Stripe Subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return {
        success: false,
        error: "Stripe client not configured",
      };
    }

    await stripe.subscriptions.cancel(subscriptionId);

    console.log(`[Stripe] Subscription canceled: ${subscriptionId}`);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("[Stripe] Error canceling subscription:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      console.error("[Stripe] Client not initialized");
      return null;
    }

    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error: any) {
    console.error("[Stripe] Webhook signature verification failed:", error.message);
    return null;
  }
}
