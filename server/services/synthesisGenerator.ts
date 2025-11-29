/**
 * Synthesis Generator Service
 * Uses LLM to generate news summaries from articles
 */

import { generateSynthesisWithOpenAI } from "./openaiSynthesis";
import { fetchNewsByTopics, formatArticlesForSynthesis } from "./googleNewsRss";

interface SynthesisResult {
  success: boolean;
  content?: string;
  articleCount?: number;
  error?: string;
}

/**
 * Generate a synthesis for given topics
 */
export async function generateSynthesis(
  topics: string[]
): Promise<SynthesisResult> {
  try {
    // Fetch articles for all topics
    const articlesByTopic = await fetchNewsByTopics(topics, 5);

    if (articlesByTopic.size === 0) {
      return {
        success: false,
        error: "No articles found for the given topics",
      };
    }

    // Prepare articles text for LLM
    let articlesText = "";
    let totalArticles = 0;

    articlesByTopic.forEach((articles, topic) => {
      if (articles.length > 0) {
        articlesText += `\n## ${topic.toUpperCase()}\n`;
        for (const article of articles) {
          articlesText += `
- **${article.title}**
  ${article.body?.substring(0, 300) || ""}
  Source: ${article.source.title}
`;
          totalArticles++;
        }
      }
    });

    if (totalArticles === 0) {
      return {
        success: false,
        error: "No articles found for the given topics",
      };
    }

    // Use OpenAI to generate synthesis
    const result = await generateSynthesisWithOpenAI(topics, 5, 7);

    if (!result.success || !result.synthesis) {
      return {
        success: false,
        error: result.error || "Failed to generate synthesis",
      };
    }

    const synthesisContent = result.synthesis;

    return {
      success: true,
      content: synthesisContent,
      articleCount: totalArticles,
    };
  } catch (error) {
    console.error("Error generating synthesis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate a synthesis for a user with their preferences
 */
export async function generateUserSynthesis(
  topics: string[],
  daysBack: number = 7
): Promise<SynthesisResult> {
  if (!topics || topics.length === 0) {
    return {
      success: false,
      error: "No topics provided",
    };
  }

  try {
    // Use OpenAI to generate synthesis with specified days back
    const result = await generateSynthesisWithOpenAI(topics, 5, daysBack);

    if (!result.success || !result.synthesis) {
      return {
        success: false,
        error: result.error || "Failed to generate synthesis",
      };
    }

    return {
      success: true,
      content: result.synthesis,
      articleCount: 0, // OpenAI service doesn't return article count
    };
  } catch (error) {
    console.error("Error generating user synthesis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format synthesis for WhatsApp message
 */
export function formatSynthesisForWhatsApp(
  synthesisContent: string,
  maxLength: number = 4096
): string {
  // WhatsApp has a 4096 character limit per message
  if (synthesisContent.length > maxLength) {
    return synthesisContent.substring(0, maxLength - 3) + "...";
  }

  return synthesisContent;
}
