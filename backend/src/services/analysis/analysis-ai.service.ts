import { generateWithRouter } from '../ai/ai-router.service';
import { GROQ_LARGE_MODEL } from '../ai/groq.service';
import type {
  CompanyDetails,
  DriveProcess,
  ResumeSuggestions,
  GapAnalysis,
  PreparationGuide,
  DriveType,
  ResumeAnalysis,
} from '../../types';

interface AnalysisContext {
  companyName: string;
  role: string;
  driveType: DriveType;
  jobDescription: string | null;
  webContext: string;
  resume: ResumeAnalysis;
}

function buildCompanyDrivePrompt(ctx: AnalysisContext): string {
  const driveSection =
    ctx.driveType === 'on_campus'
      ? `Include eligibility (cgpa_cutoff, branches, batches, backlog_policy). Set application_process to null.`
      : `Include application_process (channels, referral_info, tips). Set eligibility to null.`;

  return `Company: ${ctx.companyName}, Role: ${ctx.role}, Drive: ${ctx.driveType}
${driveSection}

Return valid JSON only. 3-5 items per list.

SCHEMA:
{
  "company_details": {
    "overview": "string (2-3 sentences)",
    "founded_year": "string|null",
    "founder": "string|null",
    "headquarters": "string|null",
    "ceo": "string|null",
    "industry": "string",
    "size": "string|null",
    "website": "string|null",
    "what_they_do": "string",
    "current_focus": "string",
    "key_products": ["string"],
    "notable_clients": ["string"],
    "recent_news": [{"title":"string","summary":"string","date":"string|null","url":"string|null"}],
    "culture_and_values": [{"name":"string","description":"string"}],
    "interesting_facts": ["string"],
    "competitors": ["string"],
    "why_work_here": ["string"]
  },
  "drive_process": {
    "drive_type": "${ctx.driveType}",
    "overview": "string",
    "total_duration": "string|null",
    "eligibility": ${ctx.driveType === 'on_campus' ? '{"cgpa_cutoff":"string|null","branches":["string"],"batches":["string"],"backlog_policy":"string|null"}' : 'null'},
    "application_process": ${ctx.driveType === 'off_campus' ? '{"channels":["string"],"referral_info":"string|null","tips":["string"]}' : 'null'},
    "rounds": [{"round_number":1,"name":"string","type":"OA|Coding|Technical|HR|Behavioral","duration":"string|null","description":"string","what_to_expect":["string"],"topics_covered":["string"],"tips":["string"],"difficulty":"Easy|Medium|Hard|null"}],
    "package_info": "string|null",
    "bond_info": "string|null",
    "timeline": "string|null",
    "important_notes": ["string"]
  }
}

CONTEXT:
"""
${ctx.webContext.slice(0, 5000)}
"""

Return ONLY the JSON.`;
}

function buildResumeGapPrompt(ctx: AnalysisContext): string {
  const skills = (ctx.resume.skills ?? [])
    .flatMap((c) => c.items)
    .slice(0, 20)
    .join(', ');
  const projects = (ctx.resume.projects ?? [])
    .slice(0, 3)
    .map((p) => `${p.name}[${p.technologies.slice(0, 4).join(',')}]`)
    .join('; ');

  const jdSection = ctx.jobDescription
    ? `\nJD: "${ctx.jobDescription.slice(0, 1500)}"\n`
    : '';

  return `Compare resume to ${ctx.companyName} - ${ctx.role}.

Resume Skills: ${skills || 'N/A'}
Projects: ${projects || 'None'}
ATS: ${ctx.resume.ats_score ?? 'N/A'}
${jdSection}
Company Context:
"""
${ctx.webContext.slice(0, 3500)}
"""

Return valid JSON. 3-6 items per list.

SCHEMA:
{
  "resume_suggestions": {
    "overall_ats_score": 0-100,
    "company_fit_score": 0-100,
    "summary": "string",
    "keywords_to_add": ["string"],
    "keywords_to_remove": ["string"],
    "sections_to_add": ["string"],
    "suggestions": [{"section":"string","current_state":"string","suggested_change":"string","priority":"critical|high|medium|low","reason":"string","example":"string|null"}],
    "formatting_tips": ["string"],
    "sample_bullet_improvements": [{"original":"string","improved":"string"}]
  },
  "gap_analysis": {
    "match_percentage": 0-100,
    "readiness_level": "Not Ready|Beginner|Approaching Ready|Ready|Highly Qualified",
    "summary": "string",
    "matched_skills": [{"skill":"string","category":"string","strength":"strong|moderate|weak"}],
    "missing_skills": [{"skill":"string","category":"string","importance":"critical|high|medium|low","priority":1,"why_needed":"string","estimated_time":"string","quick_learn_tip":"string"}],
    "partial_skills": [{"skill":"string","current_level":"string","required_level":"string","how_to_upgrade":"string"}],
    "extra_advantages": [{"skill":"string","how_to_leverage":"string"}],
    "critical_gaps_summary": "string"
  }
}

Return ONLY the JSON.`;
}

