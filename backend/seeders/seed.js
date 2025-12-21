import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../modules/auth/auth.model.js';
import Student from '../modules/students/students.model.js';
import Subject from '../modules/subjects/subjects.model.js';
import Program from '../modules/programs/program.model.js';
import Enrollment from '../modules/enrollment/enrollment.model.js';
import Tuition from '../modules/tuition/tuition.model.js';
import Curriculum from '../modules/curriculum/curriculum.model.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Subject.deleteMany({});
    await Program.deleteMany({});
    await Enrollment.deleteMany({});
    await Tuition.deleteMany({});
    await Curriculum.deleteMany({});
    console.log('All data cleared!');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Seed Programs
const seedPrograms = async () => {
  const programs = [
    {
      code: 'BSCS',
      name: 'Computer Science',
      description: 'Bachelor of Science in Computer Science - Focus on software development, algorithms, and computing theory',
      department: 'College of Computing',
      duration: { years: 4, semesters: 8 },
      degree: 'Bachelor',
      status: 'active',
      requirements: ['High School Diploma', 'Math Proficiency', 'English Proficiency'],
      capacity: 50,
      enrolledStudents: 0,
      tuitionFee: { amount: 45000, currency: 'PHP' },
      coordinator: {
        name: 'Dr. Maria Santos',
        email: 'maria.santos@university.edu',
        phone: '+63 912 345 6789',
      },
    },
    {
      code: 'BSIT',
      name: 'Information Technology',
      description: 'Bachelor of Science in Information Technology - Focus on network administration, database management, and IT infrastructure',
      department: 'College of Computing',
      duration: { years: 4, semesters: 8 },
      degree: 'Bachelor',
      status: 'active',
      requirements: ['High School Diploma', 'Math Proficiency', 'English Proficiency'],
      capacity: 45,
      enrolledStudents: 0,
      tuitionFee: { amount: 42000, currency: 'PHP' },
      coordinator: {
        name: 'Prof. Juan Cruz',
        email: 'juan.cruz@university.edu',
        phone: '+63 912 345 6790',
      },
    },
    {
      code: 'BSA',
      name: 'Accountancy',
      description: 'Bachelor of Science in Accountancy - Prepare for CPA exam and careers in accounting and finance',
      department: 'College of Business',
      duration: { years: 4, semesters: 8 },
      degree: 'Bachelor',
      status: 'active',
      requirements: ['High School Diploma', 'Math Proficiency', 'English Proficiency'],
      capacity: 40,
      enrolledStudents: 0,
      tuitionFee: { amount: 48000, currency: 'PHP' },
      coordinator: {
        name: 'CPA Rosa Fernandez',
        email: 'rosa.fernandez@university.edu',
        phone: '+63 912 345 6791',
      },
    },
    {
      code: 'BSBA',
      name: 'Business Administration',
      description: 'Bachelor of Science in Business Administration - Major in Marketing, Management, or Finance',
      department: 'College of Business',
      duration: { years: 4, semesters: 8 },
      degree: 'Bachelor',
      status: 'active',
      requirements: ['High School Diploma', 'English Proficiency'],
      capacity: 60,
      enrolledStudents: 0,
      tuitionFee: { amount: 40000, currency: 'PHP' },
      coordinator: {
        name: 'Dr. Carlos Reyes',
        email: 'carlos.reyes@university.edu',
        phone: '+63 912 345 6792',
      },
    },
    {
      code: 'BSEE',
      name: 'Electrical Engineering',
      description: 'Bachelor of Science in Electrical Engineering - Power systems, electronics, and telecommunications',
      department: 'College of Engineering',
      duration: { years: 5, semesters: 10 },
      degree: 'Bachelor',
      status: 'active',
      requirements: ['High School Diploma', 'Advanced Math', 'Physics Proficiency'],
      capacity: 35,
      enrolledStudents: 0,
      tuitionFee: { amount: 55000, currency: 'PHP' },
      coordinator: {
        name: 'Engr. Antonio Garcia',
        email: 'antonio.garcia@university.edu',
        phone: '+63 912 345 6793',
      },
    },
  ];

  const createdPrograms = await Program.insertMany(programs);
  console.log(`${createdPrograms.length} programs created!`);
  return createdPrograms;
};

