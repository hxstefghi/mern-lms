# LMS + SIS System - Complete Documentation

A comprehensive MERN stack Learning Management System (LMS) combined with Student Information System (SIS).

## System Architecture

### Backend (Node.js + Express + MongoDB)
- RESTful API architecture
- Modular folder structure by domain
- JWT authentication
- Role-based access control
- Mongoose for MongoDB interactions

### Frontend (React + Vite + TailwindCSS)
- Component-based architecture
- Role-specific portals
- Context API for state management
- Protected routes
- Responsive design with TailwindCSS

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/lms_sis_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

5. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
npm install react-router-dom axios
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## System Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (Admin, Student, Instructor)
- Protected routes on both backend and frontend
- Automatic token validation

### Student Information System (SIS)
- Student profiles with complete information
- Automatic student number generation (YYYY-XXXXX format)
- Program and year level tracking
- Academic history with grades and instructors
- Student status management (Active, Inactive, Graduated, etc.)

### Subject Management
- Subject CRUD operations
- Subject offerings per semester
- Instructor assignment
- Schedule management with room allocation
- Capacity and enrollment tracking
- Prerequisite management

### Enrollment System
- **Admin-driven enrollment**: Admins can enroll students directly
- **Self-enrollment**: Students can enroll themselves (pending approval)
- **Validation checks**:
  - Schedule conflict detection
  - Prerequisite verification
  - Unit limit enforcement (12-24 units regular, max 9 summer)
  - Capacity checking
- Enrollment status workflow (Pending → Approved → Completed)
- Drop subject functionality

### Registration Cards
- Official registration card generation
- Subject details with schedules and instructors
- Total units calculation
- Downloadable/printable format
- Historical registration cards access

### Tuition & Billing
- **Automatic tuition calculation**:
  - Base tuition per unit
  - Miscellaneous fees
  - Laboratory fees
- **Two payment plans**:
  - **Set A**: Full payment with 5% discount
  - **Set B**: 4 installments
- Payment tracking and history
- Balance calculation
- Installment schedule management
- Payment status tracking (Paid, Partial, Unpaid, Overdue)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Students
- `GET /api/students` - Get all students (Admin)
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/user/:userId` - Get student by user ID
- `POST /api/students` - Create student (Admin)
- `PUT /api/students/:id` - Update student (Admin)
- `DELETE /api/students/:id` - Delete student (Admin)
- `GET /api/students/:id/academic-history` - Get academic history
- `POST /api/students/:id/academic-history` - Add to academic history (Admin)

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (Admin)
- `PUT /api/subjects/:id` - Update subject (Admin)
- `DELETE /api/subjects/:id` - Delete subject (Admin)
- `GET /api/subjects/:id/offerings` - Get subject offerings
- `POST /api/subjects/:id/offerings` - Add offering (Admin)
- `GET /api/subjects/offerings/available` - Get available offerings for enrollment

### Enrollments
- `GET /api/enrollments` - Get all enrollments (Admin)
- `GET /api/enrollments/:id` - Get enrollment by ID
- `GET /api/enrollments/student/:studentId` - Get student enrollments
- `POST /api/enrollments` - Create enrollment
- `PUT /api/enrollments/:id/status` - Update enrollment status (Admin)
- `PUT /api/enrollments/:id/drop-subject` - Drop subject
- `DELETE /api/enrollments/:id` - Delete enrollment (Admin)

### Tuition
- `GET /api/tuitions` - Get all tuitions (Admin)
- `GET /api/tuitions/:id` - Get tuition by ID
- `GET /api/tuitions/enrollment/:enrollmentId` - Get tuition by enrollment
- `GET /api/tuitions/student/:studentId` - Get student tuitions
- `POST /api/tuitions` - Create tuition (Admin)
- `POST /api/tuitions/:id/payments` - Add payment (Admin)
- `PUT /api/tuitions/:id` - Update tuition (Admin)

## User Roles & Permissions

### Admin
- Full system access
- Manage all users, students, subjects, enrollments, tuition
- Approve/reject enrollments
- Process payments
- Generate reports

### Student
- View own profile and academic information
- Self-enroll in subjects
- View registration cards
- View tuition and payment history
- View academic history

### Instructor
- View assigned subjects
- View enrolled students
- Manage course materials (future feature)
- Submit grades (future feature)

## Database Schema

### User Model
- email, password, role, firstName, lastName, middleName
- isActive, profilePicture, timestamps

### Student Model
- user (ref), studentNumber, program, yearLevel
- dateOfBirth, address, contactNumber, emergencyContact
- admissionYear, status, academicHistory[]

### Subject Model
- code, name, description, units, program, yearLevel
- prerequisites[], offerings[]

### Enrollment Model
- student, schoolYear, semester, subjects[]
- totalUnits, status, enrollmentType
- approvedBy, approvalDate

### Tuition Model
- enrollment, student, schoolYear, semester
- breakdown[], totalAmount, paymentPlan
- discount, netAmount, installments[], payments[]
- totalPaid, balance, status

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS, express-validator

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: Context API

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes on both backend and frontend
- Role-based authorization
- Request validation
- CORS configuration
- Environment variable management
- Secure token storage

## Future Enhancements

- Grade submission by instructors
- Student attendance tracking
- Course materials and announcements
- Online payment integration
- Email notifications
- Report generation (PDF)
- Mobile responsive improvements
- Dashboard analytics and charts
- File upload for documents
- Chat/messaging system

## License

ISC
