import express from 'express';
import {
  getRegistrationCard,
  getRegistrationCardByStudent,
} from './registration.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/:enrollmentId').get(getRegistrationCard);

router.route('/student/:studentId').get(getRegistrationCardByStudent);

export default router;
