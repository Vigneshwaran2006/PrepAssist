import { generateWithRouter } from '../ai/ai-router.service';

/**
 * If user didn't provide a role, extract it from the JD.
 */
export async function extractRoleFromJD(jd: string): Promise<string> {
  const prompt = `Extract the primary job role/title from this job description.

Return ONLY valid JSON: { "role": "string (short role like 'SDE', 'Backend Engineer', 'Data Scientist')" }

JOB DESCRIPTION:
"""
${jd.slice(0, 6000)}
"""`;

  try {
    // Small extraction task — use fastest available
    const result = await generateWithRouter<{ role: string }>(prompt, {
      primary: 'groq-fast',
      fallbacks: ['gemini', 'groq-medium'],
      maxOutputTokens: 200,
    });
    return result.role?.trim() || 'Software Engineer';
  } catch {
    return 'Software Engineer';
  }
}