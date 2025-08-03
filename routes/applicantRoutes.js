import express from 'express';
import {
  getApplicants,
  getApplicant,
  createApplicant,
  updateApplicant,
  deleteApplicant,
  updateApplicantStatus
} from '../controllers/applicantController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', protect, getApplicants);
router.get('/:id', protect, getApplicant);
router.post('/', protect, createApplicant);
router.put('/:id', protect, updateApplicant);
router.patch('/:id/status', protect, updateApplicantStatus);
router.delete('/:id', protect, authorizeRoles('admin', 'superuser'), deleteApplicant);

export default router;
