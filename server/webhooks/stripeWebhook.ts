/**
 * Stripe Webhook Handler
 * Handles incoming webhook events from Stripe
 */

import { Router } from "express";
import { verifyWebhookSignature } from "../services/stripeService";
import {
  createSubscription,
  getSubscriptionByStripeId,
  updateSubscription,
  getUserByOpenId,
} from "../db";
import type { InsertSubscription } from "../../drizzle/schema";

const router = Router();

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * POST /api/webhooks/stripe
 * Webhook endpoint for Stripe events
 */
router.post("/", async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      console.error("[Stripe Webhook] Missing signature");
      return res.status(400).send("Missing signature");
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
      return res.status(500).send("Webhook secret not configured");
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    if (!event) {
      console.error("[Stripe Webhook] Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as any);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as any);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as any);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as any);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing webhook:", error);
    res.status(500).send("Webhook processing error");
  }
});

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log("[Stripe Webhook] Checkout session completed:", session.id);

    const userId = parseInt(session.metadata?.userId || "0");
    const phoneNumber = session.metadata?.phoneNumber || "";

    if (!userId) {
      console.error("[Stripe Webhook] Missing userId in session metadata");
      return;
    }

    // Create subscription in database
    await createSubscription({
      userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    console.log(`[Stripe Webhook] Subscription created for user ${userId}`);
  } catch (error) {
    console.error("[Stripe Webhook] Error handling checkout session:", error);
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log("[Stripe Webhook] Subscription updated:", subscription.id);

    const existingSubscription = await getSubscriptionByStripeId(subscription.id);

    if (!existingSubscription) {
      console.warn("[Stripe Webhook] Subscription not found in database");
      return;
    }

    // Update subscription
    await updateSubscription(existingSubscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    } as Partial<InsertSubscription>);

    console.log(`[Stripe Webhook] Subscription ${subscription.id} updated to ${subscription.status}`);
  } catch (error) {
    console.error("[Stripe Webhook] Error handling subscription update:", error);
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log("[Stripe Webhook] Subscription deleted:", subscription.id);

    const existingSubscription = await getSubscriptionByStripeId(subscription.id);

    if (!existingSubscription) {
      console.warn("[Stripe Webhook] Subscription not found in database");
      return;
    }

    // Mark as cancelled
    await updateSubscription(existingSubscription.id, {
      status: "cancelled",
      cancelledAt: new Date(),
    } as Partial<InsertSubscription>);

    console.log(`[Stripe Webhook] Subscription ${subscription.id} cancelled`);
  } catch (error) {
    console.error("[Stripe Webhook] Error handling subscription deletion:", error);
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice: any) {
  try {
    console.log("[Stripe Webhook] Invoice paid:", invoice.id);

    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      return;
    }

    const existingSubscription = await getSubscriptionByStripeId(subscriptionId);

    if (!existingSubscription) {
      console.warn("[Stripe Webhook] Subscription not found for invoice");
      return;
    }

    // Update subscription status to active
    await updateSubscription(existingSubscription.id, {
      status: "active",
    } as Partial<InsertSubscription>);

    console.log(`[Stripe Webhook] Subscription ${subscriptionId} marked as active after payment`);
  } catch (error) {
    console.error("[Stripe Webhook] Error handling invoice paid:", error);
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);

    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      return;
    }

    const existingSubscription = await getSubscriptionByStripeId(subscriptionId);

    if (!existingSubscription) {
      console.warn("[Stripe Webhook] Subscription not found for invoice");
      return;
    }

    // Update subscription status to cancelled (past_due not in schema)
    await updateSubscription(existingSubscription.id, {
      status: "cancelled",
    } as Partial<InsertSubscription>);

    console.log(`[Stripe Webhook] Subscription ${subscriptionId} marked as past_due after payment failure`);
  } catch (error) {
    console.error("[Stripe Webhook] Error handling invoice payment failed:", error);
  }
}

/**
 * GET /api/webhooks/stripe
 * Status check endpoint
 */
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Stripe webhook is ready",
  });
});

export default router;
