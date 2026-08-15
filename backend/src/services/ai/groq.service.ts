import Groq from 'groq-sdk';
import { config } from '../../config/env';

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

export const GROQ_LARGE_MODEL = 'openai/gpt-oss-120b';
export const GROQ_MEDIUM_MODEL = 'openai/gpt-oss-20b';
export const GROQ_FAST_MODEL = 'llama-3.1-8b-instant';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('500') ||
    msg.includes('overloaded') ||
    msg.includes('Service Unavailable') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('fetch failed')
  );
}

function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('429') || msg.includes('rate_limit');
}

async function callGroqWithRetry(
  prompt: string,
  modelName: string,
  maxOutputTokens: number,
  maxRetries = 3
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that always responds with valid JSON matching the requested schema. Never wrap the JSON in markdown code fences.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        top_p: 0.95,
        max_tokens: maxOutputTokens,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content ?? '';
      if (!text) throw new Error('Empty response from Groq');
      return text;
    } catch (error) {
      lastError = error;
      if (isRateLimitError(error)) throw error;
      if (isRetryableError(error) && attempt < maxRetries - 1) {
        const delay = Math.min(1500 * Math.pow(2, attempt), 12000);
        const errMsg = error instanceof Error ? error.message.slice(0, 100) : 'unknown';
        console.log(
          `⚠ Groq ${modelName} attempt ${attempt + 1}/${maxRetries} failed (${errMsg}). Retrying in ${delay}ms...`
        );
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

function tryRepairTruncatedJson(text: string): string | null {
  let cleaned = text.trim();

  // Remove markdown code fences if present
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

  const lastComma = cleaned.lastIndexOf(',');
  const lastCloseBrace = cleaned.lastIndexOf('}');
  const lastCloseBracket = cleaned.lastIndexOf(']');
  const safeEnd = Math.max(lastCloseBrace, lastCloseBracket);

  if (safeEnd > 0 && safeEnd > lastComma) {
    cleaned = cleaned.slice(0, safeEnd + 1);
  } else if (lastComma > 0) {
    cleaned = cleaned.slice(0, lastComma);
  }

  const finalOpenBraces = (cleaned.match(/\{/g) ?? []).length;
  const finalCloseBraces = (cleaned.match(/\}/g) ?? []).length;
  const finalOpenBrackets = (cleaned.match(/\[/g) ?? []).length;
  const finalCloseBrackets = (cleaned.match(/\]/g) ?? []).length;

  for (let i = 0; i < finalOpenBrackets - finalCloseBrackets; i++) cleaned += ']';
  for (let i = 0; i < finalOpenBraces - finalCloseBraces; i++) cleaned += '}';

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    return null;
  }
}

export interface GroqGenerateOptions {
  modelName?: string;
  maxOutputTokens?: number;
}

export async function generateWithGroq<T>(
  prompt: string,
  options: GroqGenerateOptions = {}
): Promise<T> {
  const { modelName = GROQ_LARGE_MODEL, maxOutputTokens = 16384 } = options;

  const text = await callGroqWithRetry(prompt, modelName, maxOutputTokens);

  try {
    return JSON.parse(text) as T;
  } catch {
    console.log(`⚠ Groq ${modelName} returned malformed JSON. Attempting repair...`);
    const repaired = tryRepairTruncatedJson(text);
    if (repaired) {
      try {
        const parsed = JSON.parse(repaired) as T;
        console.log(`✓ Successfully repaired truncated JSON from Groq ${modelName}`);
        return parsed;
      } catch {
        // fall through
      }
    }
    throw new Error(
      `Failed to parse Groq ${modelName} JSON (${text.length} chars). Raw start: ${text.slice(0, 150)}...`
    );
  }
}