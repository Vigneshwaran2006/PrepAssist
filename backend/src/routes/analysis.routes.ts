import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  handleCreateAnalysis,
  handleGetAnalyses,
  handleGetAnalysisById,
  handleRetryAnalysis,
  handleDeleteAnalysis,
} from '../controllers/analysis/analysis.controller';

const router = Router();
router.use(authenticate);

router.post('/', handleCreateAnalysis);
router.get('/', handleGetAnalyses);
router.get('/:analysisId', handleGetAnalysisById);
router.post('/:analysisId/retry', handleRetryAnalysis);
router.delete('/:analysisId', handleDeleteAnalysis);

export default router;