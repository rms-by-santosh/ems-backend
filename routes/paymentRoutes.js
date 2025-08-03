import express from 'express';
import {
  getPayments, createPayment, updatePayment, deletePayment
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), getPayments);
router.post('/', protect, createPayment);
router.put('/:id', protect, authorizeRoles('admin'), updatePayment);
router.delete('/:id', protect, authorizeRoles('admin'), deletePayment);

export default router;
