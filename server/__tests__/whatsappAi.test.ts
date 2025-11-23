import { describe, it, expect, beforeEach } from "vitest";
import {
  getContext,
  updateContext,
  initializeContext,
  resetContext,
  addMessageToHistory,
  cleanupOldContexts,
  ConversationState,
} from "../services/conversationContext";

describe("WhatsApp AI Conversation Context", () => {
  const testPhone = "+33612345678";

  beforeEach(() => {
    resetContext(testPhone);
  });

  describe("Context Initialization", () => {
    it("should initialize a new context for a phone number", () => {
      const context = initializeContext(testPhone);

      expect(context.phoneNumber).toBe(testPhone);
      expect(context.state).toBe("greeting");
      expect(context.selectedTopics).toEqual([]);
      expect(context.messageHistory).toEqual([]);
      expect(context.isFirstMessage).toBe(true);
    });

    it("should retrieve existing context", () => {
      initializeContext(testPhone);
      const context = getContext(testPhone);

      expect(context.phoneNumber).toBe(testPhone);
      expect(context.isFirstMessage).toBe(true);
    });

    it("should create context if it doesn't exist", () => {
      const context = getContext(testPhone);

      expect(context).toBeDefined();
      expect(context.phoneNumber).toBe(testPhone);
    });
  });

  describe("Context Updates", () => {
    it("should update context state", () => {
      initializeContext(testPhone);
      const updated = updateContext(testPhone, { state: "selecting_topics" });

      expect(updated.state).toBe("selecting_topics");
    });

    it("should update selected topics", () => {
      initializeContext(testPhone);
      const updated = updateContext(testPhone, {
        selectedTopics: ["Technologie", "Finance"],
      });

      expect(updated.selectedTopics).toEqual(["Technologie", "Finance"]);
    });

    it("should update frequency", () => {
      initializeContext(testPhone);
      const updated = updateContext(testPhone, { selectedFrequency: "daily" });

      expect(updated.selectedFrequency).toBe("daily");
    });

    it("should mark first message as false", () => {
      const context = initializeContext(testPhone);
      expect(context.isFirstMessage).toBe(true);

      updateContext(testPhone, { isFirstMessage: false });
      const updated = getContext(testPhone);

      expect(updated.isFirstMessage).toBe(false);
    });
  });

  describe("Message History", () => {
    it("should add user message to history", () => {
      const context = initializeContext(testPhone);
      addMessageToHistory(context, "user", "Bonjour");

      expect(context.messageHistory.length).toBe(1);
      expect(context.messageHistory[0].role).toBe("user");
      expect(context.messageHistory[0].content).toBe("Bonjour");
    });

    it("should add assistant message to history", () => {
      const context = initializeContext(testPhone);
      addMessageToHistory(context, "assistant", "Bienvenue!");

      expect(context.messageHistory.length).toBe(1);
      expect(context.messageHistory[0].role).toBe("assistant");
      expect(context.messageHistory[0].content).toBe("Bienvenue!");
    });

    it("should maintain message history order", () => {
      const context = initializeContext(testPhone);
      addMessageToHistory(context, "user", "Message 1");
      addMessageToHistory(context, "assistant", "Response 1");
      addMessageToHistory(context, "user", "Message 2");

      expect(context.messageHistory.length).toBe(3);
      expect(context.messageHistory[0].content).toBe("Message 1");
      expect(context.messageHistory[1].content).toBe("Response 1");
      expect(context.messageHistory[2].content).toBe("Message 2");
    });

    it("should limit message history to 10 messages", () => {
      const context = initializeContext(testPhone);

      for (let i = 0; i < 15; i++) {
        addMessageToHistory(context, "user", `Message ${i}`);
      }

      expect(context.messageHistory.length).toBe(10);
      // Should keep the last 10 messages
      expect(context.messageHistory[0].content).toBe("Message 5");
      expect(context.messageHistory[9].content).toBe("Message 14");
    });
  });

  describe("Conversation States", () => {
    it("should support all valid states", () => {
      const validStates: ConversationState[] = [
        "greeting",
        "selecting_topics",
        "selecting_frequency",
        "confirming_setup",
        "active",
      ];

      validStates.forEach((state) => {
        initializeContext(testPhone);
        const updated = updateContext(testPhone, { state });
        expect(updated.state).toBe(state);
        resetContext(testPhone);
      });
    });
  });

  describe("Context Cleanup", () => {
    it("should remove old contexts", () => {
      const context = initializeContext(testPhone);
      // Simulate old context by setting lastMessageAt to 25 hours ago
      context.lastMessageAt = new Date(Date.now() - 25 * 60 * 60 * 1000);

      cleanupOldContexts(24);

      // Context should be deleted
      const newContext = getContext(testPhone);
      expect(newContext.isFirstMessage).toBe(true); // New context created
    });

    it("should not remove recent contexts", () => {
      const context = initializeContext(testPhone);
      context.selectedTopics = ["Technologie"];

      cleanupOldContexts(24);

      const retrieved = getContext(testPhone);
      expect(retrieved.selectedTopics).toEqual(["Technologie"]);
    });
  });

  describe("Context Reset", () => {
    it("should reset context for a phone number", () => {
      initializeContext(testPhone);
      updateContext(testPhone, { selectedTopics: ["Tech"] });

      resetContext(testPhone);

      const newContext = getContext(testPhone);
      expect(newContext.selectedTopics).toEqual([]);
      expect(newContext.isFirstMessage).toBe(true);
    });
  });

  describe("Timestamp Management", () => {
    it("should update lastMessageAt on context retrieval", () => {
      const context = initializeContext(testPhone);
      const initialTime = context.lastMessageAt;

      // Wait a bit and retrieve again
      setTimeout(() => {
        const retrieved = getContext(testPhone);
        expect(retrieved.lastMessageAt.getTime()).toBeGreaterThanOrEqual(
          initialTime.getTime()
        );
      }, 10);
    });
  });
});
