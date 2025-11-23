import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  /** WhatsApp phone number (international format: +33612345678) */
  whatsappPhoneNumber: varchar("whatsappPhoneNumber", { length: 20 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table - tracks user subscriptions to the service
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  status: mysqlEnum("status", ["active", "paused", "cancelled", "pending"]).default("pending").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * User preferences table - stores user's selected topics and frequency
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  topics: text("topics"), // JSON array of selected topics
  frequency: mysqlEnum("frequency", ["daily", "weekly"]).default("weekly").notNull(),
  sendTime: varchar("sendTime", { length: 5 }), // HH:MM format for daily sends
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Syntheses table - stores history of sent syntheses
 */
export const syntheses = mysqlTable("syntheses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topics: text("topics"), // JSON array of topics for this synthesis
  content: text("content").notNull(), // The actual synthesis text
  articleCount: int("articleCount").default(0).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  whatsappMessageId: varchar("whatsappMessageId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Synthesis = typeof syntheses.$inferSelect;
export type InsertSynthesis = typeof syntheses.$inferInsert;

/**
 * Articles cache table - stores fetched articles to avoid duplicate API calls
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  url: varchar("url", { length: 768 }).notNull().unique(), // Max 768 chars for MySQL index limit (768*4=3072 bytes)
  imageUrl: varchar("imageUrl", { length: 2048 }),
  source: varchar("source", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  publishedAt: timestamp("publishedAt"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  preferences: many(userPreferences),
  syntheses: many(syntheses),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const synthesisRelations = relations(syntheses, ({ one }) => ({
  user: one(users, {
    fields: [syntheses.userId],
    references: [users.id],
  }),
}));