import express from 'express';
import quizController from './quiz.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Create a quiz for an offering
router.post('/subjects/:subjectId/offerings/:offeringId/quizzes', protect, quizController.createQuiz);

// Get all quizzes for an offering
router.get('/offerings/:offeringId/quizzes', protect, quizController.getQuizzes);

// Get a specific quiz
router.get('/quizzes/:quizId', protect, quizController.getQuiz);

// Update a quiz
router.put('/quizzes/:quizId', protect, quizController.updateQuiz);

// Delete a quiz
router.delete('/quizzes/:quizId', protect, quizController.deleteQuiz);

// Submit quiz answers (student)
router.post('/quizzes/:quizId/submit', protect, quizController.submitQuiz);

// Get student's submission for a quiz
router.get('/quizzes/:quizId/submissions/:studentId', protect, quizController.getSubmission);

// Get all submissions for a quiz (instructor)
router.get('/quizzes/:quizId/submissions', protect, quizController.getQuizSubmissions);

export default router;
