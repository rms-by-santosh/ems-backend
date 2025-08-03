import express from 'express';
import {
  register,
  login,
  getUsers,
  getProfile,
  updateUser,
  createUser,
  updateUserById,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// ❗ Optional: enable registration if needed
// router.post('/register', register);

// ✅ Login Route (public)
router.post('/login', login);

// ✅ Get all users (admin only)
router.get('/', protect, authorizeRoles('admin'), getUsers);

// ✅ Create user (admin only)
router.post('/', protect, authorizeRoles('admin'), createUser);

// ✅ Update user by ID (admin only)
router.put('/:id', protect, authorizeRoles('admin'), updateUserById);

// ✅ Delete user by ID (admin only)
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

// ✅ Get current user profile
router.get('/me', protect, getProfile);

// ✅ Update current user profile
router.put('/me', protect, updateUser);

export default router;
