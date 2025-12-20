# LMS + SIS Backend API

A comprehensive Learning Management System (LMS) combined with Student Information System (SIS) built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Admin, Student, and Instructor profiles
- **Student Information System**: Student profiles, academic history, student number generation
- **Subject Management**: Subject offerings, instructor assignments, schedules, and capacity management
- **Enrollment System**: Admin-driven and self-enrollment with schedule conflict checking and prerequisite validation
- **Registration Cards**: Generate student registration cards for each semester
- **Tuition & Billing**: Tuition calculation, payment plans (Set A/Set B), payment tracking, and balance management

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/lms_sis_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

4. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user profile
- PUT `/api/auth/update-password` - Update password

### Users (Admin only)
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- POST `/api/users` - Create user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user
- GET `/api/users/role/:role` - Get users by role

### Students
- GET `/api/students` - Get all students (Admin)
- GET `/api/students/:id` - Get student by ID
- GET `/api/students/user/:userId` - Get student by user ID
- POST `/api/students` - Create student profile (Admin)
- PUT `/api/students/:id` - Update student (Admin)
- DELETE `/api/students/:id` - Delete student (Admin)
- GET `/api/students/:id/academic-history` - Get academic history
- POST `/api/students/:id/academic-history` - Add academic history (Admin)

### Subjects
- GET `/api/subjects` - Get all subjects
- GET `/api/subjects/:id` - Get subject by ID
- POST `/api/subjects` - Create subject (Admin)
- PUT `/api/subjects/:id` - Update subject (Admin)
- DELETE `/api/subjects/:id` - Delete subject (Admin)
- GET `/api/subjects/:id/offerings` - Get subject offerings
- POST `/api/subjects/:id/offerings` - Add subject offering (Admin)
- PUT `/api/subjects/:id/offerings/:offeringId` - Update offering (Admin)
- DELETE `/api/subjects/:id/offerings/:offeringId` - Delete offering (Admin)
- GET `/api/subjects/offerings/available` - Get available offerings

### Enrollments
- GET `/api/enrollments` - Get all enrollments (Admin)
- GET `/api/enrollments/:id` - Get enrollment by ID
- GET `/api/enrollments/student/:studentId` - Get student enrollments
- POST `/api/enrollments` - Create enrollment
- PUT `/api/enrollments/:id/status` - Update enrollment status (Admin)
- PUT `/api/enrollments/:id/drop-subject` - Drop subject
- DELETE `/api/enrollments/:id` - Delete enrollment (Admin)

### Registration
- GET `/api/registration/:enrollmentId` - Get registration card
- GET `/api/registration/student/:studentId` - Get registration card by student

### Tuition
- GET `/api/tuitions` - Get all tuitions (Admin)
- GET `/api/tuitions/:id` - Get tuition by ID
- GET `/api/tuitions/enrollment/:enrollmentId` - Get tuition by enrollment
- GET `/api/tuitions/student/:studentId` - Get student tuitions
- POST `/api/tuitions` - Create tuition record (Admin)
- POST `/api/tuitions/:id/payments` - Add payment (Admin)
- PUT `/api/tuitions/:id` - Update tuition (Admin)
- DELETE `/api/tuitions/:id` - Delete tuition (Admin)

## Project Structure

```
backend/
├── config/
│   ├── db.js
│   └── jwt.js
├── modules/
│   ├── auth/
│   │   ├── auth.model.js
│   │   ├── auth.controller.js
│   │   └── auth.routes.js
│   ├── users/
│   │   ├── users.controller.js
│   │   └── users.routes.js
│   ├── students/
│   │   ├── students.model.js
│   │   ├── students.controller.js
│   │   └── students.routes.js
│   ├── subjects/
│   │   ├── subjects.model.js
│   │   ├── subjects.controller.js
│   │   └── subjects.routes.js
│   ├── enrollment/
│   │   ├── enrollment.model.js
│   │   ├── enrollment.controller.js
│   │   └── enrollment.routes.js
│   ├── registration/
│   │   ├── registration.controller.js
│   │   └── registration.routes.js
│   └── tuition/
│       ├── tuition.model.js
│       ├── tuition.controller.js
│       └── tuition.routes.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── utils/
│   └── helpers.js
├── app.js
├── server.js
├── package.json
└── .env.example
```

## License

ISC
