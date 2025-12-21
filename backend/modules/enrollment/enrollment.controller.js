import asyncHandler from 'express-async-handler';
import Enrollment from './enrollment.model.js';
import Student from '../students/students.model.js';
import Subject from '../subjects/subjects.model.js';

// Helper function to check schedule conflicts
const checkScheduleConflict = (schedule1, schedule2) => {
  if (!Array.isArray(schedule1) || !Array.isArray(schedule2)) {
    return false;
  }
  for (const s1 of schedule1) {
    for (const s2 of schedule2) {
      if (!s1 || !s2) continue;
      if (s1.day === s2.day) {
        const start1 = new Date(`2000-01-01 ${s1.startTime}`);
        const end1 = new Date(`2000-01-01 ${s1.endTime}`);
        const start2 = new Date(`2000-01-01 ${s2.startTime}`);
        const end2 = new Date(`2000-01-01 ${s2.endTime}`);

        // Check if times overlap
        if (start1 < end2 && start2 < end1) {
          return true;
        }
      }
    }
  }
  return false;
};

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private/Admin
export const getEnrollments = asyncHandler(async (req, res) => {
  const { schoolYear, semester, status, studentId, page = 1, limit = 10 } = req.query;

  const query = {};
  if (schoolYear) query.schoolYear = schoolYear;
  if (semester) query.semester = semester;
  if (status) query.status = status;
  if (studentId) query.student = studentId;

  const enrollments = await Enrollment.find(query)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('subjects.subject', 'code name units')
    .populate('approvedBy', 'firstName lastName middleName')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Enrollment.countDocuments(query);

  // Enrich enrollments with offering details
  const enrichedEnrollments = await Promise.all(
    enrollments.map(async (enrollment) => {
      const enrichedSubjects = await Promise.all(
        enrollment.subjects.map(async (subjectEntry) => {
          const subjectDoc = await Subject.findById(subjectEntry.subject?._id);
          const offering = subjectDoc?.offerings?.id(subjectEntry.offering);

          return {
            ...subjectEntry.toObject(),
            offering: offering ? offering.toObject() : subjectEntry.offering,
          };
        })
      );

      return {
        ...enrollment.toObject(),
        subjects: enrichedSubjects,
      };
    })
  );

  res.json({
    enrollments: enrichedEnrollments,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalEnrollments: count,
  });
});

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
export const getEnrollmentById = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate({
      path: 'subjects.subject',
      select: 'code name units',
    })
    .populate('approvedBy', 'firstName lastName middleName');

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // Populate offering details from subjects
  const populatedSubjects = await Promise.all(
    enrollment.subjects.map(async (enrolledSubject) => {
      const subject = await Subject.findById(enrolledSubject.subject._id).populate(
        'offerings.instructor',
        'firstName lastName middleName'
      );

      const offering = subject.offerings.id(enrolledSubject.offering);

      return {
        ...enrolledSubject.toObject(),
        offeringDetails: offering,
      };
    })
  );

  res.json({
    ...enrollment.toObject(),
    subjects: populatedSubjects,
  });
});

// @desc    Get student enrollments
// @route   GET /api/enrollments/student/:studentId
// @access  Private
export const getStudentEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.params.studentId })
    .populate('subjects.subject', 'code name units')
    .populate('approvedBy', 'firstName lastName middleName')
    .sort({ schoolYear: -1, semester: -1 });

  // Attach offering details so frontend can render schedule/instructor/room and build correct offeringId routes
  const enrichedEnrollments = await Promise.all(
    enrollments.map(async (enrollment) => {
      const enrichedSubjects = await Promise.all(
        enrollment.subjects.map(async (subjectEntry) => {
          const subjectDoc = await Subject.findById(subjectEntry.subject?._id).populate(
            'offerings.instructor',
            'firstName lastName middleName email'
          );

          const offering = subjectDoc?.offerings?.id(subjectEntry.offering);

          return {
            ...subjectEntry.toObject(),
            subject: subjectEntry.subject,
            offering: offering ? offering.toObject() : null,
          };
        })
      );

      return {
        ...enrollment.toObject(),
        subjects: enrichedSubjects,
      };
    })
  );

  res.json(enrichedEnrollments);
});