// Seed Users
const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    // Admin Users
    {
      email: 'admin@university.edu',
      password: hashedPassword,
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      middleName: '',
      isActive: true,
      profilePicture: '',
      assignedProgram: '',
    },
    {
      email: 'admin.mary@university.edu',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Mary',
      lastName: 'Johnson',
      middleName: 'Anne',
      isActive: true,
      profilePicture: '',
      assignedProgram: '',
    },
    // Instructor Users
    {
      email: 'prof.santos@university.edu',
      password: hashedPassword,
      role: 'instructor',
      firstName: 'Roberto',
      lastName: 'Santos',
      middleName: 'Cruz',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSCS',
    },
    {
      email: 'prof.garcia@university.edu',
      password: hashedPassword,
      role: 'instructor',
      firstName: 'Ana',
      lastName: 'Garcia',
      middleName: 'Lopez',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSIT',
    },
    {
      email: 'prof.reyes@university.edu',
      password: hashedPassword,
      role: 'instructor',
      firstName: 'Miguel',
      lastName: 'Reyes',
      middleName: 'Dela Cruz',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSCS',
    },
    {
      email: 'prof.martinez@university.edu',
      password: hashedPassword,
      role: 'instructor',
      firstName: 'Sofia',
      lastName: 'Martinez',
      middleName: 'Ramos',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSA',
    },
    {
      email: 'prof.torres@university.edu',
      password: hashedPassword,
      role: 'instructor',
      firstName: 'Luis',
      lastName: 'Torres',
      middleName: 'Gonzales',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSBA',
    },
    // Student Users
    {
      email: 'juan.delacruz@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      middleName: 'Santos',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSCS',
    },
    {
      email: 'maria.santos@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Maria',
      lastName: 'Santos',
      middleName: 'Garcia',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSCS',
    },
    {
      email: 'pedro.gonzales@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Pedro',
      lastName: 'Gonzales',
      middleName: 'Reyes',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSIT',
    },
    {
      email: 'ana.rodriguez@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Ana',
      lastName: 'Rodriguez',
      middleName: 'Cruz',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSIT',
    },
    {
      email: 'jose.fernandez@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Jose',
      lastName: 'Fernandez',
      middleName: 'Lopez',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSA',
    },
    {
      email: 'isabel.morales@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Isabel',
      lastName: 'Morales',
      middleName: 'Alvarez',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSBA',
    },
    {
      email: 'carlos.ramirez@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Carlos',
      lastName: 'Ramirez',
      middleName: 'Diaz',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSCS',
    },
    {
      email: 'lucia.valdez@student.edu',
      password: hashedPassword,
      role: 'student',
      firstName: 'Lucia',
      lastName: 'Valdez',
      middleName: 'Torres',
      isActive: true,
      profilePicture: '',
      assignedProgram: 'BSEE',
    },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`${createdUsers.length} users created!`);
  return createdUsers;
};

// Seed Students
const seedStudents = async (users) => {
  const studentUsers = users.filter((u) => u.role === 'student');

  const students = studentUsers.map((user, index) => {
    const yearLevel = index < 2 ? '4th Year' : index < 5 ? '3rd Year' : '2nd Year';
    
    return {
      user: user._id,
      studentNumber: `2024-${String(10001 + index).padStart(5, '0')}`,
      program: user.assignedProgram,
      yearLevel,
      status: 'Active',
      admissionYear: index < 2 ? '2021' : index < 5 ? '2022' : '2023',
      dateOfBirth: new Date(2002 + (index % 3), index % 12, (index % 28) + 1),
      contactNumber: `+63 9${String(Math.floor(100000000 + Math.random() * 900000000))}`,
      address: {
        street: `${index + 1} Main Street`,
        city: 'Manila',
        province: 'Metro Manila',
        zipCode: '1000',
      },
      emergencyContact: {
        name: `Parent of ${user.firstName}`,
        relationship: 'Parent',
        contactNumber: `+63 9${String(Math.floor(100000000 + Math.random() * 900000000))}`,
      },
      academicHistory: [],
    };
  });

  const createdStudents = await Student.insertMany(students);
  console.log(`${createdStudents.length} students created!`);
  return createdStudents;
};

