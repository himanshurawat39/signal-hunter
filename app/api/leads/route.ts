import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchResult = {
  title: string;
  url: string;
  content: string;
  platform: "Reddit" | "X";
};

type Lead = {
  title: string;
  platform: string;
  url: string;
  summary: string;
  problem: string;
  confidenceScore: number;
  rationale: string;
};

type SearchResponse = {
  results: SearchResult[];
  matchMode: "exact" | "related";
};

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  raw_content?: string;
};

type FirecrawlResult = {
  title?: string;
  url?: string;
  description?: string;
  markdown?: string;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const SEARCH_TIMEOUT_MS = 12000;
const GEMINI_TIMEOUT_MS = 18000;
const MAX_SEARCH_RESULTS = 6;
const MIN_STRONG_RESULTS = 3;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { niche?: string; problem?: string };
    const niche = body.niche?.trim();
    const problem = body.problem?.trim();

    if (!niche || !problem) {
      return NextResponse.json(
        { error: "Both niche and problem are required." },
        { status: 400 },
      );
    }

    const query = `${niche} ${problem}`;
    const searchResponse = await searchSocialPosts(niche, problem);

    if (searchResponse.results.length === 0) {
      return NextResponse.json({
        leads: [],
        provider: activeSearchProvider(),
        query,
        searchedPosts: 0,
        matchMode: searchResponse.matchMode,
      });
    }

    const leads = await buildLeads(query, searchResponse.results);

    return NextResponse.json({
      leads,
      provider: activeSearchProvider(),
      query,
      searchedPosts: searchResponse.results.length,
      matchMode: searchResponse.matchMode,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to search for leads.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function buildLeads(query: string, searchResults: SearchResult[]) {
  try {
    const leads = await rankLeadsWithGemini(query, searchResults);
    return leads.length > 0 ? leads : scoreLeadsHeuristically(searchResults);
  } catch {
    return scoreLeadsHeuristically(searchResults);
  }
}

async function searchSocialPosts(
  niche: string,
  problem: string,
): Promise<SearchResponse> {
  if (process.env.TAVILY_API_KEY) {
    return searchWithTavily(niche, problem);
  }

  if (process.env.FIRECRAWL_API_KEY) {
    return searchWithFirecrawl(niche, problem);
  }

  throw new Error(
    "Missing search credentials. Set TAVILY_API_KEY or FIRECRAWL_API_KEY in your environment.",
  );
}

function activeSearchProvider() {
  if (process.env.TAVILY_API_KEY) {
    return "Tavily";
  }

  if (process.env.FIRECRAWL_API_KEY) {
    return "Firecrawl";
  }

  return "Unavailable";
}

function buildPrimaryQueries(niche: string, problem: string) {
  const siteFilter = "(site:reddit.com OR site:x.com OR site:twitter.com)";

  return [
    `${niche} ${problem} ${siteFilter}`,
    `${niche} "${problem}" ${siteFilter}`,
    `"${niche}" ${problem} ${siteFilter}`,
    `${niche} ${problem} (need OR looking OR hire OR help) ${siteFilter}`,
  ];
}

function buildRelatedQueries(niche: string, problem: string) {
  const siteFilter = "(site:reddit.com OR site:x.com OR site:twitter.com)";

  return [
    `${niche} ${siteFilter}`,
    `${problem} ${siteFilter}`,
    `${niche} (need OR looking OR hire OR help OR freelance OR job) ${siteFilter}`,
    `${problem} (need OR looking OR hire OR help OR freelance OR job) ${siteFilter}`,
    `${niche} ${problem.split(" ").slice(0, 1).join(" ")} ${siteFilter}`,
  ];
}

async function searchWithTavily(
  niche: string,
  problem: string,
): Promise<SearchResponse> {
  const primary = await runSearchPlan(
    buildPrimaryQueries(niche, problem),
    async (query) => {
      const response = await fetchWithTimeout(
        "https://api.tavily.com/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
          },
          body: JSON.stringify({
            query,
            topic: "general",
            search_depth: "basic",
            max_results: MAX_SEARCH_RESULTS,
            time_range: "month",
            include_domains: ["reddit.com", "x.com", "twitter.com"],
          }),
          cache: "no-store",
        },
        SEARCH_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new Error("Tavily search failed.");
      }

      const data = (await response.json()) as { results?: TavilyResult[] };
      return normalizeSearchResults(
        (data.results || []).map((result) => ({
          title: result.title || "Untitled post",
          url: result.url || "",
          content: result.content || result.raw_content || "",
        })),
      );
    },
  );

  if (primary.length >= MIN_STRONG_RESULTS) {
    return { results: primary, matchMode: "exact" };
  }

  const related = await runSearchPlan(
    buildRelatedQueries(niche, problem),
    async (query) => {
      const response = await fetchWithTimeout(
        "https://api.tavily.com/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
          },
          body: JSON.stringify({
            query,
            topic: "general",
            search_depth: "basic",
            max_results: MAX_SEARCH_RESULTS,
            time_range: "month",
            include_domains: ["reddit.com", "x.com", "twitter.com"],
          }),
          cache: "no-store",
        },
        SEARCH_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new Error("Tavily search failed.");
      }

      const data = (await response.json()) as { results?: TavilyResult[] };
      return normalizeSearchResults(
        (data.results || []).map((result) => ({
          title: result.title || "Untitled post",
          url: result.url || "",
          content: result.content || result.raw_content || "",
        })),
      );
    },
    primary,
  );

  return {
    results: related,
    matchMode: primary.length > 0 ? "related" : "related",
  };
}

