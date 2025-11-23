import { invokeLLM } from "../_core/llm";

export type ConversationState = "greeting" | "selecting_topics" | "selecting_frequency" | "confirming_setup" | "active";

export interface UserContext {
  phoneNumber: string;
  userId?: number;
  state: ConversationState;
  selectedTopics: string[];
  selectedFrequency?: "daily" | "weekly";
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>;
  isFirstMessage: boolean;
  createdAt: Date;
  lastMessageAt: Date;
}

// In-memory store for conversation contexts (in production, use database)
const contextStore = new Map<string, UserContext>();

export function initializeContext(phoneNumber: string): UserContext {
  const context: UserContext = {
    phoneNumber,
    state: "greeting",
    selectedTopics: [],
    messageHistory: [],
    isFirstMessage: true,
    createdAt: new Date(),
    lastMessageAt: new Date(),
  };
  contextStore.set(phoneNumber, context);
  return context;
}

export function getContext(phoneNumber: string): UserContext {
  let context = contextStore.get(phoneNumber);
  if (!context) {
    context = initializeContext(phoneNumber);
  }
  context.lastMessageAt = new Date();
  return context;
}

export function updateContext(phoneNumber: string, updates: Partial<UserContext>): UserContext {
  const context = getContext(phoneNumber);
  const updated = { ...context, ...updates };
  contextStore.set(phoneNumber, updated);
  return updated;
}

export async function analyzeUserIntent(
  userMessage: string,
  context: UserContext
): Promise<{
  intent: "greeting" | "set_topics" | "set_frequency" | "confirm" | "help" | "ask_question" | "other";
  confidence: number;
  extractedData?: {
    topics?: string[];
    frequency?: "daily" | "weekly";
  };
}> {
  const systemPrompt = `You are an AI assistant that analyzes user messages to understand their intent in a WhatsApp conversation about news subscriptions.

Current conversation state: ${context.state}
Selected topics so far: ${context.selectedTopics.join(", ") || "none"}
Selected frequency: ${context.selectedFrequency || "not set"}

Analyze the user's message and determine their intent. Respond with a JSON object containing:
- intent: one of "greeting", "set_topics", "set_frequency", "confirm", "help", "ask_question", "other"
- confidence: a number between 0 and 1 indicating how confident you are
- extractedData: optional object with extracted topics (array) or frequency (string)

If the user mentions topics like "tech", "technology", "finance", "sports", etc., extract them.
If they mention frequency like "daily", "every day", "weekly", "once a week", etc., extract it.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "intent_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            intent: {
              type: "string",
              enum: ["greeting", "set_topics", "set_frequency", "confirm", "help", "ask_question", "other"],
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            extractedData: {
              type: "object",
              properties: {
                topics: { type: "array", items: { type: "string" } },
                frequency: { type: "string", enum: ["daily", "weekly"] },
              },
            },
          },
          required: ["intent", "confidence"],
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") throw new Error("No response content");
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error("Failed to parse intent analysis:", error);
    return { intent: "other", confidence: 0 };
  }
}

export async function generateNaturalResponse(
  userMessage: string,
  context: UserContext,
  intent: string
): Promise<string> {
  const systemPrompt = `You are a friendly WhatsApp assistant for a news subscription service. 
You help users select news topics and delivery frequency for personalized news summaries.

Current state: ${context.state}
Selected topics: ${context.selectedTopics.join(", ") || "none"}
Selected frequency: ${context.selectedFrequency || "not set"}
Is first message: ${context.isFirstMessage}

Guidelines:
- Be conversational and friendly
- Use French language
- Keep responses concise (max 2-3 sentences per message)
- Use emojis sparingly
- Guide users through the setup process naturally
- If it's the first message, briefly explain what you do
- Available topics: Technologie, Finance, Sport, Politique, Santé, Environnement, Divertissement, Science, Affaires, Voyages
- Available frequencies: Quotidien (daily), Hebdomadaire (weekly)`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      ...context.messageHistory.slice(-4), // Keep last 4 messages for context
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  return "Je n'ai pas compris votre message. Pouvez-vous reformuler ?";
}

export function addMessageToHistory(context: UserContext, role: "user" | "assistant", content: string): void {
  context.messageHistory.push({ role, content });
  // Keep only last 10 messages to avoid token limits
  if (context.messageHistory.length > 10) {
    context.messageHistory = context.messageHistory.slice(-10);
  }
}

export function resetContext(phoneNumber: string): void {
  contextStore.delete(phoneNumber);
}

export function cleanupOldContexts(maxAgeHours: number = 24): void {
  const now = new Date();
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  const keysToDelete: string[] = [];
  contextStore.forEach((context, phoneNumber) => {
    if (now.getTime() - context.lastMessageAt.getTime() > maxAge) {
      keysToDelete.push(phoneNumber);
    }
  });

  keysToDelete.forEach((key) => contextStore.delete(key));
}
