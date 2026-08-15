import {
  updateAnalysisStatus,
  saveFullAnalysis,
  fetchResumeAnalysisFor,
} from './analysis.service';
import { researchForAnalysis } from '../search/tavily.service';
import { runFullAnalysis } from './analysis-ai.service';
import type { AnalysisSource, DriveType } from '../../types';

interface ProcessInput {
  analysisId: string;
  userId: string;
  resumeId: string;
  companyName: string;
  role: string;
  driveType: DriveType;
  jobDescription: string | null;
}

export async function processAnalysisInBackground(
  input: ProcessInput
): Promise<void> {
  try {
    await updateAnalysisStatus(input.analysisId, 'processing');

    // 1. Fetch resume analysis
    const resume = await fetchResumeAnalysisFor(input.resumeId, input.userId);
    if (!resume) throw new Error('Resume analysis not found. Please re-upload your resume.');

    // 2. Web research
    const research = await researchForAnalysis(
      input.companyName,
      input.role,
      input.driveType
    );

    // 3. Run 3 parallel AI calls
    const result = await runFullAnalysis({
      companyName: input.companyName,
      role: input.role,
      driveType: input.driveType,
      jobDescription: input.jobDescription,
      webContext: research.combinedContext,
      resume,
    });

    // 4. Collect sources
    const sourceSet = new Map<string, AnalysisSource>();
    research.results.forEach((r) => {
      r.results.slice(0, 3).forEach((item) => {
        if (item.url && !sourceSet.has(item.url)) {
          sourceSet.set(item.url, { title: item.title, url: item.url });
        }
      });
    });
    const sources = Array.from(sourceSet.values()).slice(0, 20);

    // 5. Save
    await saveFullAnalysis(input.analysisId, result, sources);

    console.log(`✓ Analysis ${input.analysisId} completed for ${input.companyName}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Analysis ${input.analysisId} failed:`, message);
    await updateAnalysisStatus(input.analysisId, 'failed', message);
  }
}