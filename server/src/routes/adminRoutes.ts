import { Router } from 'express';
import {
  getDashboardStats,
  getComplaints,
  getAnalytics,
  getHotspots,
  getInsights,
  getDuplicates,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Accessible by admin and officers
router.get('/dashboard', requireAuth, requireRole('admin', 'officer'), getDashboardStats);
router.get('/complaints', requireAuth, requireRole('admin', 'officer'), getComplaints);
router.get('/analytics', requireAuth, requireRole('admin', 'officer'), getAnalytics);
router.get('/hotspots', requireAuth, requireRole('admin', 'officer'), getHotspots);
router.get('/insights', requireAuth, requireRole('admin', 'officer'), getInsights);
router.get('/duplicates', requireAuth, requireRole('admin', 'officer'), getDuplicates);

export default router;
