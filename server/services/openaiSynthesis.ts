/**
 * OpenAI Synthesis Service
 * Generates news summaries using OpenAI GPT models
 */

import OpenAI from "openai";
import { fetchNewsByTopics, NewsArticle } from "./googleNewsRss";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openaiClient && OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Generate a synthesis using OpenAI
 */
export async function generateSynthesisWithOpenAI(
  topics: string[],
  articlesPerTopic: number = 5,
  daysBack: number = 7,
  userQuestion?: string
): Promise<{
  success: boolean;
  synthesis?: string;
  error?: string;
}> {
  try {
    const client = getOpenAIClient();

    if (!client) {
      console.error("[OpenAI] Client not initialized. Check OPENAI_API_KEY");
      return {
        success: false,
        error: "OpenAI client not configured",
      };
    }

    // Fetch articles for all topics
    console.log(`[OpenAI] Fetching articles for topics: ${topics.join(", ")}`);
    const articlesByTopic = await fetchNewsByTopics(topics, articlesPerTopic, daysBack);

    if (articlesByTopic.size === 0) {
      return {
        success: false,
        error: "No articles found for the given topics",
      };
    }

    // Build article text for OpenAI
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

    console.log(`[OpenAI] Generating synthesis for ${totalArticles} articles`);

    // Generate synthesis with OpenAI
    const systemPrompt = userQuestion
      ? `Tu es un assistant spécialisé qui répond aux questions sur l'actualité.
Ta mission est de répondre DIRECTEMENT à la question posée en te basant sur les articles fournis.
Utilise un ton professionnel mais accessible.
Sois précis et factuel.
Si les articles ne contiennent pas d'information pertinente pour la question, dis-le clairement.
Limite ta réponse à 2000 caractères maximum.`
      : `Tu es un assistant spécialisé dans la synthèse d'actualités.
Ta mission est de créer des résumés clairs, concis et informatifs en français.
Structure ta réponse par thème, en mettant en avant les informations les plus importantes.
Utilise un ton professionnel mais accessible.
Limite ta synthèse à 2000 caractères maximum.`;

    const userPrompt = userQuestion
      ? `Question de l'utilisateur : "${userQuestion}"

Voici les articles d'actualité récents :

${articlesText}

Réponds à la question en te basant sur ces articles. Sois direct et précis.`
      : `Crée une synthèse d'actualités à partir des articles suivants :

${articlesText}

Organise la synthèse par thème et mets en avant les points clés de chaque article.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const synthesis = completion.choices[0]?.message?.content;

    if (!synthesis) {
      return {
        success: false,
        error: "OpenAI returned empty response",
      };
    }

    console.log(`[OpenAI] Synthesis generated successfully (${synthesis.length} chars)`);

    return {
      success: true,
      synthesis,
    };
  } catch (error: any) {
    console.error("[OpenAI] Error generating synthesis:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Generate a personalized synthesis for a user
 */
export async function generatePersonalizedSynthesis(
  topics: string[],
  frequency: "daily" | "weekly"
): Promise<string> {
  try {
    const daysBack = frequency === "daily" ? 1 : 7;
    const articlesPerTopic = frequency === "daily" ? 3 : 5;

    const result = await generateSynthesisWithOpenAI(topics, articlesPerTopic, daysBack);

    if (!result.success || !result.synthesis) {
      return "Désolé, je n'ai pas pu générer de synthèse pour le moment. Veuillez réessayer plus tard.";
    }

    // Add header
    const header = `📰 **Synthèse ${frequency === "daily" ? "Quotidienne" : "Hebdomadaire"}**
${new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

`;

    return header + result.synthesis;
  } catch (error) {
    console.error("[OpenAI] Error generating personalized synthesis:", error);
    return "Une erreur s'est produite lors de la génération de la synthèse.";
  }
}

/**
 * Format articles for WhatsApp message (fallback if OpenAI fails)
 */
export function formatArticlesForWhatsApp(
  articlesByTopic: Map<string, NewsArticle[]>,
  maxLength: number = 4000
): string {
  let message = `📰 **Synthèse d'Actualités**\n${new Date().toLocaleDateString("fr-FR")}\n\n`;

  articlesByTopic.forEach((articles, topic) => {
    if (articles.length > 0) {
      message += `## ${topic}\n\n`;

      for (const article of articles) {
        const snippet = `📌 **${article.title}**\n${article.body?.substring(0, 150) || ""}...\n🔗 ${article.url}\n\n`;

        if ((message + snippet).length > maxLength) {
          message += "\n... (synthèse tronquée)\n";
          break;
        }

        message += snippet;
      }
    }
  });

  return message;
}