// Seed Subjects
const seedSubjects = async (instructors) => {
  const subjects = [
    // Computer Science Subjects
    {
      code: 'CS101',
      name: 'Introduction to Computing',
      description: 'Fundamentals of computer science and programming',
      units: 3,
      yearLevel: '1st Year',
      semester: '1st',
      program: 'BSCS',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[0]._id,
          schedule: 'MWF 08:00-11:00',
          room: 'CS-201',
          capacity: 40,
          enrolled: 25,
          isOpen: true,
        },
      ],
    },
    {
      code: 'CS102',
      name: 'Data Structures and Algorithms',
      description: 'Study of fundamental data structures and algorithm design',
      units: 3,
      yearLevel: '2nd Year',
      semester: '1st',
      program: 'BSCS',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[2]._id,
          schedule: 'TTH 13:00-16:00',
          room: 'CS-202',
          capacity: 35,
          enrolled: 30,
          isOpen: true,
        },
      ],
    },
    {
      code: 'CS201',
      name: 'Database Management Systems',
      description: 'Design and implementation of database systems',
      units: 3,
      yearLevel: '2nd Year',
      semester: '2nd',
      program: 'BSCS',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '2nd',
          instructor: instructors[0]._id,
          schedule: 'MW 13:00-16:00',
          room: 'CS-203',
          capacity: 35,
          enrolled: 28,
          isOpen: true,
        },
      ],
    },
    {
      code: 'CS301',
      name: 'Software Engineering',
      description: 'Principles and practices of software development',
      units: 3,
      yearLevel: '3rd Year',
      semester: '1st',
      program: 'BSCS',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[2]._id,
          schedule: 'WF 13:00-16:00',
          room: 'CS-301',
          capacity: 30,
          enrolled: 22,
          isOpen: true,
        },
      ],
    },
    {
      code: 'CS401',
      name: 'Capstone Project',
      description: 'Final year capstone project',
      units: 3,
      yearLevel: '4th Year',
      semester: '1st',
      program: 'BSCS',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[0]._id,
          schedule: 'MWF 13:00-16:00',
          room: 'CS-401',
          capacity: 30,
          enrolled: 15,
          isOpen: true,
        },
      ],
    },
    {
      code: 'CS402',
      name: 'Advanced Algorithms',
      description: 'Advanced algorithm design and analysis',
      units: 3,
      yearLevel: '4th Year',
      semester: '1st',
      program: 'BSCS',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[2]._id,
          schedule: 'TTH 10:00-13:00',
          room: 'CS-402',
          capacity: 30,
          enrolled: 18,
          isOpen: true,
        },
      ],
    },
    // IT Subjects
    {
      code: 'IT101',
      name: 'Fundamentals of Information Technology',
      description: 'Introduction to IT concepts and technologies',
      units: 3,
      yearLevel: '1st Year',
      semester: '1st',
      program: 'BSIT',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[1]._id,
          schedule: 'TTH 08:00-11:00',
          room: 'IT-101',
          capacity: 40,
          enrolled: 32,
          isOpen: true,
        },
      ],
    },
    {
      code: 'IT201',
      name: 'Network Administration',
      description: 'Network setup, configuration, and management',
      units: 3,
      yearLevel: '2nd Year',
      semester: '1st',
      program: 'BSIT',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[1]._id,
          schedule: 'MW 13:00-16:00',
          room: 'IT-201',
          capacity: 35,
          enrolled: 28,
          isOpen: true,
        },
      ],
    },
    // Accounting Subjects
    {
      code: 'ACC101',
      name: 'Principles of Accounting',
      description: 'Basic accounting principles and practices',
      units: 3,
      yearLevel: '1st Year',
      semester: '1st',
      program: 'BSA',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[3]._id,
          schedule: 'MW 08:00-11:00',
          room: 'BUS-101',
          capacity: 40,
          enrolled: 35,
          isOpen: true,
        },
      ],
    },
    {
      code: 'ACC201',
      name: 'Financial Accounting',
      description: 'Advanced financial accounting concepts',
      units: 3,
      yearLevel: '2nd Year',
      semester: '1st',
      program: 'BSA',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[3]._id,
          schedule: 'TTH 13:00-16:00',
          room: 'BUS-201',
          capacity: 35,
          enrolled: 30,
          isOpen: true,
        },
      ],
    },
    // Business Administration Subjects
    {
      code: 'BA101',
      name: 'Introduction to Business',
      description: 'Fundamentals of business and management',
      units: 3,
      yearLevel: '1st Year',
      semester: '1st',
      program: 'BSBA',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[4]._id,
          schedule: 'MF 08:00-11:00',
          room: 'BUS-301',
          capacity: 50,
          enrolled: 42,
          isOpen: true,
        },
      ],
    },
    {
      code: 'BA201',
      name: 'Marketing Management',
      description: 'Principles and strategies of marketing',
      units: 3,
      yearLevel: '2nd Year',
      semester: '1st',
      program: 'BSBA',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[4]._id,
          schedule: 'TTH 08:00-11:00',
          room: 'BUS-302',
          capacity: 45,
          enrolled: 38,
          isOpen: true,
        },
      ],
    },
    // General Education Subjects
    {
      code: 'GE101',
      name: 'Mathematics in the Modern World',
      description: 'Applied mathematics for various disciplines',
      units: 3,
      yearLevel: '1st Year',
      semester: '1st',
      program: 'All Programs',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[0]._id,
          schedule: 'MW 08:00-11:00',
          room: 'GE-101',
          capacity: 50,
          enrolled: 45,
          isOpen: true,
        },
      ],
    },
    {
      code: 'GE102',
      name: 'Purposive Communication',
      description: 'Development of communication skills',
      units: 3,
      yearLevel: '1st Year',
      semester: '1st',
      program: 'All Programs',
      prerequisites: [],
      offerings: [
        {
          schoolYear: '2024-2025',
          semester: '1st',
          instructor: instructors[1]._id,
          schedule: 'TF 13:00-16:00',
          room: 'GE-102',
          capacity: 50,
          enrolled: 48,
          isOpen: true,
        },
      ],
    },
  ];

  const createdSubjects = await Subject.insertMany(subjects);
  console.log(`${createdSubjects.length} subjects created!`);
  return createdSubjects;
};

