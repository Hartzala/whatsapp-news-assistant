/**
 * Google News RSS Service
 * Handles fetching news articles from Google News RSS feeds
 * Free, unlimited, and reliable for French news
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

// Mapping des thèmes français vers les requêtes Google News
const TOPIC_QUERIES: Record<string, string> = {
  "Technologie": "technologie OR tech OR numérique OR intelligence artificielle",
  "Finance": "finance OR bourse OR économie OR marché",
  "Sport": "sport OR football OR tennis OR rugby",
  "Politique": "politique OR gouvernement OR élection",
  "Santé": "santé OR médecine OR santé publique",
  "Science": "science OR recherche OR découverte",
  "Divertissement": "divertissement OR cinéma OR musique OR culture",
  "Affaires": "affaires OR entreprise OR startup OR business",
  "Voyages": "voyage OR tourisme OR destination",
  "Environnement": "environnement OR climat OR écologie",
  "Actualités": "actualité OR news OR france", // Topic générique
};

/**
 * Parse Google News RSS feed XML
 */
async function parseGoogleNewsRss(xml: string): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  
  try {
    // Extract items using regex (simple XML parsing)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = xml.match(itemRegex) || [];
    
    for (const item of items) {
      // Extract title
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const title = titleMatch ? titleMatch[1] : "";
      
      // Extract link
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const url = linkMatch ? linkMatch[1] : "";
      
      // Extract description (body)
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      let body = descMatch ? descMatch[1] : "";
      
      // Clean HTML tags from description
      body = body.replace(/<[^>]*>/g, "").trim();
      // Limit body to 300 characters
      if (body.length > 300) {
        body = body.substring(0, 297) + "...";
      }
      
      // Extract pub date
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const dateTime = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
      
      // Extract source from title (format: "Title - Source")
      const sourceParts = title.split(" - ");
      const sourceTitle = sourceParts.length > 1 ? sourceParts[sourceParts.length - 1] : "Google News";
      const cleanTitle = sourceParts.length > 1 ? sourceParts.slice(0, -1).join(" - ") : title;
      
      articles.push({
        title: cleanTitle,
        body,
        url,
        source: {
          title: sourceTitle,
        },
        dateTime,
      });
    }
    
    return articles;
  } catch (error) {
    console.error("[Google News RSS] Error parsing XML:", error);
    return [];
  }
}

/**
 * Fetch news articles for a given topic using Google News RSS
 */
export async function fetchNewsByTopic(
  topic: string,
  limit: number = 10,
  daysBack: number = 7
): Promise<NewsArticle[]> {
  try {
    // Get the query for this topic
    const query = TOPIC_QUERIES[topic] || topic;
    console.log(`[Google News RSS] Fetching news for topic "${topic}" with query "${query}"`);
    
    // Build Google News RSS URL
    // Parameters:
    // - q: search query
    // - hl: language (fr for French)
    // - gl: country (FR for France)
    // - ceid: country+language code
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=fr&gl=FR&ceid=FR:fr`;
    
    console.log(`[Google News RSS] Fetching from URL: ${rssUrl}`);
    
    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WhatsAppNewsBot/1.0)",
      },
    });
    
    if (!response.ok) {
      console.error(`[Google News RSS] Error ${response.status}: ${response.statusText}`);
      return [];
    }
    
    const xml = await response.text();
    const articles = await parseGoogleNewsRss(xml);
    
    // Filter by date if needed
    if (daysBack > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      
      console.log(`[Google News RSS] Cutoff date: ${cutoffDate.toISOString()}`);
      console.log(`[Google News RSS] First 3 article dates: ${articles.slice(0, 3).map(a => a.dateTime).join(', ')}`);
      
      const filteredArticles = articles.filter(article => {
        const articleDate = new Date(article.dateTime);
        const isRecent = articleDate >= cutoffDate;
        if (!isRecent && articles.indexOf(article) < 3) {
          console.log(`[Google News RSS] Article "${article.title.substring(0, 50)}..." rejected: ${articleDate.toISOString()} < ${cutoffDate.toISOString()}`);
        }
        return isRecent;
      });
      
      console.log(`[Google News RSS] Filtered ${articles.length} articles to ${filteredArticles.length} (within ${daysBack} days)`);
      return filteredArticles.slice(0, limit);
    }
    
    const limitedArticles = articles.slice(0, limit);
    console.log(`[Google News RSS] Successfully fetched ${limitedArticles.length} articles for topic "${topic}"`);
    return limitedArticles;
  } catch (error) {
    console.error(`[Google News RSS] Error fetching news for topic "${topic}":`, error);
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
    console.error("[Google News RSS] Error generating synthesis:", error);
    return "Erreur lors de la génération de la synthèse.";
  }
}
