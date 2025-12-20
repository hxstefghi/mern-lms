import express from 'express';
import {
  getEnrollments,
  getEnrollmentById,
  getStudentEnrollments,
  createEnrollment,
  updateEnrollmentStatus,
  dropSubject,
  deleteEnrollment,
} from './enrollment.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Get all enrollments (admin)
router.route('/').get(authorize('admin'), getEnrollments).post(createEnrollment);

// Get student enrollments
router.route('/student/:studentId').get(getStudentEnrollments);

router.route('/:id').get(getEnrollmentById).delete(authorize('admin'), deleteEnrollment);

// Update enrollment status (admin)
router.route('/:id/status').put(authorize('admin'), updateEnrollmentStatus);

// Drop subject
router.route('/:id/drop-subject').put(dropSubject);

export default router;