async function searchWithFirecrawl(
  niche: string,
  problem: string,
): Promise<SearchResponse> {
  const primary = await runSearchPlan(
    buildPrimaryQueries(niche, problem),
    async (query) => {
      const response = await fetchWithTimeout(
        "https://api.firecrawl.dev/v1/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({
            query,
            limit: MAX_SEARCH_RESULTS,
            tbs: "qdr:m",
            scrapeOptions: {
              formats: ["markdown"],
            },
          }),
          cache: "no-store",
        },
        SEARCH_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new Error("Firecrawl search failed.");
      }

      const data = (await response.json()) as { data?: FirecrawlResult[] };
      return normalizeSearchResults(
        (data.data || []).map((result) => ({
          title: result.title || "Untitled post",
          url: result.url || "",
          content: result.markdown || result.description || "",
        })),
      );
    },
  );

  if (primary.length >= MIN_STRONG_RESULTS) {
    return { results: primary, matchMode: "exact" };
  }

  const related = await runSearchPlan(
    buildRelatedQueries(niche, problem),
    async (query) => {
      const response = await fetchWithTimeout(
        "https://api.firecrawl.dev/v1/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({
            query,
            limit: MAX_SEARCH_RESULTS,
            tbs: "qdr:m",
            scrapeOptions: {
              formats: ["markdown"],
            },
          }),
          cache: "no-store",
        },
        SEARCH_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new Error("Firecrawl search failed.");
      }

      const data = (await response.json()) as { data?: FirecrawlResult[] };
      return normalizeSearchResults(
        (data.data || []).map((result) => ({
          title: result.title || "Untitled post",
          url: result.url || "",
          content: result.markdown || result.description || "",
        })),
      );
    },
    primary,
  );

  return {
    results: related,
    matchMode: primary.length > 0 ? "related" : "related",
  };
}

async function runSearchPlan(
  queries: string[],
  searcher: (query: string) => Promise<SearchResult[]>,
  seed: SearchResult[] = [],
) {
  let mergedResults = [...seed];

  for (const query of queries) {
    const results = await searcher(query);
    mergedResults = mergeResults(mergedResults, results);

    if (mergedResults.length >= MAX_SEARCH_RESULTS) {
      break;
    }
  }

  return mergedResults.slice(0, MAX_SEARCH_RESULTS);
}

function normalizeSearchResults(
  results: Array<{ title: string; url: string; content: string }>,
): SearchResult[] {
  return results
    .filter((result) => result.url && /reddit\.com|x\.com|twitter\.com/.test(result.url))
    .map((result) => ({
      ...result,
      content: summarizeText(result.content || result.title, 420),
      platform: /reddit\.com/.test(result.url) ? "Reddit" : "X",
    }));
}

function mergeResults(existing: SearchResult[], incoming: SearchResult[]) {
  const byUrl = new Map(existing.map((result) => [result.url, result]));

  for (const result of incoming) {
    if (!byUrl.has(result.url)) {
      byUrl.set(result.url, result);
    }
  }

  return Array.from(byUrl.values());
}

async function rankLeadsWithGemini(
  query: string,
  searchResults: SearchResult[],
): Promise<Lead[]> {
  if (!process.env.GEMINI_API_KEY) {
    return scoreLeadsHeuristically(searchResults);
  }

  const compactPosts = searchResults.map((result) => ({
    title: result.title,
    platform: result.platform,
    url: result.url,
    excerpt: summarizeText(result.content, 240),
  }));

  const prompt = [
    "Identify which of these posts represent a high-intent potential client. Summarize their problem and provide a link to the post.",
    "Return only valid JSON with this shape:",
    '{"leads":[{"title":"string","platform":"Reddit or X","url":"string","summary":"string","problem":"string","confidenceScore":0,"rationale":"string"}]}',
    "Confidence score must be an integer from 0 to 100.",
    "If no posts are highly relevant, return the most related client-opportunity posts instead of an empty list.",
    `Search query: ${query}`,
    `Posts: ${JSON.stringify(compactPosts)}`,
  ].join("\n");

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "You are a B2B sales analyst who finds high-intent or closely related leads from social posts.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
    GEMINI_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error("Gemini lead analysis failed.");
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = JSON.parse(rawText) as { leads?: Lead[] };

  return (parsed.leads || [])
    .filter((lead) => lead.title && lead.url)
    .map((lead) => ({
      ...lead,
      problem: summarizeText(lead.problem, 140),
      summary: summarizeText(lead.summary, 160),
      rationale: summarizeText(lead.rationale, 120),
      confidenceScore: Math.max(0, Math.min(100, Math.round(lead.confidenceScore))),
    }))
    .sort((left, right) => right.confidenceScore - left.confidenceScore)
    .slice(0, 6);
}

function scoreLeadsHeuristically(searchResults: SearchResult[]): Lead[] {
  return searchResults
    .map((result) => {
      const haystack = `${result.title} ${result.content}`.toLowerCase();
      const urgencyKeywords = [
        "need",
        "looking for",
        "help",
        "hire",
        "freelancer",
        "agency",
        "expert",
        "problem",
        "broken",
        "issue",
        "jobs",
        "job",
      ];

      const score = urgencyKeywords.reduce((total, keyword) => {
        return haystack.includes(keyword) ? total + 8 : total;
      }, 38);

      return {
        title: result.title,
        platform: result.platform,
        url: result.url,
        problem: summarizeText(result.content || result.title, 140),
        summary: summarizeText(result.content || result.title, 160),
        rationale: "Related opportunity surfaced through fallback ranking instead of an exact hit.",
        confidenceScore: Math.min(score, 88),
      } satisfies Lead;
    })
    .sort((left, right) => right.confidenceScore - left.confidenceScore)
    .slice(0, 6);
}

function summarizeText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The search took too long. Please try a broader query.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
