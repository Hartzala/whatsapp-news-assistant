import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  createSubscription,
  getSubscriptionByUserId,
  updateSubscription,
  getUserByOpenId,
} from "../db";
import type { InsertSubscription } from "../../drizzle/schema";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription as getStripeSubscription,
} from "../services/stripeService";

/**
 * Stripe payment router
 * Handles subscription creation, webhook events, and subscription management
 */
export const stripeRouter = router({
  /**
   * Create a Stripe checkout session for subscription
   * Returns a payment link for the user
   */
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = ctx.user;

      // Check if user already has an active subscription
      const existingSubscription = await getSubscriptionByUserId(user.id);
      if (existingSubscription && existingSubscription.status === "active") {
        return {
          success: false,
          error: "Vous avez déjà un abonnement actif",
        };
      }

      // Extract phone number from openId (format: whatsapp:+33612345678)
      const phoneNumber = user.openId.startsWith('whatsapp:') 
        ? user.openId.replace('whatsapp:', '') 
        : "";

      // Create Stripe Checkout Session
      const result = await createCheckoutSession(
        user.email || "",
        user.id,
        phoneNumber
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erreur lors de la création de la session",
        };
      }

      return {
        success: true,
        checkoutUrl: result.sessionUrl,
        sessionId: result.sessionId,
      };
    } catch (error) {
      console.error("[Stripe Router] Error creating checkout session:", error);
      return {
        success: false,
        error: "Erreur lors de la création de la session de paiement",
      };
    }
  }),

  /**
   * Create a Stripe Customer Portal session
   */
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await getSubscriptionByUserId(ctx.user.id);

      if (!subscription || !subscription.stripeCustomerId) {
        return {
          success: false,
          error: "Aucun abonnement trouvé",
        };
      }

      const result = await createPortalSession(subscription.stripeCustomerId);

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Erreur lors de la création de la session",
        };
      }

      return {
        success: true,
        portalUrl: result.portalUrl,
      };
    } catch (error) {
      console.error("[Stripe Router] Error creating portal session:", error);
      return {
        success: false,
        error: "Erreur lors de la création de la session portail",
      };
    }
  }),

  /**
   * Get current subscription status
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscription = await getSubscriptionByUserId(ctx.user.id);

      if (!subscription) {
        return {
          hasSubscription: false,
          subscription: null,
        };
      }

      // Optionally sync with Stripe
      if (subscription.stripeSubscriptionId) {
        const stripeSubscription = await getStripeSubscription(
          subscription.stripeSubscriptionId
        );

        if (stripeSubscription) {
          // Update local subscription if status changed
          if (stripeSubscription.status !== subscription.status) {
            await updateSubscription(subscription.id, {
              status: stripeSubscription.status,
            } as Partial<InsertSubscription>);
          }
        }
      }

      return {
        hasSubscription: subscription.status === "active",
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        },
      };
    } catch (error) {
      console.error("[Stripe Router] Error fetching subscription:", error);
      return {
        hasSubscription: false,
        subscription: null,
        error: "Erreur lors de la récupération de l'abonnement",
      };
    }
  }),
});
