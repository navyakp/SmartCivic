import { Router } from 'express';
import {
  submitComplaint,
  getMyComplaints,
  getComplaintDetails,
  trackComplaintPublic,
  updateStatus,
  overridePriority,
  assignComplaint,
  resolveComplaint,
} from '../controllers/complaintController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public citizen tracking by CP-ID
router.get('/track/:complaintId', trackComplaintPublic);

// Authenticated citizen endpoints
router.post('/', requireAuth, upload.array('images', 3), submitComplaint);
router.get('/my', requireAuth, getMyComplaints);

// Detail endpoint (accessible by owner citizen, officer, admin)
router.get('/:id', requireAuth, getComplaintDetails);

// Workflow endpoints (Officers and Admins)
router.patch('/:id/status', requireAuth, requireRole('officer', 'admin'), updateStatus);
router.patch('/:id/priority', requireAuth, requireRole('admin'), overridePriority);
router.post('/:id/assign', requireAuth, requireRole('admin'), assignComplaint);
router.post('/:id/resolve', requireAuth, requireRole('officer', 'admin'), resolveComplaint);

export default router;