// Seed Curriculum
const seedCurriculum = async (subjects) => {
  const curricula = [];

  // BSCS Curriculum
  const bscsSubjects = subjects.filter(s => s.program === 'BSCS' || s.program === 'All Programs');
  curricula.push({
    program: 'BSCS',
    effectiveYear: '2024-2025',
    status: 'Active',
    description: 'Computer Science curriculum for AY 2024-2025',
    subjects: bscsSubjects.map(subject => ({
      subject: subject._id,
      yearLevel: subject.yearLevel,
      semester: subject.semester || '1st',
      isRequired: true,
      prerequisites: subject.prerequisites || [],
    })),
    totalUnits: bscsSubjects.reduce((sum, s) => sum + s.units, 0),
  });

  // BSIT Curriculum
  const bsitSubjects = subjects.filter(s => s.program === 'BSIT' || s.program === 'All Programs');
  curricula.push({
    program: 'BSIT',
    effectiveYear: '2024-2025',
    status: 'Active',
    description: 'Information Technology curriculum for AY 2024-2025',
    subjects: bsitSubjects.map(subject => ({
      subject: subject._id,
      yearLevel: subject.yearLevel,
      semester: subject.semester || '1st',
      isRequired: true,
      prerequisites: subject.prerequisites || [],
    })),
    totalUnits: bsitSubjects.reduce((sum, s) => sum + s.units, 0),
  });

  // BSA Curriculum
  const bsaSubjects = subjects.filter(s => s.program === 'BSA' || s.program === 'All Programs');
  curricula.push({
    program: 'BSA',
    effectiveYear: '2024-2025',
    status: 'Active',
    description: 'Accountancy curriculum for AY 2024-2025',
    subjects: bsaSubjects.map(subject => ({
      subject: subject._id,
      yearLevel: subject.yearLevel,
      semester: subject.semester || '1st',
      isRequired: true,
      prerequisites: subject.prerequisites || [],
    })),
    totalUnits: bsaSubjects.reduce((sum, s) => sum + s.units, 0),
  });

  // BSBA Curriculum
  const bsbaSubjects = subjects.filter(s => s.program === 'BSBA' || s.program === 'All Programs');
  curricula.push({
    program: 'BSBA',
    effectiveYear: '2024-2025',
    status: 'Active',
    description: 'Business Administration curriculum for AY 2024-2025',
    subjects: bsbaSubjects.map(subject => ({
      subject: subject._id,
      yearLevel: subject.yearLevel,
      semester: subject.semester || '1st',
      isRequired: true,
      prerequisites: subject.prerequisites || [],
    })),
    totalUnits: bsbaSubjects.reduce((sum, s) => sum + s.units, 0),
  });

  const createdCurricula = await Curriculum.insertMany(curricula);
  console.log(`${createdCurricula.length} curricula created!`);
  return createdCurricula;
};

