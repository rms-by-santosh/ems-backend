import express from 'express';
import {
  register, login, getUsers, getProfile, updateUser,
  createUser, updateUserById, deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// If you do NOT want public registration, you can REMOVE or comment this line:
// router.post('/register', register);

router.post('/users/login', login);

// Get all users (admin only)
router.get('/', protect, authorizeRoles('admin'), getUsers);

// ADD USER (admin only)
router.post('/', protect, authorizeRoles('admin'), createUser);

// Edit user (admin only)
router.put('/:id', protect, authorizeRoles('admin'), updateUserById);

// Delete user (admin only)
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

// Get current user profile
router.get('/me', protect, getProfile);

// Update current user profile (self)
router.put('/me', protect, updateUser);

export default router;
