# Database Seeder

This directory contains seed files for populating the LMS database with sample data.

## Running the Seeder

To seed the database with sample data, run:

```bash
npm run seed
```

## What Gets Seeded

The seeder creates the following data:

### Programs (5)
- BSCS - Computer Science
- BSIT - Information Technology
- BSA - Accountancy
- BSBA - Business Administration
- BSEE - Electrical Engineering

### Users (15 total)
- **2 Admins**
  - `admin@university.edu` / password123
  - `admin.mary@university.edu` / password123
  
- **5 Instructors**
  - `prof.santos@university.edu` / password123
  - `prof.garcia@university.edu` / password123
  - `prof.reyes@university.edu` / password123
  - `prof.martinez@university.edu` / password123
  - `prof.torres@university.edu` / password123

- **8 Students**
  - `juan.delacruz@student.edu` / password123
  - `maria.santos@student.edu` / password123
  - `pedro.gonzales@student.edu` / password123
  - `ana.rodriguez@student.edu` / password123
  - `jose.fernandez@student.edu` / password123
  - `isabel.morales@student.edu` / password123
  - `carlos.ramirez@student.edu` / password123
  - `lucia.valdez@student.edu` / password123

### Student Records (8)
- Linked to student users
- Student numbers: 2024-10001 to 2024-10008
- Various year levels (2nd to 4th year)
- Complete contact and address information

### Subjects (13)
- Computer Science subjects (CS101, CS102, CS201, CS301)
- IT subjects (IT101, IT201)
- Accounting subjects (ACC101, ACC201)
- Business Administration subjects (BA101, BA201)
- General Education subjects (GE101, GE102)
- Each subject includes:
  - Prerequisites
  - Subject offerings with schedules
  - Assigned instructors
  - Room assignments

### Enrollments (6)
- Active enrollments for 6 students
- School Year 2024-2025, 1st Semester
- 4-6 subjects per student
- Various statuses (Enrolled, Completed, Approved)

### Tuition Records (6)
- Linked to enrollments
- Tuition fees, miscellaneous fees, lab fees
- Some students have scholarships/discounts
- Payment histories:
  - 2 fully paid students
  - 2 partially paid students
  - 2 unpaid students
- Installment plans with due dates

## Data Relationships

```
User (Admin/Instructor/Student)
  |
  ├─> Student (extends User with student role)
  |     |
  |     ├─> Enrollment
  |     |     └─> Tuition
  |     |
  |     └─> Academic History
  |
  └─> Instructor
        └─> Subject Offerings
              └─> Schedules

Program
  └─> Students enrolled

Subject
  ├─> Prerequisites
  └─> Offerings
        ├─> Instructor
        └─> Schedules
```

## Notes

- All passwords are hashed using bcrypt
- The seeder will **clear all existing data** before seeding
- Collections used:
  - `lms_users` (users collection)
  - `lms_programs` (programs collection)
  - `students`
  - `subjects`
  - `enrollments`
  - `tuitions`

## Customization

To modify the seed data, edit `seed.js` and adjust the arrays in:
- `seedPrograms()`
- `seedUsers()`
- `seedStudents()`
- `seedSubjects()`
- `seedEnrollments()`
- `seedTuition()`

## Warning

⚠️ **This script will delete all existing data in the database before seeding!**

Make sure you're running this on a development database, not production.
