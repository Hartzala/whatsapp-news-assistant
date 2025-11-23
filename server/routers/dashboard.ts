import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserPreferences,
  createOrUpdateUserPreferences,
  getUserSyntheses,
  getSubscriptionByUserId,
  updateSubscription,
} from "../db";

export const dashboardRouter = router({
  // Get user preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await getUserPreferences(ctx.user.id);
    return preferences || { userId: ctx.user.id, topics: [], frequency: "weekly" };
  }),

  // Update user preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        topics: z.array(z.string()).min(1, "Au moins un thème est requis"),
        frequency: z.enum(["daily", "weekly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const preferences = await createOrUpdateUserPreferences(ctx.user.id, {
        topics: JSON.stringify(input.topics),
        frequency: input.frequency,
      });
      return preferences;
    }),

  // Get user syntheses history
  getSyntheses: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const syntheses = await getUserSyntheses(ctx.user.id, input.limit);
      return syntheses;
    }),

  // Get subscription status
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getSubscriptionByUserId(ctx.user.id);
    return subscription || {
      id: 0,
      userId: ctx.user.id,
      status: "pending",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),

  // Update subscription status (for webhook handling)
  updateSubscriptionStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "cancelled", "paused"]),
        stripeSubscriptionId: z.string().optional(),
        currentPeriodEnd: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userSub = await getSubscriptionByUserId(ctx.user.id);
      if (!userSub) throw new Error("Subscription not found");
      
      const subscription = await updateSubscription(userSub.id, {
        status: input.status,
        stripeSubscriptionId: input.stripeSubscriptionId,
        currentPeriodEnd: input.currentPeriodEnd,
      });
      return subscription;
    }),

  // Get dashboard stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await getUserPreferences(ctx.user.id);
    const subscription = await getSubscriptionByUserId(ctx.user.id);
    const syntheses = await getUserSyntheses(ctx.user.id, 100);

    const topicsArray = preferences?.topics ? JSON.parse(preferences.topics) : [];

    return {
      topicsCount: Array.isArray(topicsArray) ? topicsArray.length : 0,
      frequency: preferences?.frequency || "weekly",
      isSubscribed: subscription?.status === "active",
      synthesisCount: syntheses?.length || 0,
      lastSynthesis: syntheses?.[0]?.createdAt || null,
    };
  })
});
