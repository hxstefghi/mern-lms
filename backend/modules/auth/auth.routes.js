import express from 'express';
import { register, login, getMe, updatePassword } from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

export default router;
