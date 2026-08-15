import {
  generateStructuredContent as generateWithGemini,
  GEMINI_MODEL_NAME,
} from './gemini.service';
import {
  generateWithGroq,
  GROQ_LARGE_MODEL,
  GROQ_MEDIUM_MODEL,
  GROQ_FAST_MODEL,
} from './groq.service';

export type AIProvider = 'gemini' | 'groq-large' | 'groq-medium' | 'groq-fast';

export interface RouterOptions {
  primary: AIProvider;
  fallbacks?: AIProvider[];
  maxOutputTokens?: number;
}

function isRateLimit(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate_limit') ||
    msg.includes('Quota exceeded')
  );
}

async function callProvider<T>(
  provider: AIProvider,
  prompt: string,
  maxOutputTokens: number
): Promise<T> {
  switch (provider) {
    case 'gemini':
      return generateWithGemini<T>(prompt, {
        modelName: GEMINI_MODEL_NAME,
        maxOutputTokens,
      });
    case 'groq-large':
      return generateWithGroq<T>(prompt, {
        modelName: GROQ_LARGE_MODEL,
        maxOutputTokens,
      });
    case 'groq-medium':
      return generateWithGroq<T>(prompt, {
        modelName: GROQ_MEDIUM_MODEL,
        maxOutputTokens,
      });
    case 'groq-fast':
      return generateWithGroq<T>(prompt, {
        modelName: GROQ_FAST_MODEL,
        maxOutputTokens,
      });
    default:
      throw new Error(`Unknown provider: ${provider as string}`);
  }
}

/**
 * Smart AI router that tries the primary provider first,
 * then automatically falls back to alternatives on failure.
 */
export async function generateWithRouter<T>(
  prompt: string,
  options: RouterOptions
): Promise<T> {
  const { primary, fallbacks = [], maxOutputTokens = 16384 } = options;
  const chain: AIProvider[] = [primary, ...fallbacks];

  let lastError: unknown;

  for (const provider of chain) {
    try {
      console.log(`→ Trying provider: ${provider}`);
      const result = await callProvider<T>(provider, prompt, maxOutputTokens);
      console.log(`✓ Provider ${provider} succeeded`);
      return result;
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`✗ Provider ${provider} failed:`, msg.slice(0, 200));

      // Don't fall back on rate limit — respect the retry-after
      if (isRateLimit(error) && provider === chain[chain.length - 1]) {
        throw error;
      }
      // Continue to next provider
    }
  }

  throw lastError;
}