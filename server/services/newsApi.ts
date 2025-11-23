/**
 * NewsAPI.ai Service
 * Handles fetching news articles based on topics using the official NewsAPI.ai API
 * Endpoint: https://eventregistry.org/api/v1/article/getArticles
 */

export interface NewsArticle {
  title: string;
  body: string;
  url: string;
  image?: string;
  source: {
    title: string;
  };
  dateTime: string;
  sentiment?: number;
  relevance?: number;
}

interface NewsApiAiResponse {
  articles: {
    results: NewsArticle[];
    totalResults: number;
  };
}

const NEWS_API_KEY = process.env.NEWS_API_KEY || "";
const NEWS_API_BASE_URL = "https://eventregistry.org/api/v1";

// Mapping des thèmes français vers les mots-clés de recherche
const TOPIC_KEYWORDS: Record<string, string> = {
  "Technologie": "technology AI software",
  "Finance": "finance stock market economy",
  "Sport": "sport football basketball",
  "Politique": "politics government election",
  "Santé": "health medicine healthcare",
  "Science": "science research discovery",
  "Divertissement": "entertainment movie music",
  "Affaires": "business company startup",
  "Voyages": "travel tourism destination",
  "Environnement": "environment climate sustainability",
};

/**
 * Fetch news articles for a given topic using NewsAPI.ai
 */
export async function fetchNewsByTopic(
  topic: string,
  limit: number = 10,
  daysBack: number = 7
): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.error("NEWS_API_KEY is not set");
    return [];
  }

  try {
    // Get the keyword for this topic
    const keyword = TOPIC_KEYWORDS[topic] || topic;
    console.log(`[NewsAPI] Fetching news for topic "${topic}" with keyword "${keyword}"`);

    // Calculate date range
    const dateEnd = new Date();
    const dateStart = new Date(dateEnd);
    dateStart.setDate(dateStart.getDate() - daysBack);

    const requestBody = {
      action: "getArticles",
      keyword: keyword,
      articlesPage: 1,
      articlesCount: Math.min(limit, 100), // Max 100 per call
      articlesSortBy: "date", // Sort by date (most recent first)
      articlesSortByAsc: false, // Descending order (newest first)
      dataType: ["news", "pr"], // Include news and press releases
      forceMaxDataTimeWindow: daysBack <= 7 ? 7 : 31, // Optimize token usage
      resultType: "articles",
      apiKey: NEWS_API_KEY,
      // lang: "fra", // Removed to get more results - language detection done by AI
      articleBodyLen: 300, // Limit body length to 300 chars
    };

    console.log(`[NewsAPI] Request body:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${NEWS_API_BASE_URL}/article/getArticles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NewsAPI] Error ${response.status}: ${response.statusText}`);
      console.error(`[NewsAPI] Error details:`, errorText);
      return [];
    }

    const data: NewsApiAiResponse = await response.json();

    if (!data.articles || !data.articles.results) {
      console.warn(`[NewsAPI] No articles found for topic: ${topic}`);
      console.warn(`[NewsAPI] Response data:`, JSON.stringify(data, null, 2));
      return [];
    }

    const articles = data.articles.results.slice(0, limit);
    console.log(`[NewsAPI] Successfully fetched ${articles.length} articles for topic "${topic}"`);
    return articles;
  } catch (error) {
    console.error(`Error fetching news for topic "${topic}":`, error);
    return [];
  }
}

/**
 * Fetch news for multiple topics
 */
export async function fetchNewsByTopics(
  topics: string[],
  limit: number = 10,
  daysBack: number = 7
): Promise<Map<string, NewsArticle[]>> {
  const results = new Map<string, NewsArticle[]>();

  // Fetch articles for each topic in parallel
  const promises = topics.map(async (topic) => {
    const articles = await fetchNewsByTopic(topic, limit, daysBack);
    results.set(topic, articles);
  });

  await Promise.all(promises);

  return results;
}

/**
 * Format articles for synthesis
 */
export function formatArticlesForSynthesis(
  articles: NewsArticle[],
  maxLength: number = 4000
): string {
  if (articles.length === 0) {
    return "Aucun article trouvé pour ce thème.";
  }

  let synthesis = "";

  for (const article of articles) {
    // Format date
    const pubDate = new Date(article.dateTime);
    const formattedDate = pubDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create article snippet
    const articleText = `
📰 **${article.title}**
${article.body || ""}
🔗 [Lire l'article complet](${article.url})
Source: ${article.source.title} | ${formattedDate}
${article.sentiment ? `Sentiment: ${article.sentiment > 0 ? "Positif" : article.sentiment < 0 ? "Négatif" : "Neutre"}` : ""}
---
`;

    // Check if adding this article would exceed max length
    if ((synthesis + articleText).length > maxLength) {
      // Add a note about truncation
      synthesis += "\n... (synthèse tronquée pour limiter la taille du message)";
      break;
    }

    synthesis += articleText;
  }

  return synthesis.trim();
}

/**
 * Generate a comprehensive synthesis from multiple topics
 */
export async function generateSynthesis(
  topics: string[],
  articlesPerTopic: number = 5,
  daysBack: number = 7
): Promise<string> {
  try {
    // Fetch articles for all topics
    const articlesByTopic = await fetchNewsByTopics(topics, articlesPerTopic, daysBack);

    if (articlesByTopic.size === 0) {
      return "Aucun article trouvé pour les thèmes sélectionnés.";
    }

    // Build synthesis
    let synthesis = `📰 **Synthèse d'Actualités** - ${new Date().toLocaleDateString("fr-FR")}\n\n`;

    articlesByTopic.forEach((articles, topic) => {
      if (articles.length > 0) {
        synthesis += `## ${topic}\n`;
        synthesis += formatArticlesForSynthesis(articles, 2000);
        synthesis += "\n\n";
      }
    });

    return synthesis;
  } catch (error) {
    console.error("Error generating synthesis:", error);
    return "Erreur lors de la génération de la synthèse.";
  }
}
