import express from 'express';
import {
  getCurricula,
  getCurriculumById,
  getCurriculumByProgram,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} from './curriculum.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public/Student routes
router.get('/program/:program', protect, getCurriculumByProgram);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'instructor'));

router.route('/')
  .get(getCurricula)
  .post(createCurriculum);

router.route('/:id')
  .get(getCurriculumById)
  .put(updateCurriculum)
  .delete(deleteCurriculum);

export default router;
