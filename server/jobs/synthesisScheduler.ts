/**
 * Synthesis Scheduler Job
 * Runs periodically to generate and send syntheses to users
 */

import { getDb } from "../db";
import { users, userPreferences, subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateUserSynthesis, formatSynthesisForWhatsApp } from "../services/synthesisGenerator";
import { sendSynthesisToUser } from "../services/whatsappApi";
import { createSynthesis } from "../db";

/**
 * Check if a user should receive a synthesis at this time
 */
function shouldSendSynthesis(
  frequency: string,
  sendTime: string | null,
  timezone: string
): boolean {
  const now = new Date();

  // Convert to user's timezone
  const userTime = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  const currentHour = userTime.getHours();
  const currentMinute = userTime.getMinutes();
  const currentTime = `${String(currentHour).padStart(2, "0")}:${String(
    currentMinute
  ).padStart(2, "0")}`;

  if (frequency === "daily") {
    // Send at the specified time (default 08:00)
    const targetTime = sendTime || "08:00";
    return currentTime === targetTime;
  }

  if (frequency === "weekly") {
    // Send on Monday at 08:00
    const isMonday = userTime.getDay() === 1;
    const targetTime = sendTime || "08:00";
    return isMonday && currentTime === targetTime;
  }

  return false;
}

/**
 * Run the synthesis scheduler
 * This should be called periodically (e.g., every hour)
 */
export async function runSynthesisScheduler(): Promise<void> {
  console.log("[Scheduler] Starting synthesis generation job...");

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Scheduler] Database not available");
      return;
    }

    // Get all active users with preferences
    const activeUsers = await db
      .select({
        user: users,
        preferences: userPreferences,
        subscription: subscriptions,
      })
      .from(users)
      .innerJoin(userPreferences, eq(userPreferences.userId, users.id))
      .innerJoin(subscriptions, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.status, "active"));

    console.log(
      `[Scheduler] Found ${activeUsers.length} active users with preferences`
    );

    for (const { user, preferences, subscription } of activeUsers) {
      try {
        // Check if this user should receive a synthesis now
        if (
          !shouldSendSynthesis(
            preferences.frequency,
            preferences.sendTime,
            preferences.timezone
          )
        ) {
          continue;
        }

        // Parse topics
        const topics = preferences.topics
          ? JSON.parse(preferences.topics)
          : [];

        if (topics.length === 0) {
          console.log(
            `[Scheduler] User ${user.id} has no topics configured`
          );
          continue;
        }

        console.log(
          `[Scheduler] Generating synthesis for user ${user.id} (topics: ${topics.join(", ")})`
        );

        // Calculate days back based on frequency
        const daysBack = preferences.frequency === "daily" ? 1 : 7;

        console.log(
          `[Scheduler] Fetching articles from last ${daysBack} day(s)`
        );

        // Generate synthesis
        const synthesisResult = await generateUserSynthesis(topics, daysBack);

        if (!synthesisResult.success || !synthesisResult.content) {
          console.error(
            `[Scheduler] Failed to generate synthesis for user ${user.id}:`,
            synthesisResult.error
          );
          continue;
        }

        // Format for WhatsApp
        const formattedContent = formatSynthesisForWhatsApp(
          synthesisResult.content
        );

        // Send to WhatsApp
        if (user.whatsappPhoneNumber) {
          console.log(
            `[Scheduler] Sending synthesis to ${user.whatsappPhoneNumber}`
          );

          const sendResult = await sendSynthesisToUser(
            user.whatsappPhoneNumber,
            topics,
            formattedContent
          );

          if (sendResult.success) {
            // Save synthesis to database
            await createSynthesis({
              userId: user.id,
              topics: JSON.stringify(topics),
              content: formattedContent,
              articleCount: synthesisResult.articleCount || 0,
              whatsappMessageId: sendResult.messageId,
            });

            console.log(
              `[Scheduler] Synthesis sent successfully to user ${user.id}`
            );
          } else {
            console.error(
              `[Scheduler] Failed to send synthesis to user ${user.id}:`,
              sendResult.error
            );
          }
        } else {
          console.warn(
            `[Scheduler] User ${user.id} has no WhatsApp phone number`
          );
        }
      } catch (error) {
        console.error(
          `[Scheduler] Error processing user ${user.id}:`,
          error
        );
      }
    }

    console.log("[Scheduler] Synthesis generation job completed");
  } catch (error) {
    console.error("[Scheduler] Error running synthesis scheduler:", error);
  }
}

/**
 * Initialize the scheduler
 * This should be called when the server starts
 */
export function initializeSynthesisScheduler(): void {
  console.log("[Scheduler] Initializing synthesis scheduler...");

  // Run the scheduler every hour
  setInterval(() => {
    runSynthesisScheduler().catch((error) => {
      console.error("[Scheduler] Unexpected error:", error);
    });
  }, 60 * 60 * 1000); // 1 hour

  // Run immediately on startup
  runSynthesisScheduler().catch((error) => {
    console.error("[Scheduler] Initial run failed:", error);
  });
}
