import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { uploadResume } from '../middleware/upload';
import { sendError } from '../utils/response';
import {
  handleUploadResume,
  handleGetResumes,
  handleGetResumeById,
  handleGetResumeSignedUrl,
  handleDeleteResume,
  handleSetPrimaryResume,
} from '../controllers/resume/resume.controller';

const router = Router();

router.use(authenticate);

router.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction): void => {
    uploadResume(req, res, (err) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'Upload error';
        sendError(res, message, 400);
        return;
      }
      next();
    });
  },
  handleUploadResume
);

router.get('/', handleGetResumes);
router.get('/:resumeId', handleGetResumeById);
router.get('/:resumeId/download-url', handleGetResumeSignedUrl);
router.patch('/:resumeId/primary', handleSetPrimaryResume);
router.delete('/:resumeId', handleDeleteResume);

export default router;