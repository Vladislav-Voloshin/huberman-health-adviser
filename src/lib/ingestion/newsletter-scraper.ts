/**
 * Huberman Lab Newsletter Content Ingestion
 *
 * Scrapes newsletter archive from the Huberman Lab website.
 * Newsletters contain concise protocol summaries and tool recommendations.
 */

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface NewsletterData {
  title: string;
  publish_date: string;
  content: string;
  topics: string[];
  url: string;
}

/**
 * Scrape newsletter listing from Huberman Lab website
 */
export async function fetchNewsletterList(): Promise<NewsletterData[]> {
  const BASE_URL = "https://www.hubermanlab.com/newsletter";
  const newsletters: NewsletterData[] = [];

  try {
    const response = await fetch(BASE_URL);
    const html = await response.text();

    // Parse newsletter links from the page
    const linkRegex =
      /href="(\/newsletter\/[^"]+)"/g;
    const links: string[] = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const path = match[1];
      if (!links.includes(path)) {
        links.push(path);
      }
    }

    console.log(`Found ${links.length} newsletter links`);

    // Fetch each newsletter page
    for (const link of links) {
      try {
        const pageUrl = `https://www.hubermanlab.com${link}`;
        const pageResponse = await fetch(pageUrl);
        const pageHtml = await pageResponse.text();

        const title = extractMetaContent(pageHtml, "og:title") ||
          extractHtmlTitle(pageHtml) ||
          link.split("/").pop()?.replace(/-/g, " ") || "Unknown";

        const dateStr = extractMetaContent(pageHtml, "article:published_time") || "";
        const publishDate = dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";

        // Extract main content (strip HTML tags)
        const content = extractMainContent(pageHtml);
        const topics = extractTopicsFromContent(title, content);

        newsletters.push({
          title: cleanHtmlEntities(title),
          publish_date: publishDate,
          content: content.slice(0, 10000),
          topics,
          url: pageUrl,
        });

        // Rate limiting
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`Error fetching newsletter ${link}:`, err);
      }
    }
  } catch (err) {
    console.error("Error fetching newsletter list:", err);
  }

  return newsletters;
}

/**
 * Store newsletters in Supabase
 */
export async function storeNewsletters(newsletters: NewsletterData[]) {
  const supabase = getSupabase();
  let stored = 0;

  for (const nl of newsletters) {
    const { error } = await supabase
      .from("newsletters")
      .upsert(
        {
          title: nl.title,
          publish_date: nl.publish_date || null,
          content: nl.content,
          topics: nl.topics,
          url: nl.url,
          ingested: false,
        },
        { onConflict: "url" }
      );

    if (error) {
      console.error(`Error storing newsletter "${nl.title}":`, error);
    } else {
      stored++;
    }
  }

  return stored;
}

/**
 * Main newsletter ingestion pipeline
 */
export async function runNewsletterScraper() {
  console.log("Starting newsletter scraper...");

  const newsletters = await fetchNewsletterList();
  console.log(`Found ${newsletters.length} newsletters`);

  const stored = await storeNewsletters(newsletters);
  console.log(`Successfully stored ${stored} newsletters`);

  return { total: newsletters.length, stored };
}

// ---- Utility functions ----

function extractMetaContent(html: string, property: string): string {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return match[1];

  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const match2 = html.match(regex2);
  return match2 ? match2[1] : "";
}

function extractHtmlTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractMainContent(html: string): string {
  // Try to find the main content area
  let content = html;

  // Remove script/style tags
  content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
  content = content.replace(/<style[\s\S]*?<\/style>/gi, "");
  content = content.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  content = content.replace(/<header[\s\S]*?<\/header>/gi, "");
  content = content.replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Try to find article or main content
  const articleMatch = content.match(
    /<article[^>]*>([\s\S]*?)<\/article>/i
  );
  if (articleMatch) content = articleMatch[1];

  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch && !articleMatch) content = mainMatch[1];

  // Strip all HTML tags
  content = content.replace(/<[^>]+>/g, " ");
  // Normalize whitespace
  content = content.replace(/\s+/g, " ").trim();
  // Decode HTML entities
  content = cleanHtmlEntities(content);

  return content;
}

function cleanHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function extractTopicsFromContent(title: string, content: string): string[] {
  const topicKeywords = [
    "sleep", "focus", "exercise", "stress", "anxiety", "dopamine",
    "motivation", "cold exposure", "heat", "sauna", "light", "circadian",
    "nutrition", "fasting", "supplement", "hormone", "caffeine",
    "meditation", "breathwork", "recovery", "brain", "memory",
    "gut health", "immune", "aging", "mental health", "depression",
  ];

  const combined = `${title} ${content}`.toLowerCase();
  return topicKeywords.filter((keyword) => combined.includes(keyword));
}
