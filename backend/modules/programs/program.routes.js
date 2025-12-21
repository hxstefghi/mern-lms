import express from 'express';
import {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramStats,
  updateEnrollmentCount,
} from './program.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getPrograms);
router.get('/:id', getProgram);
router.get('/:id/stats', protect, getProgramStats);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createProgram);
router.put('/:id', protect, authorize('admin'), updateProgram);
router.delete('/:id', protect, authorize('admin'), deleteProgram);
router.patch('/:id/enrollment', protect, authorize('admin'), updateEnrollmentCount);

export default router;
