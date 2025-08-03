import express from 'express';
import {
  getAgents, getAgent, createAgent, updateAgent, deleteAgent
} from '../controllers/agentController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', protect, getAgents);
router.get('/:id', protect, getAgent);
router.post('/', protect, authorizeRoles('admin'), createAgent);
router.put('/:id', protect, authorizeRoles('admin'), updateAgent);
router.delete('/:id', protect, authorizeRoles('admin'), deleteAgent);

export default router;
