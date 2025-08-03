import express from 'express';
import {
  getRecords,
  getRecordById,   // <-- import this new controller function
  addRecord,
  editRecord,
  deleteRecord
} from '../controllers/recordController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getRecords);
router.get('/:id', protect, getRecordById);   // <-- add this route
router.post('/', protect, addRecord);
router.put('/:id', protect, editRecord);
router.delete('/:id', protect, deleteRecord);

export default router;
