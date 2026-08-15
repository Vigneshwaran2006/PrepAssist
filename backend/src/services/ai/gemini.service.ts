import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export const GEMINI_MODEL_NAME = 'gemini-flash-latest';

const FALLBACK_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-flash-latest', // try primary again after lite
];

export function getGeminiModel(
  modelName: string = GEMINI_MODEL_NAME,
  maxOutputTokens = 8192
) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      topK: 40,
      maxOutputTokens,
      responseMimeType: 'application/json',
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isOverloadedError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('503') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('Service Unavailable') ||
    msg.includes('UNAVAILABLE')
  );
}

function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    isOverloadedError(error) ||
    msg.includes('502') ||
    msg.includes('500') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ENOTFOUND')
  );
}

function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('429') || msg.includes('quota') || msg.includes('rate');
}

async function generateWithRetry(
  prompt: string,
  modelName: string,
  maxOutputTokens: number,
  maxRetries = 5
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = getGeminiModel(modelName, maxOutputTokens);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;

      if (isRateLimitError(error)) throw error;

      if (isRetryableError(error) && attempt < maxRetries - 1) {
        // Longer delays for 503 (server overload)
        const baseDelay = isOverloadedError(error) ? 4000 : 1000;
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 30000);
        const errMsg =
          error instanceof Error ? error.message.slice(0, 100) : 'unknown';
        console.log(
          `⚠ Gemini ${modelName} attempt ${attempt + 1}/${maxRetries} failed (${errMsg}). Retrying in ${delay}ms...`
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

  for (let i = 0; i < finalOpenBrackets - finalCloseBrackets; i++) {
    cleaned += ']';
  }
  for (let i = 0; i < finalOpenBraces - finalCloseBraces; i++) {
    cleaned += '}';
  }

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    return null;
  }
}

export interface GenerateOptions {
  modelName?: string;
  maxOutputTokens?: number;
}

export async function generateStructuredContent<T>(
  prompt: string,
  options: GenerateOptions = {}
): Promise<T> {
  const { modelName, maxOutputTokens = 8192 } = options;
  let lastError: unknown;

  const modelsToTry = modelName ? [modelName] : FALLBACK_MODELS;

  for (const model of modelsToTry) {
    try {
      const text = await generateWithRetry(prompt, model, maxOutputTokens);

      try {
        return JSON.parse(text) as T;
      } catch {
        console.log(`⚠ ${model} returned truncated JSON. Attempting repair...`);
        const repaired = tryRepairTruncatedJson(text);
        if (repaired) {
          try {
            const parsed = JSON.parse(repaired) as T;
            console.log(`✓ Successfully repaired truncated JSON from ${model}`);
            return parsed;
          } catch {
            // repair failed
          }
        }

        throw new Error(
          `Failed to parse ${model} JSON response (${text.length} chars, likely truncated). Raw start: ${text.slice(
            0,
            150
          )}...`
        );
      }
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`✗ Model ${model} failed:`, msg.slice(0, 200));
      if (isRateLimitError(error)) throw error;
    }
  }

  throw lastError;
}