import express from 'express';
import {
  getTuitions,
  getTuitionById,
  getTuitionByEnrollment,
  getStudentTuitions,
  createTuition,
  addPayment,
  updateTuition,
  deleteTuition,
} from './tuition.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Get all tuitions (admin)
router.route('/').get(authorize('admin'), getTuitions).post(authorize('admin'), createTuition);

// Get tuition by enrollment
router.route('/enrollment/:enrollmentId').get(getTuitionByEnrollment);

// Get student tuitions
router.route('/student/:studentId').get(getStudentTuitions);

router
  .route('/:id')
  .get(getTuitionById)
  .put(authorize('admin'), updateTuition)
  .delete(authorize('admin'), deleteTuition);

// Add payment
router.route('/:id/payments').post(authorize('admin'), addPayment);

export default router;
