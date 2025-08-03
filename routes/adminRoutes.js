import express from 'express';
import {
  getAllUsers, adminUpdateUser, adminDeleteUser
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id', protect, authorizeRoles('admin'), adminUpdateUser);
router.delete('/users/:id', protect, authorizeRoles('admin'), adminDeleteUser);

export default router;