// Seed Enrollments
const seedEnrollments = async (students, subjects) => {
  const enrollments = [];

  // Create enrollments for each student
  for (let i = 0; i < Math.min(students.length, 6); i++) {
    const student = students[i];
    const studentProgram = student.program;

    // Filter subjects based on student's program and year level
    const availableSubjects = subjects.filter(
      (sub) =>
        (sub.program === studentProgram || sub.program === 'All Programs') &&
        sub.yearLevel <= student.yearLevel
    );

    // Enroll in 4-6 random subjects
    const numSubjects = Math.floor(Math.random() * 3) + 4;
    const selectedSubjects = availableSubjects
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numSubjects, availableSubjects.length));

    const enrollmentSubjects = selectedSubjects.map((subject) => ({
      subject: subject._id,
      offering: subject.offerings[0]._id,
      enrollmentDate: new Date(),
      status: i < 2 ? 'Completed' : 'Enrolled',
    }));

    const totalUnits = selectedSubjects.reduce((sum, sub) => sum + sub.units, 0);

    enrollments.push({
      student: student._id,
      schoolYear: '2024-2025',
      semester: '1st',
      subjects: enrollmentSubjects,
      totalUnits,
      status: i < 2 ? 'Completed' : 'Approved',
      enrollmentType: 'Admin',
      enrollmentDate: new Date(),
    });
  }

  const createdEnrollments = await Enrollment.insertMany(enrollments);
  console.log(`${createdEnrollments.length} enrollments created!`);
  return createdEnrollments;
};

