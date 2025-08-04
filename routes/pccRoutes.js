import express from 'express';
import {
  getPCCRecords,
  getSinglePCCRecord,
  addPCCRecord,
  editPCCRecord,
  deletePCCRecord
} from '../controllers/pccController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getPCCRecords);           // Get all PCCs
router.post('/', protect, addPCCRecord);           // Add PCC
router.get('/:id', protect, getSinglePCCRecord);   // Get single PCC
router.put('/:id', protect, editPCCRecord);        // Edit PCC
router.delete('/:id', protect, deletePCCRecord);   // Delete PCC

export default router;
