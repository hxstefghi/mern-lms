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
  getOfferingAnnouncements,
  createOfferingAnnouncement,
  deleteOfferingAnnouncement,
  getOfferingMaterials,
  createOfferingMaterial,
  deleteOfferingMaterial,
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

// Offering announcements
router
  .route('/:id/offerings/:offeringId/announcements')
  .get(getOfferingAnnouncements)
  .post(authorize('instructor', 'admin'), createOfferingAnnouncement);

router
  .route('/:id/offerings/:offeringId/announcements/:announcementId')
  .delete(authorize('instructor', 'admin'), deleteOfferingAnnouncement);

// Offering materials
router
  .route('/:id/offerings/:offeringId/materials')
  .get(getOfferingMaterials)
  .post(authorize('instructor', 'admin'), createOfferingMaterial);

router
  .route('/:id/offerings/:offeringId/materials/:materialId')
  .delete(authorize('instructor', 'admin'), deleteOfferingMaterial);

export default router;
