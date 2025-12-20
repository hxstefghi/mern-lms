import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
} from './users.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers).post(createUser);

router.route('/role/:role').get(getUsersByRole);

router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

export default router;
