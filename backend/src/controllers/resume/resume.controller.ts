import type { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import {
  uploadResumeFile,
  deleteResumeFile,
  getSignedResumeUrl,
} from '../../services/resume/storage.service';
import {
  createResumeRecord,
  getUserResumes,
  getResumeWithAnalysis,
  deleteResume,
  setPrimaryResume,
  userHasPrimaryResume,
} from '../../services/resume/resume.service';
import { processResumeInBackground } from '../../services/resume/processor.service';
import type { User } from '../../types';

function getResumeIdParam(req: Request): string | null {
  const raw = req.params['resumeId'];
  if (typeof raw === 'string' && raw.length > 0) return raw;
  return null;
}

export async function handleUploadResume(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const file = req.file;

    if (!file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const title = (req.body?.title as string | undefined)?.trim() || file.originalname;

    const uploaded = await uploadResumeFile(
      user.id,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    const hasPrimary = await userHasPrimaryResume(user.id);
    const isPrimary = !hasPrimary;

    const resume = await createResumeRecord({
      user_id: user.id,
      title,
      file_name: file.originalname,
      file_path: uploaded.path,
      file_size: file.size,
      file_type: file.mimetype,
      is_primary: isPrimary,
    });

    void processResumeInBackground(
      resume.id,
      user.id,
      uploaded.path,
      file.mimetype
    );

    sendSuccess(
      res,
      'Resume uploaded successfully. Processing has started.',
      { resume },
      202
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    sendError(res, message, 500);
  }
}

export async function handleGetResumes(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const resumes = await getUserResumes(user.id);
    sendSuccess(res, 'Resumes fetched successfully', { resumes });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch';
    sendError(res, message, 500);
  }
}

export async function handleGetResumeById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const resumeId = getResumeIdParam(req);

    if (!resumeId) {
      sendError(res, 'Resume ID is required', 400);
      return;
    }

    const resume = await getResumeWithAnalysis(resumeId, user.id);

    if (!resume) {
      sendError(res, 'Resume not found', 404);
      return;
    }

    sendSuccess(res, 'Resume fetched successfully', { resume });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch';
    sendError(res, message, 500);
  }
}

export async function handleGetResumeSignedUrl(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const resumeId = getResumeIdParam(req);

    if (!resumeId) {
      sendError(res, 'Resume ID is required', 400);
      return;
    }

    const resume = await getResumeWithAnalysis(resumeId, user.id);
    if (!resume) {
      sendError(res, 'Resume not found', 404);
      return;
    }

    const url = await getSignedResumeUrl(resume.file_path);
    sendSuccess(res, 'Signed URL created', { url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    sendError(res, message, 500);
  }
}

export async function handleDeleteResume(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const resumeId = getResumeIdParam(req);

    if (!resumeId) {
      sendError(res, 'Resume ID is required', 400);
      return;
    }

    const resume = await deleteResume(resumeId, user.id);
    if (!resume) {
      sendError(res, 'Resume not found', 404);
      return;
    }

    try {
      await deleteResumeFile(resume.file_path);
    } catch (err) {
      console.error('Failed to delete storage file:', err);
    }

    sendSuccess(res, 'Resume deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete';
    sendError(res, message, 500);
  }
}

export async function handleSetPrimaryResume(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as User;
    const resumeId = getResumeIdParam(req);

    if (!resumeId) {
      sendError(res, 'Resume ID is required', 400);
      return;
    }

    await setPrimaryResume(resumeId, user.id);
    sendSuccess(res, 'Primary resume updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    sendError(res, message, 500);
  }
}