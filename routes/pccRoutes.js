import express from 'express';
import {
  getPCCRecords, addPCCRecord, editPCCRecord, deletePCCRecord
} from '../controllers/pccController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getPCCRecords);
router.post('/', protect, addPCCRecord);
router.put('/:id', protect, editPCCRecord);
router.delete('/:id', protect, deletePCCRecord);

export default router;