// @desc    Create enrollment (Self or Admin)
// @route   POST /api/enrollments
// @access  Private
export const createEnrollment = asyncHandler(async (req, res) => {
  const { studentId, schoolYear, semester, subjects, enrollmentType, paymentPlan } = req.body;

  // Check if student exists
  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check if enrollment already exists for this period
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    schoolYear,
    semester,
  });

  if (existingEnrollment) {
    res.status(400);
    throw new Error('Enrollment already exists for this school year and semester');
  }

  // Validate subjects and check conflicts
  let totalUnits = 0;
  const enrollmentSubjects = [];

  for (const subjectData of subjects) {
    const subject = await Subject.findById(subjectData.subjectId);

    if (!subject) {
      res.status(404);
      throw new Error(`Subject not found: ${subjectData.subjectId}`);
    }

    // Find the offering
    const offering = subject.offerings.id(subjectData.offeringId);

    if (!offering) {
      res.status(404);
      throw new Error(`Offering not found for subject: ${subject.code}`);
    }

    // Check if offering is open and has capacity
    if (!offering.isOpen) {
      res.status(400);
      throw new Error(`Subject ${subject.code} is not open for enrollment`);
    }

    if (offering.enrolled >= offering.capacity) {
      res.status(400);
      throw new Error(`Subject ${subject.code} is full`);
    }

    // Check schedule conflicts
    for (const enrolled of enrollmentSubjects) {
      const enrolledSubject = await Subject.findById(enrolled.subject);
      const enrolledOffering = enrolledSubject.offerings.id(enrolled.offering);

      if (checkScheduleConflict(offering.schedule, enrolledOffering.schedule)) {
        res.status(400);
        throw new Error(
          `Schedule conflict between ${subject.code} and ${enrolledSubject.code}`
        );
      }
    }

    // Check prerequisites
    if (subject.prerequisites && subject.prerequisites.length > 0) {
      for (const prereq of subject.prerequisites) {
        const hasCompleted = student.academicHistory.some(
          (history) =>
            history.subject.toString() === prereq.toString() &&
            history.remarks === 'Passed'
        );

        if (!hasCompleted) {
          const prereqSubject = await Subject.findById(prereq);
          res.status(400);
          throw new Error(
            `Prerequisite not met for ${subject.code}: ${prereqSubject.code}`
          );
        }
      }
    }

    totalUnits += subject.units;

    enrollmentSubjects.push({
      subject: subject._id,
      offering: offering._id,
      status: 'Enrolled',
    });

    // Increment enrolled count
    offering.enrolled += 1;
    await subject.save();
  }

  // Check unit limits (typically 15-24 units per semester)
  if (semester !== 'Summer' && (totalUnits < 12 || totalUnits > 24)) {
    res.status(400);
    throw new Error('Total units must be between 12 and 24 for regular semester');
  }

  if (semester === 'Summer' && totalUnits > 9) {
    res.status(400);
    throw new Error('Total units must not exceed 9 for summer semester');
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    schoolYear,
    semester,
    subjects: enrollmentSubjects,
    totalUnits,
    paymentPlan: paymentPlan || 'Set A',
    enrollmentType: enrollmentType || 'Self',
    status: enrollmentType === 'Admin' ? 'Approved' : 'Pending',
    approvedBy: enrollmentType === 'Admin' ? req.user.id : undefined,
    approvalDate: enrollmentType === 'Admin' ? new Date() : undefined,
  });

  // Auto-create tuition for admin enrollments (immediately approved)
  if (enrollmentType === 'Admin') {
    const Tuition = (await import('../tuition/tuition.model.js')).default;
    
    console.log('Creating tuition for admin enrollment:', enrollment._id);
    
    // Calculate tuition
    const TUITION_PER_UNIT = 500;
    const MISC_FEES = 5000;
    const FULL_PAYMENT_DISCOUNT = 0.05;
    
    const breakdown = [];
    const baseTuition = totalUnits * TUITION_PER_UNIT;
    breakdown.push({
      description: `Tuition Fee (${totalUnits} units × ${TUITION_PER_UNIT})`,
      amount: baseTuition,
    });
    
    breakdown.push({
      description: 'Miscellaneous Fees',
      amount: MISC_FEES,
    });
    
    const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);
    
    // Apply discount for Set A
    let discount = 0;
    if (paymentPlan === 'Set A') {
      discount = totalAmount * FULL_PAYMENT_DISCOUNT;
    }
    
    const netAmount = totalAmount - discount;
    
    // Create installments for Set B
    const installments = [];
    let dueDate = new Date();
    
    if (paymentPlan === 'Set B') {
      const installmentAmount = netAmount / 4;
      for (let i = 1; i <= 4; i++) {
        const installmentDueDate = new Date();
        installmentDueDate.setMonth(installmentDueDate.getMonth() + i);
        installments.push({
          installmentNumber: i,
          amount: installmentAmount,
          dueDate: installmentDueDate,
        });
      }
      dueDate = installments[0].dueDate;
    } else {
      dueDate.setDate(dueDate.getDate() + 30);
    }
    
    await Tuition.create({
      enrollment: enrollment._id,
      student: studentId,
      schoolYear,
      semester,
      breakdown,
      totalAmount,
      paymentPlan: paymentPlan || 'Set A',
      discount,
      netAmount,
      balance: netAmount,
      installments,
      dueDate,
    });
    
    console.log('Tuition created successfully for admin enrollment');
  }

  const populatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('subjects.subject', 'code name units');

  res.status(201).json(populatedEnrollment);
});

