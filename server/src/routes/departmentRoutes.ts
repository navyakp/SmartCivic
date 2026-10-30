import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getOfficers,
} from '../controllers/departmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getDepartments);
router.get('/officers', requireAuth, requireRole('admin', 'officer'), getOfficers);
router.post('/', requireAuth, requireRole('admin'), createDepartment);
router.patch('/:id', requireAuth, requireRole('admin'), updateDepartment);
router.delete('/:id', requireAuth, requireRole('admin'), deleteDepartment);

export default router;
