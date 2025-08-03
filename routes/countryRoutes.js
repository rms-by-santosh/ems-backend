import express from 'express';
import {
  getCountries, getCountry, createCountry, updateCountry, deleteCountry
} from '../controllers/countryController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', protect, getCountries);
router.get('/:id', protect, getCountry);
router.post('/', protect, authorizeRoles('admin'), createCountry);
router.put('/:id', protect, authorizeRoles('admin'), updateCountry);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCountry);

export default router;
