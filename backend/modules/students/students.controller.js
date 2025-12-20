import asyncHandler from 'express-async-handler';
import Student from './students.model.js';
import User from '../auth/auth.model.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
export const getStudents = asyncHandler(async (req, res) => {
  const { search, program, yearLevel, status, page = 1, limit = 10 } = req.query;

  const query = {};

  if (program) query.program = program;
  if (yearLevel) query.yearLevel = yearLevel;
  if (status) query.status = status;

  const students = await Student.find(query)
    .populate('user', 'firstName lastName middleName email profilePicture')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  // Apply search filter after population
  let filteredStudents = students;
  if (search) {
    filteredStudents = students.filter((student) => {
      const fullName = student.user?.fullName?.toLowerCase() || '';
      const studentNumber = student.studentNumber.toLowerCase();
      const searchTerm = search.toLowerCase();
      return fullName.includes(searchTerm) || studentNumber.includes(searchTerm);
    });
  }

  const count = await Student.countDocuments(query);

  res.json({
    students: filteredStudents,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalStudents: count,
  });
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'firstName lastName middleName email profilePicture')
    .populate('academicHistory.subject', 'code name units')
    .populate('academicHistory.instructor', 'firstName lastName middleName');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json(student);
});

// @desc    Get student by user ID
// @route   GET /api/students/user/:userId
// @access  Private
export const getStudentByUserId = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.params.userId })
    .populate('user', 'firstName lastName middleName email profilePicture')
    .populate('academicHistory.subject', 'code name units')
    .populate('academicHistory.instructor', 'firstName lastName middleName');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json(student);
});

// @desc    Create student profile
// @route   POST /api/students
// @access  Private/Admin
export const createStudent = asyncHandler(async (req, res) => {
  const {
    userId,
    program,
    yearLevel,
    dateOfBirth,
    address,
    contactNumber,
    emergencyContact,
    admissionYear,
  } = req.body;

  // Check if user exists and is a student
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'student') {
    res.status(400);
    throw new Error('User is not a student');
  }

  // Check if student profile already exists
  const studentExists = await Student.findOne({ user: userId });
  if (studentExists) {
    res.status(400);
    throw new Error('Student profile already exists');
  }

  const student = await Student.create({
    user: userId,
    program,
    yearLevel,
    dateOfBirth,
    address,
    contactNumber,
    emergencyContact,
    admissionYear: admissionYear || new Date().getFullYear().toString(),
  });

  const populatedStudent = await Student.findById(student._id).populate(
    'user',
    'firstName lastName middleName email'
  );

  res.status(201).json(populatedStudent);
});

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private/Admin
export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const {
    program,
    yearLevel,
    dateOfBirth,
    address,
    contactNumber,
    emergencyContact,
    status,
  } = req.body;

  student.program = program || student.program;
  student.yearLevel = yearLevel || student.yearLevel;
  student.dateOfBirth = dateOfBirth || student.dateOfBirth;
  student.address = address || student.address;
  student.contactNumber = contactNumber || student.contactNumber;
  student.emergencyContact = emergencyContact || student.emergencyContact;
  student.status = status || student.status;

  const updatedStudent = await student.save();

  const populatedStudent = await Student.findById(updatedStudent._id).populate(
    'user',
    'firstName lastName middleName email'
  );

  res.json(populatedStudent);
});

// @desc    Delete student profile
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await student.deleteOne();

  res.json({ message: 'Student profile removed' });
});

// @desc    Get student academic history
// @route   GET /api/students/:id/academic-history
// @access  Private
export const getAcademicHistory = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('academicHistory.subject', 'code name units')
    .populate('academicHistory.instructor', 'firstName lastName middleName');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json(student.academicHistory);
});

// @desc    Add to academic history
// @route   POST /api/students/:id/academic-history
// @access  Private/Admin
export const addAcademicHistory = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const { schoolYear, semester, subject, instructor, grade, remarks } = req.body;

  student.academicHistory.push({
    schoolYear,
    semester,
    subject,
    instructor,
    grade,
    remarks,
  });

  await student.save();

  const updatedStudent = await Student.findById(student._id)
    .populate('academicHistory.subject', 'code name units')
    .populate('academicHistory.instructor', 'firstName lastName middleName');

  res.status(201).json(updatedStudent.academicHistory);
});
