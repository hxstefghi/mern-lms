import express from 'express';
import {
  getStudents,
  getStudentById,
  getStudentByUserId,
  createStudent,
  updateStudent,
  deleteStudent,
  getAcademicHistory,
  addAcademicHistory,
} from './students.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Admin only routes
router.route('/').get(authorize('admin'), getStudents).post(authorize('admin'), createStudent);

// Student can view their own, admin can view all
router.route('/user/:userId').get(getStudentByUserId);

router
  .route('/:id')
  .get(getStudentById)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

router
  .route('/:id/academic-history')
  .get(getAcademicHistory)
  .post(authorize('admin'), addAcademicHistory);

export default router;
