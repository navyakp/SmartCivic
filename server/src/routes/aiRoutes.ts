import { Router } from 'express';
import {
  reanalyzeComplaint,
  getAnalysis,
  getAIStatus,
} from '../controllers/aiController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/status', getAIStatus);
router.post('/analyze/:complaintId', requireAuth, requireRole('admin', 'officer'), reanalyzeComplaint);
router.post('/retry/:complaintId', requireAuth, requireRole('admin', 'officer'), reanalyzeComplaint);
router.get('/analysis/:complaintId', requireAuth, getAnalysis);

export default router;
