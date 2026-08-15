import { tavily } from '@tavily/core';
import { config } from '../../config/env';

const client = tavily({ apiKey: config.TAVILY_API_KEY });

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  query: string;
  answer: string | null;
  results: TavilyResult[];
}

export async function searchWeb(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: 'basic' | 'advanced';
    includeAnswer?: boolean;
  } = {}
): Promise<TavilyResponse> {
  const { maxResults = 5, searchDepth = 'advanced', includeAnswer = true } = options;

  try {
    const result = await client.search(query, {
      searchDepth,
      maxResults,
      includeAnswer,
    });

    return {
      query,
      answer: result.answer ?? null,
      results: (result.results ?? []).map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score ?? 0,
      })),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Tavily search failed: ${msg}`);
  }
}

/**
 * Validates a company exists via web search.
 * Returns true if we find substantial info about the company.
 */
export async function validateCompany(companyName: string): Promise<{
  valid: boolean;
  reason?: string;
}> {
  try {
    const query = `${companyName} company official website about`;
    const result = await client.search(query, {
      searchDepth: 'basic',
      maxResults: 3,
      includeAnswer: false,
    });

    const results = result.results ?? [];
    if (results.length === 0) {
      return { valid: false, reason: 'No information found for this company.' };
    }

    // Check if at least one result mentions the company name
    const nameLower = companyName.toLowerCase().trim();
    const hasRelevantResult = results.some((r) => {
      const combined = `${r.title} ${r.content}`.toLowerCase();
      return combined.includes(nameLower);
    });

    if (!hasRelevantResult) {
      return {
        valid: false,
        reason: 'Could not verify company. Please check spelling or provide the full name.',
      };
    }

    return { valid: true };
  } catch {
    // If validation fails due to Tavily error, allow it through
    return { valid: true };
  }
}

/**
 * Multi-query research for a company + role + drive type.
 */
export async function researchForAnalysis(
  companyName: string,
  role: string,
  driveType: 'on_campus' | 'off_campus'
): Promise<{
  combinedContext: string;
  results: TavilyResponse[];
}> {
  const baseQueries = [
    `${companyName} company overview founder CEO history`,
    `${companyName} what they do products services current focus 2024 2025`,
    `${companyName} recent news updates hiring layoffs 2024 2025`,
    `${companyName} ${role} interview process rounds topics`,
    `${companyName} ${role} required skills tech stack`,
  ];

  const driveQueries =
    driveType === 'on_campus'
      ? [
          `${companyName} campus placement CGPA cutoff eligibility branches`,
          `${companyName} on-campus recruitment package batch 2025 2026`,
        ]
      : [
          `${companyName} off-campus hiring apply careers referral`,
          `${companyName} ${role} application process direct hiring`,
        ];

  const queries = [...baseQueries, ...driveQueries];

  const results = await Promise.all(
    queries.map((q) => searchWeb(q, { maxResults: 4, searchDepth: 'advanced' }))
  );

  const combinedContext = results
    .map((r, i) => {
      const answer = r.answer ? `\nSummary: ${r.answer}` : '';
      const snippets = r.results
        .slice(0, 3)
        .map((item) => `- [${item.title}](${item.url})\n${item.content.slice(0, 700)}`)
        .join('\n');
      return `## Query ${i + 1}: ${r.query}${answer}\n\n${snippets}`;
    })
    .join('\n\n---\n\n');

  return { combinedContext, results };
}