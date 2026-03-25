/**
 * Guest Expert Research Scraper
 *
 * Extracts guest experts from podcast episodes and fetches their
 * key research papers from PubMed. This expands the knowledge base
 * with research from experts who appeared on the podcast.
 */

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface GuestResearch {
  guest_name: string;
  pmid: string;
  title: string;
  abstract: string;
  journal: string;
  publish_date: string;
}

/**
 * Get all unique guests from podcast episodes
 */
async function getGuests(): Promise<
  { name: string; episode_title: string }[]
> {
  const supabase = getSupabase();
  const { data: episodes } = await supabase
    .from("podcast_episodes")
    .select("title, guests")
    .not("guests", "eq", "{}");

  if (!episodes) return [];

  const guests: { name: string; episode_title: string }[] = [];
  const seen = new Set<string>();

  for (const ep of episodes) {
    for (const guest of ep.guests || []) {
      const normalized = guest.trim();
      if (normalized && !seen.has(normalized.toLowerCase())) {
        seen.add(normalized.toLowerCase());
        guests.push({ name: normalized, episode_title: ep.title });
      }
    }
  }

  return guests;
}

/**
 * Search PubMed for a guest's research
 */
async function searchGuestResearch(
  guestName: string,
  maxResults = 5
): Promise<string[]> {
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  // Search by author name + relevant health topics
  const query = `${guestName}[Author] AND (neuroscience OR health OR exercise OR sleep OR nutrition)`;
  const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
    query
  )}&retmax=${maxResults}&sort=relevance&retmode=json`;

  const response = await fetch(searchUrl);
  if (!response.ok) return [];

  const data = await response.json();
  return data.esearchresult?.idlist || [];
}

/**
 * Fetch article details from PubMed
 */
async function fetchArticles(pmids: string[]): Promise<GuestResearch[]> {
  if (pmids.length === 0) return [];

  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const fetchUrl = `${baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(
    ","
  )}&retmode=xml`;

  const response = await fetch(fetchUrl);
  if (!response.ok) return [];

  const xml = await response.text();
  const articles: GuestResearch[] = [];

  const articleRegex =
    /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let match;

  while ((match = articleRegex.exec(xml)) !== null) {
    const articleXml = match[1];
    const pmidMatch = articleXml.match(/<PMID[^>]*>(.*?)<\/PMID>/);
    const titleMatch = articleXml.match(
      /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/
    );
    const abstractMatch = articleXml.match(
      /<Abstract>([\s\S]*?)<\/Abstract>/
    );
    const journalMatch = articleXml.match(/<Title>(.*?)<\/Title>/);
    const yearMatch = articleXml.match(
      /<PubDate>[\s\S]*?<Year>(.*?)<\/Year>/
    );

    if (titleMatch && abstractMatch) {
      articles.push({
        guest_name: "",
        pmid: pmidMatch ? pmidMatch[1] : "",
        title: cleanHtml(titleMatch[1]),
        abstract: cleanHtml(abstractMatch[1]),
        journal: journalMatch ? cleanHtml(journalMatch[1]) : "",
        publish_date: yearMatch ? yearMatch[1] : "",
      });
    }
  }

  return articles;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Store guest research as content chunks
 */
async function storeGuestResearch(
  guestName: string,
  articles: GuestResearch[]
): Promise<number> {
  const supabase = getSupabase();
  let stored = 0;

  for (const article of articles) {
    const content = [
      `Research by podcast guest: ${guestName}`,
      `Title: ${article.title}`,
      `Journal: ${article.journal}`,
      `Published: ${article.publish_date}`,
      "",
      article.abstract,
    ].join("\n");

    const { error } = await supabase.from("content_chunks").insert({
      source_type: "research",
      source_title: `${article.title} (${guestName})`,
      source_id: `guest-${article.pmid}`,
      content,
      metadata: {
        guest_name: guestName,
        pmid: article.pmid,
        journal: article.journal,
      },
    });

    if (error) {
      if (error.code === "23505") continue;
      console.error(`Error storing research for ${guestName}:`, error);
    } else {
      stored++;
    }
  }

  return stored;
}

/**
 * Main guest research scraping pipeline
 */
export async function runGuestResearchScraper() {
  console.log("Starting guest expert research scraper...");

  const guests = await getGuests();
  console.log(`Found ${guests.length} unique guests from episodes`);

  let totalStored = 0;

  for (const guest of guests) {
    console.log(`Searching research for: ${guest.name}`);

    try {
      const pmids = await searchGuestResearch(guest.name, 5);

      if (pmids.length === 0) {
        console.log(`  No PubMed results for ${guest.name}`);
        continue;
      }

      await new Promise((r) => setTimeout(r, 400));

      const articles = await fetchArticles(pmids);
      const stored = await storeGuestResearch(guest.name, articles);
      totalStored += stored;

      console.log(
        `  Found ${articles.length} papers, stored ${stored} for ${guest.name}`
      );

      // Rate limit
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`  Error for ${guest.name}:`, err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(
    `Guest research scraper complete: ${totalStored} research chunks stored`
  );
  return totalStored;
}