// @desc    Update enrollment status (approve/reject)
// @route   PUT /api/enrollments/:id/status
// @access  Private/Admin
export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  const enrollment = await Enrollment.findById(req.params.id).populate('subjects.subject');

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  enrollment.status = status;
  enrollment.remarks = remarks;

  if (status === 'Approved') {
    enrollment.approvedBy = req.user.id;
    enrollment.approvalDate = new Date();

    // Auto-create tuition record if it doesn't exist
    const Tuition = (await import('../tuition/tuition.model.js')).default;
    const existingTuition = await Tuition.findOne({ enrollment: enrollment._id });
    
    if (!existingTuition) {
      console.log('Creating tuition for enrollment:', enrollment._id);
      
      // Calculate tuition
      const TUITION_PER_UNIT = 500;
      const MISC_FEES = 5000;
      const FULL_PAYMENT_DISCOUNT = 0.05;
      
      const breakdown = [];
      const baseTuition = enrollment.totalUnits * TUITION_PER_UNIT;
      breakdown.push({
        description: `Tuition Fee (${enrollment.totalUnits} units × ${TUITION_PER_UNIT})`,
        amount: baseTuition,
      });
      
      breakdown.push({
        description: 'Miscellaneous Fees',
        amount: MISC_FEES,
      });
      
      const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);
      
      // Apply discount for Set A
      let discount = 0;
      if (enrollment.paymentPlan === 'Set A') {
        discount = totalAmount * FULL_PAYMENT_DISCOUNT;
      }
      
      const netAmount = totalAmount - discount;
      
      // Create installments for Set B
      const installments = [];
      let dueDate = new Date();
      
      if (enrollment.paymentPlan === 'Set B') {
        const installmentAmount = netAmount / 4;
        for (let i = 1; i <= 4; i++) {
          const installmentDueDate = new Date();
          installmentDueDate.setMonth(installmentDueDate.getMonth() + i);
          installments.push({
            installmentNumber: i,
            amount: installmentAmount,
            dueDate: installmentDueDate,
          });
        }
        dueDate = installments[0].dueDate;
      } else {
        dueDate.setDate(dueDate.getDate() + 30);
      }
      
      await Tuition.create({
        enrollment: enrollment._id,
        student: enrollment.student,
        schoolYear: enrollment.schoolYear,
        semester: enrollment.semester,
        breakdown,
        totalAmount,
        paymentPlan: enrollment.paymentPlan || 'Set A',
        discount,
        netAmount,
        balance: netAmount,
        installments,
        dueDate,
      });
      
      console.log('Tuition created successfully');
    }
  }

  // If rejected, decrement enrolled count in offerings
  if (status === 'Rejected') {
    for (const enrolledSubject of enrollment.subjects) {
      const subject = await Subject.findById(enrolledSubject.subject);
      const offering = subject.offerings.id(enrolledSubject.offering);
      if (offering) {
        offering.enrolled = Math.max(0, offering.enrolled - 1);
        await subject.save();
      }
    }
  }

  await enrollment.save();

  const updatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('subjects.subject', 'code name units')
    .populate('approvedBy', 'firstName lastName middleName');

  res.json(updatedEnrollment);
});

// @desc    Drop subject from enrollment
// @route   PUT /api/enrollments/:id/drop-subject
// @access  Private
export const dropSubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.body;

  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  const enrolledSubject = enrollment.subjects.find(
    (s) => s.subject.toString() === subjectId
  );

  if (!enrolledSubject) {
    res.status(404);
    throw new Error('Subject not found in enrollment');
  }

  // Update subject status to dropped
  enrolledSubject.status = 'Dropped';

  // Decrement enrolled count in offering
  const subject = await Subject.findById(subjectId);
  const offering = subject.offerings.id(enrolledSubject.offering);
  if (offering) {
    offering.enrolled = Math.max(0, offering.enrolled - 1);
    await subject.save();
  }

  // Recalculate total units
  const subjectDoc = await Subject.findById(subjectId);
  enrollment.totalUnits -= subjectDoc.units;

  await enrollment.save();

  res.json(enrollment);
});

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private/Admin
export const deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // Decrement enrolled count for all subjects
  for (const enrolledSubject of enrollment.subjects) {
    const subject = await Subject.findById(enrolledSubject.subject);
    const offering = subject.offerings.id(enrolledSubject.offering);
    if (offering) {
      offering.enrolled = Math.max(0, offering.enrolled - 1);
      await subject.save();
    }
  }

  await enrollment.deleteOne();

  res.json({ message: 'Enrollment deleted' });
});
