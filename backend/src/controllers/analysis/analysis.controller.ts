import type { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import {
  createOrGetAnalysis,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis,
  retryAnalysis,
  updateAnalysisStatus,
} from '../../services/analysis/analysis.service';
import { processAnalysisInBackground } from '../../services/analysis/processor.service';
import { validateCompany } from '../../services/search/tavily.service';
import { extractRoleFromJD } from '../../services/analysis/role-extractor.service';
import type { DriveType, User } from '../../types';

function getIdParam(req: Request): string | null {
  const raw = req.params['analysisId'];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

export async function handleCreateAnalysis(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const body = req.body as {
      resume_id?: string;
      company_name?: string;
      role?: string;
      job_description?: string;
      drive_type?: string;
    };

    // Validate inputs
    if (!body.resume_id) {
      sendError(res, 'resume_id is required', 400);
      return;
    }
    if (!body.company_name || !body.company_name.trim()) {
      sendError(res, 'company_name is required', 400);
      return;
    }
    if (!body.drive_type || (body.drive_type !== 'on_campus' && body.drive_type !== 'off_campus')) {
      sendError(res, 'drive_type must be on_campus or off_campus', 400);
      return;
    }

    const hasRole = !!body.role?.trim();
    const hasJD = !!body.job_description?.trim();
    if (!hasRole && !hasJD) {
      sendError(res, 'Either role or job_description must be provided', 400);
      return;
    }

    const companyName = body.company_name.trim();

    // Validate company exists
    const validation = await validateCompany(companyName);
    if (!validation.valid) {
      sendError(res, validation.reason ?? 'Company not found', 400);
      return;
    }

    // Determine role
    let resolvedRole: string;
    if (hasRole) {
      resolvedRole = body.role!.trim();
    } else {
      resolvedRole = await extractRoleFromJD(body.job_description!);
    }

    // Create or get analysis (dedup)
    const { analysis, isNew } = await createOrGetAnalysis(
      {
        user_id: user.id,
        resume_id: body.resume_id,
        company_name: companyName,
        role: body.role?.trim() || null,
        job_description: body.job_description?.trim() || null,
        drive_type: body.drive_type as DriveType,
      },
      resolvedRole
    );

    // If new or failed, start processing
    if (isNew || analysis.status === 'failed') {
      // If it was failed, reset it
      if (analysis.status === 'failed') {
        await updateAnalysisStatus(analysis.id, 'pending');
      }
      void processAnalysisInBackground({
        analysisId: analysis.id,
        userId: user.id,
        resumeId: body.resume_id,
        companyName,
        role: resolvedRole,
        driveType: body.drive_type as DriveType,
        jobDescription: body.job_description?.trim() || null,
      });
    }

    sendSuccess(
      res,
      isNew ? 'Analysis started' : analysis.status === 'completed' ? 'Existing analysis returned' : 'Analysis in progress',
      { analysis },
      isNew ? 202 : 200
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    sendError(res, message, 500);
  }
}

export async function handleGetAnalyses(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as User;
    const analyses = await getUserAnalyses(user.id);
    sendSuccess(res, 'Analyses fetched', { analyses });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    sendError(res, message, 500);
  }
}

export async function handleGetAnalysisById(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as User;
    const id = getIdParam(req);
    if (!id) {
      sendError(res, 'ID required', 400);
      return;
    }
    const analysis = await getAnalysisById(id, user.id);
    if (!analysis) {
      sendError(res, 'Analysis not found', 404);
      return;
    }
    sendSuccess(res, 'Analysis fetched', { analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    sendError(res, message, 500);
  }
}

export async function handleRetryAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as User;
    const id = getIdParam(req);
    if (!id) {
      sendError(res, 'ID required', 400);
      return;
    }
    const analysis = await retryAnalysis(id, user.id);
    if (!analysis) {
      sendError(res, 'Not found', 404);
      return;
    }

    // Restart processing
    void processAnalysisInBackground({
      analysisId: analysis.id,
      userId: user.id,
      resumeId: analysis.resume_id,
      companyName: analysis.company_name,
      role: analysis.resolved_role ?? analysis.role ?? 'Software Engineer',
      driveType: analysis.drive_type,
      jobDescription: analysis.job_description,
    });

    sendSuccess(res, 'Retry started', { analysis }, 202);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    sendError(res, message, 500);
  }
}

export async function handleDeleteAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as User;
    const id = getIdParam(req);
    if (!id) {
      sendError(res, 'ID required', 400);
      return;
    }
    await deleteAnalysis(id, user.id);
    sendSuccess(res, 'Deleted');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    sendError(res, message, 500);
  }
}