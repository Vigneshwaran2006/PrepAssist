import { generateStructuredContent } from '../ai/gemini.service';

export async function extractRoleFromJD(jd: string): Promise<string> {
  const prompt = `Extract the primary job role/title from this job description.

Return ONLY valid JSON: { "role": "string (short role like 'SDE', 'Backend Engineer', 'Data Scientist')" }

JOB DESCRIPTION:
"""
${jd.slice(0, 6000)}
"""`;

  try {
    const result = await generateStructuredContent<{ role: string }>(prompt, {
      maxOutputTokens: 200,
    });
    return result.role?.trim() || 'Software Engineer';
  } catch {
    return 'Software Engineer';
  }
}