function buildPrepGuidePrompt(ctx: AnalysisContext): string {
  const skills = (ctx.resume.skills ?? [])
    .flatMap((c) => c.items)
    .slice(0, 12)
    .join(', ');

  return `Preparation guide for ${ctx.companyName} - ${ctx.role} (${ctx.driveType === 'on_campus' ? 'Campus' : 'Off-Campus'}).

Skills: ${skills || 'N/A'}

Context:
"""
${ctx.webContext.slice(0, 4000)}
"""

Return valid JSON. 5-7 steps. 2-3 real URLs per step (leetcode.com, github.com, neetcode.io, takeuforward.org, bytebytego.com, freecodecamp.org).

SCHEMA:
{
  "overall_strategy": "string",
  "estimated_total_prep_time": "string",
  "weekly_plan_summary": ["string"],
  "steps": [{"step_number":1,"title":"string","description":"string","duration":"string","priority":"high|medium|low","topics":["string"],"resources":[{"type":"documentation|video|course|practice|article","title":"string","url":"string|null"}],"practice_tasks":["string"],"success_metrics":["string"]}],
  "daily_practice_tips": ["string"],
  "common_mistakes_to_avoid": ["string"],
  "final_week_checklist": ["string"],
  "mindset_and_motivation": ["string"]
}

Return ONLY the JSON.`;
}

export interface FullAIAnalysisResult {
  company_details: CompanyDetails;
  drive_process: DriveProcess;
  resume_suggestions: ResumeSuggestions;
  gap_analysis: GapAnalysis;
  preparation_guide: PreparationGuide;
  ai_model: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runFullAnalysis(
  ctx: AnalysisContext
): Promise<FullAIAnalysisResult> {
  console.log('▶ Company + Drive analysis...');
  const companyDrive = await generateWithRouter<{
    company_details: CompanyDetails;
    drive_process: DriveProcess;
  }>(buildCompanyDrivePrompt(ctx), {
    primary: 'groq-large',
    fallbacks: ['gemini', 'groq-medium'],
    maxOutputTokens: 3500,
  });

  await sleep(8000); // Wait 8s to reset TPM window

  console.log('▶ Resume + Gap analysis...');
  const resumeGap = await generateWithRouter<{
    resume_suggestions: ResumeSuggestions;
    gap_analysis: GapAnalysis;
  }>(buildResumeGapPrompt(ctx), {
    primary: 'groq-large',
    fallbacks: ['gemini', 'groq-medium'],
    maxOutputTokens: 3500,
  });

  await sleep(8000);

  console.log('▶ Preparation Guide...');
  const prepGuide = await generateWithRouter<PreparationGuide>(
    buildPrepGuidePrompt(ctx),
    {
      primary: 'groq-large',
      fallbacks: ['gemini', 'groq-medium'],
      maxOutputTokens: 3500,
    }
  );

  return {
    company_details: companyDrive.company_details,
    drive_process: companyDrive.drive_process,
    resume_suggestions: resumeGap.resume_suggestions,
    gap_analysis: resumeGap.gap_analysis,
    preparation_guide: prepGuide,
    ai_model: `groq/${GROQ_LARGE_MODEL}`,
  };
}