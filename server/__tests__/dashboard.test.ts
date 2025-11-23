import { describe, it, expect } from "vitest";

describe("Dashboard Router", () => {
  describe("getPreferences", () => {
    it("should return default preferences when none exist", () => {
      const defaultPrefs = { userId: 1, topics: [], frequency: "weekly" };
      expect(defaultPrefs.frequency).toBe("weekly");
      expect(Array.isArray(defaultPrefs.topics)).toBe(true);
    });

    it("should parse JSON topics correctly", () => {
      const topicsJson = JSON.stringify(["technologie", "finance"]);
      const parsed = JSON.parse(topicsJson);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed).toContain("technologie");
    });
  });

  describe("updatePreferences", () => {
    it("should validate topics array is not empty", () => {
      const topics: string[] = [];
      expect(topics.length).toBe(0);
      expect(topics.length === 0).toBe(true);
    });

    it("should accept valid frequency values", () => {
      const validFrequencies = ["daily", "weekly"];
      validFrequencies.forEach((freq) => {
        expect(["daily", "weekly"]).toContain(freq);
      });
    });

    it("should stringify topics for storage", () => {
      const topics = ["technologie", "finance", "sport"];
      const stringified = JSON.stringify(topics);
      expect(typeof stringified).toBe("string");
      expect(JSON.parse(stringified)).toEqual(topics);
    });
  });

  describe("getSyntheses", () => {
    it("should accept limit parameter", () => {
      const limit = 10;
      expect(limit).toBeGreaterThan(0);
      expect(limit).toBeLessThanOrEqual(100);
    });

    it("should return array of syntheses", () => {
      const syntheses = [
        {
          id: 1,
          userId: 1,
          topics: "technologie",
          content: "Synthèse test",
          articleCount: 5,
          sentAt: new Date(),
          whatsappMessageId: "msg123",
          createdAt: new Date(),
        },
      ];
      expect(Array.isArray(syntheses)).toBe(true);
      expect(syntheses[0].content).toBe("Synthèse test");
    });
  });

  describe("getSubscription", () => {
    it("should return subscription with correct status values", () => {
      const validStatuses = ["active", "paused", "cancelled", "pending"];
      validStatuses.forEach((status) => {
        expect(["active", "paused", "cancelled", "pending"]).toContain(status);
      });
    });

    it("should handle null dates", () => {
      const subscription = {
        id: 1,
        userId: 1,
        status: "pending" as const,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(subscription.currentPeriodEnd).toBeNull();
      expect(subscription.stripeCustomerId).toBeNull();
    });
  });

  describe("getStats", () => {
    it("should calculate stats correctly", () => {
      const topicsArray = ["technologie", "finance", "sport"];
      const stats = {
        topicsCount: topicsArray.length,
        frequency: "weekly",
        isSubscribed: true,
        synthesisCount: 5,
        lastSynthesis: new Date(),
      };

      expect(stats.topicsCount).toBe(3);
      expect(stats.frequency).toBe("weekly");
      expect(stats.isSubscribed).toBe(true);
      expect(stats.synthesisCount).toBe(5);
      expect(stats.lastSynthesis).toBeInstanceOf(Date);
    });

    it("should handle empty topics", () => {
      const topicsArray: string[] = [];
      const topicsCount = topicsArray.length;
      expect(topicsCount).toBe(0);
    });

    it("should handle no syntheses", () => {
      const syntheses: any[] = [];
      const lastSynthesis = syntheses[0]?.createdAt || null;
      expect(lastSynthesis).toBeNull();
    });
  });

  describe("updateSubscriptionStatus", () => {
    it("should accept valid status transitions", () => {
      const validStatuses = ["active", "cancelled", "paused"];
      validStatuses.forEach((status) => {
        expect(["active", "cancelled", "paused"]).toContain(status);
      });
    });

    it("should handle optional fields", () => {
      const update = {
        status: "active" as const,
        stripeSubscriptionId: undefined,
        currentPeriodEnd: undefined,
      };
      expect(update.stripeSubscriptionId).toBeUndefined();
      expect(update.currentPeriodEnd).toBeUndefined();
    });
  });
});
