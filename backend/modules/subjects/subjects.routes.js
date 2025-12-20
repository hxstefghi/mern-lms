import express from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectOfferings,
  addSubjectOffering,
  updateSubjectOffering,
  deleteSubjectOffering,
  getAvailableOfferings,
} from './subjects.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Get available offerings for enrollment (students)
router.get('/offerings/available', getAvailableOfferings);

// Subject CRUD
router
  .route('/')
  .get(getSubjects)
  .post(authorize('admin'), createSubject);

router
  .route('/:id')
  .get(getSubjectById)
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

// Subject offerings
router
  .route('/:id/offerings')
  .get(getSubjectOfferings)
  .post(authorize('admin'), addSubjectOffering);

router
  .route('/:id/offerings/:offeringId')
  .put(authorize('admin'), updateSubjectOffering)
  .delete(authorize('admin'), deleteSubjectOffering);

export default router;