// Seed Tuition
const seedTuition = async (students, enrollments) => {
  const tuitionRecords = [];

  for (let i = 0; i < enrollments.length; i++) {
    const enrollment = enrollments[i];
    const student = students.find((s) => s._id.equals(enrollment.student));

    const tuitionFee = 15000;
    const miscFees = 3000;
    const labFees = 2000;
    const totalAmount = tuitionFee + miscFees + labFees;
    const discount = i % 3 === 0 ? 2000 : 0; // Some students get scholarship
    const netAmount = totalAmount - discount;

    // Create payment history
    const payments = [];
    if (i < 2) {
      // Fully paid students
      payments.push({
        amount: netAmount,
        paymentDate: new Date('2024-08-15'),
        paymentMethod: 'Bank Transfer',
        referenceNumber: `PAY-2024-${String(i + 1).padStart(5, '0')}`,
        remarks: 'Full payment',
      });
    } else if (i < 4) {
      // Partial payment students
      payments.push({
        amount: netAmount / 2,
        paymentDate: new Date('2024-08-15'),
        paymentMethod: 'Cash',
        referenceNumber: `PAY-2024-${String(i + 1).padStart(5, '0')}`,
        remarks: 'First installment',
      });
    }

    // Create installment plan
    const installments = [
      {
        installmentNumber: 1,
        amount: netAmount / 3,
        dueDate: new Date('2024-08-31'),
        isPaid: i < 4,
        paidDate: i < 4 ? new Date('2024-08-15') : null,
        paidAmount: i < 4 ? netAmount / 3 : 0,
      },
      {
        installmentNumber: 2,
        amount: netAmount / 3,
        dueDate: new Date('2024-10-15'),
        isPaid: i < 2,
        paidDate: i < 2 ? new Date('2024-10-10') : null,
        paidAmount: i < 2 ? netAmount / 3 : 0,
      },
      {
        installmentNumber: 3,
        amount: netAmount / 3,
        dueDate: new Date('2024-11-30'),
        isPaid: i < 2,
        paidDate: i < 2 ? new Date('2024-11-25') : null,
        paidAmount: i < 2 ? netAmount / 3 : 0,
      },
    ];

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = netAmount - totalPaid;

    tuitionRecords.push({
      student: student._id,
      enrollment: enrollment._id,
      schoolYear: '2024-2025',
      semester: '1st',
      totalAmount,
      breakdown: [
        { description: 'Tuition Fee', amount: tuitionFee },
        { description: 'Miscellaneous Fees', amount: miscFees },
        { description: 'Laboratory Fees', amount: labFees },
      ],
      discount,
      netAmount,
      totalPaid,
      balance,
      status: i < 2 ? 'Paid' : i < 4 ? 'Partial' : 'Unpaid',
      dueDate: new Date('2024-12-31'),
      paymentPlan: i < 2 ? 'Set A' : 'Set B',
      installments,
      payments,
    });
  }

  const createdTuition = await Tuition.insertMany(tuitionRecords);
  console.log(`${createdTuition.length} tuition records created!`);
  return createdTuition;
};

// Main seed function
const seedAll = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    await clearData();

    // Seed data in order (respecting relationships)
    console.log('\n📚 Seeding Programs...');
    const programs = await seedPrograms();

    console.log('\n👥 Seeding Users...');
    const users = await seedUsers();

    console.log('\n🎓 Seeding Students...');
    const students = await seedStudents(users);

    console.log('\n📖 Seeding Subjects...');
    const instructors = users.filter((u) => u.role === 'instructor');
    const subjects = await seedSubjects(instructors);

    console.log('\n� Seeding Curriculum...');
    const curricula = await seedCurriculum(subjects);

    // Skip enrollments - students will request enrollment manually
    console.log('\n📝 Skipping Enrollments (students will enroll manually)...');
    const enrollments = [];

    // Skip tuition records since no enrollments
    console.log('\n💰 Skipping Tuition Records (will be created after enrollment)...');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Programs: ${programs.length}`);
    console.log(`   - Users: ${users.length} (${users.filter((u) => u.role === 'admin').length} admins, ${instructors.length} instructors, ${users.filter((u) => u.role === 'student').length} students)`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Curricula: ${curricula.length}`);
    console.log(`   - Enrollments: ${enrollments.length} (None - students will enroll manually)`);
    console.log(`   - Tuition Records: ${enrollments.length} (None - created after enrollment)\n`);

    console.log('🔐 Login Credentials:');
    console.log('   Admin: admin@university.edu / password123');
    console.log('   Instructor: prof.santos@university.edu / password123');
    console.log('   Student: juan.delacruz@student.edu / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedAll();
