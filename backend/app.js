import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import studentRoutes from './modules/students/students.routes.js';
import subjectRoutes from './modules/subjects/subjects.routes.js';
import enrollmentRoutes from './modules/enrollment/enrollment.routes.js';
import registrationRoutes from './modules/registration/registration.routes.js';
import tuitionRoutes from './modules/tuition/tuition.routes.js';
import programRoutes from './modules/programs/program.routes.js';
import curriculumRoutes from './modules/curriculum/curriculum.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/curriculum', curriculumRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'LMS + SIS API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      students: '/api/students',
      subjects: '/api/subjects',
      enrollments: '/api/enrollments',
      registration: '/api/registration',
      tuitions: '/api/tuitions',
      curriculum: '/api/curriculum',
      programs: '/api/programs',
    },
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
