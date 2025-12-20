import asyncHandler from 'express-async-handler';
import Enrollment from '../enrollment/enrollment.model.js';
import Student from '../students/students.model.js';
import Subject from '../subjects/subjects.model.js';

// @desc    Get registration card
// @route   GET /api/registration/:enrollmentId
// @access  Private
export const getRegistrationCard = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.enrollmentId)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('subjects.subject', 'code name units');

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // Get detailed subject and offering information
  const subjectsWithDetails = await Promise.all(
    enrollment.subjects
      .filter((s) => s.status === 'Enrolled')
      .map(async (enrolledSubject) => {
        const subject = await Subject.findById(enrolledSubject.subject._id).populate(
          'offerings.instructor',
          'firstName lastName middleName'
        );

        const offering = subject.offerings.id(enrolledSubject.offering);

        return {
          code: subject.code,
          name: subject.name,
          units: subject.units,
          instructor: offering?.instructor,
          schedule: offering?.schedule,
          enrollmentDate: enrolledSubject.enrollmentDate,
        };
      })
  );

  const registrationCard = {
    student: {
      studentNumber: enrollment.student.studentNumber,
      name: enrollment.student.user.fullName,
      program: enrollment.student.program,
      yearLevel: enrollment.student.yearLevel,
      email: enrollment.student.user.email,
    },
    academicPeriod: {
      schoolYear: enrollment.schoolYear,
      semester: enrollment.semester,
    },
    subjects: subjectsWithDetails,
    totalUnits: enrollment.totalUnits,
    enrollmentDate: enrollment.enrollmentDate,
    status: enrollment.status,
    generatedDate: new Date(),
  };

  res.json(registrationCard);
});

// @desc    Get registration card by student and period
// @route   GET /api/registration/student/:studentId
// @access  Private
export const getRegistrationCardByStudent = asyncHandler(async (req, res) => {
  const { schoolYear, semester } = req.query;

  if (!schoolYear || !semester) {
    res.status(400);
    throw new Error('School year and semester are required');
  }

  const enrollment = await Enrollment.findOne({
    student: req.params.studentId,
    schoolYear,
    semester,
    status: { $in: ['Approved', 'Completed'] },
  })
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('subjects.subject', 'code name units');

  if (!enrollment) {
    res.status(404);
    throw new Error('No approved enrollment found for this period');
  }

  // Get detailed subject and offering information
  const subjectsWithDetails = await Promise.all(
    enrollment.subjects
      .filter((s) => s.status === 'Enrolled')
      .map(async (enrolledSubject) => {
        const subject = await Subject.findById(enrolledSubject.subject._id).populate(
          'offerings.instructor',
          'firstName lastName middleName'
        );

        const offering = subject.offerings.id(enrolledSubject.offering);

        return {
          code: subject.code,
          name: subject.name,
          units: subject.units,
          instructor: offering?.instructor,
          schedule: offering?.schedule,
          enrollmentDate: enrolledSubject.enrollmentDate,
        };
      })
  );

  const registrationCard = {
    student: {
      studentNumber: enrollment.student.studentNumber,
      name: enrollment.student.user.fullName,
      program: enrollment.student.program,
      yearLevel: enrollment.student.yearLevel,
      email: enrollment.student.user.email,
    },
    academicPeriod: {
      schoolYear: enrollment.schoolYear,
      semester: enrollment.semester,
    },
    subjects: subjectsWithDetails,
    totalUnits: enrollment.totalUnits,
    enrollmentDate: enrollment.enrollmentDate,
    status: enrollment.status,
    generatedDate: new Date(),
  };

  res.json(registrationCard);
});
