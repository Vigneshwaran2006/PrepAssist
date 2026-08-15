import { downloadResumeFile } from './storage.service';
import { extractTextFromFile, validateExtractedText } from './parser.service';
import { analyzeResumeWithAI } from './analysis.service';
import { updateResumeStatus, saveResumeAnalysis } from './resume.service';

/**
 * Processes a resume in the background: downloads → extracts text → AI analyzes → saves.
 * Errors are caught and stored on the resume record.
 */
export async function processResumeInBackground(
  resumeId: string,
  userId: string,
  filePath: string,
  mimeType: string
): Promise<void> {
  try {
    await updateResumeStatus(resumeId, 'processing');

    // 1. Download from storage
    const buffer = await downloadResumeFile(filePath);

    // 2. Extract text
    const rawText = await extractTextFromFile(buffer, mimeType);
    validateExtractedText(rawText);

    // Save raw text early so we have it even if AI fails
    await updateResumeStatus(resumeId, 'processing', null, rawText);

    // 3. Analyze with AI
    const analysis = await analyzeResumeWithAI(rawText);

    // 4. Save analysis
    await saveResumeAnalysis(resumeId, userId, analysis);

    // 5. Mark complete
    await updateResumeStatus(resumeId, 'completed');

    console.log(`✓ Resume ${resumeId} processed successfully`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Resume ${resumeId} processing failed:`, message);
    await updateResumeStatus(resumeId, 'failed', message);
  }
}