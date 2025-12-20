import asyncHandler from 'express-async-handler';
import Tuition from './tuition.model.js';
import Enrollment from '../enrollment/enrollment.model.js';
import Student from '../students/students.model.js';
import Subject from '../subjects/subjects.model.js';

// Constants for tuition calculation
const TUITION_PER_UNIT = 500; // Base tuition per unit
const MISC_FEES = 5000; // Miscellaneous fees
const LAB_FEE_PER_SUBJECT = 1000; // Lab fee per subject (if applicable)
const FULL_PAYMENT_DISCOUNT = 0.05; // 5% discount for Set A (full payment)

// @desc    Get all tuitions
// @route   GET /api/tuitions
// @access  Private/Admin
export const getTuitions = asyncHandler(async (req, res) => {
  const { schoolYear, semester, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (schoolYear) query.schoolYear = schoolYear;
  if (semester) query.semester = semester;
  if (status) query.status = status;

  const tuitions = await Tuition.find(query)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('enrollment')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Tuition.countDocuments(query);

  res.json({
    tuitions,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalTuitions: count,
  });
});

// @desc    Get tuition by ID
// @route   GET /api/tuitions/:id
// @access  Private
export const getTuitionById = asyncHandler(async (req, res) => {
  const tuition = await Tuition.findById(req.params.id)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate({
      path: 'enrollment',
      populate: {
        path: 'subjects.subject',
        select: 'code name units',
      },
    });

  if (!tuition) {
    res.status(404);
    throw new Error('Tuition record not found');
  }

  res.json(tuition);
});

// @desc    Get tuition by enrollment ID
// @route   GET /api/tuitions/enrollment/:enrollmentId
// @access  Private
export const getTuitionByEnrollment = asyncHandler(async (req, res) => {
  const tuition = await Tuition.findOne({ enrollment: req.params.enrollmentId })
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate({
      path: 'enrollment',
      populate: {
        path: 'subjects.subject',
        select: 'code name units',
      },
    });

  if (!tuition) {
    res.status(404);
    throw new Error('Tuition record not found');
  }

  res.json(tuition);
});

// @desc    Get student tuitions
// @route   GET /api/tuitions/student/:studentId
// @access  Private
export const getStudentTuitions = asyncHandler(async (req, res) => {
  const tuitions = await Tuition.find({ student: req.params.studentId })
    .populate('enrollment')
    .sort({ schoolYear: -1, semester: -1 });

  res.json(tuitions);
});

// @desc    Create tuition record
// @route   POST /api/tuitions
// @access  Private/Admin
export const createTuition = asyncHandler(async (req, res) => {
  const { enrollmentId, paymentPlan, additionalFees, discount, discountReason } = req.body;

  // Check if enrollment exists
  const enrollment = await Enrollment.findById(enrollmentId).populate('subjects.subject');

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // Check if tuition already exists
  const existingTuition = await Tuition.findOne({ enrollment: enrollmentId });
  if (existingTuition) {
    res.status(400);
    throw new Error('Tuition record already exists for this enrollment');
  }

  // Calculate tuition breakdown
  const breakdown = [];

  // Base tuition (per unit)
  const baseTuition = enrollment.totalUnits * TUITION_PER_UNIT;
  breakdown.push({
    description: `Tuition Fee (${enrollment.totalUnits} units x ${TUITION_PER_UNIT})`,
    amount: baseTuition,
  });

  // Miscellaneous fees
  breakdown.push({
    description: 'Miscellaneous Fees',
    amount: MISC_FEES,
  });

  // Lab fees (simplified - assuming some subjects have lab fees)
  const labSubjectsCount = Math.floor(enrollment.subjects.length / 2);
  if (labSubjectsCount > 0) {
    const labFees = labSubjectsCount * LAB_FEE_PER_SUBJECT;
    breakdown.push({
      description: `Laboratory Fees (${labSubjectsCount} subjects)`,
      amount: labFees,
    });
  }

  // Additional fees
  if (additionalFees && additionalFees.length > 0) {
    breakdown.push(...additionalFees);
  }

  // Calculate total
  const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);

  // Apply discount
  let finalDiscount = discount || 0;
  if (paymentPlan === 'Set A') {
    finalDiscount += totalAmount * FULL_PAYMENT_DISCOUNT;
  }

  const netAmount = totalAmount - finalDiscount;

  // Create installment plan for Set B
  const installments = [];
  let dueDate = new Date();

  if (paymentPlan === 'Set B') {
    // 4 installments
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
    // Set A - full payment due in 30 days
    dueDate.setDate(dueDate.getDate() + 30);
  }

  // Create tuition record
  const tuition = await Tuition.create({
    enrollment: enrollmentId,
    student: enrollment.student,
    schoolYear: enrollment.schoolYear,
    semester: enrollment.semester,
    breakdown,
    totalAmount,
    paymentPlan,
    discount: finalDiscount,
    discountReason: discountReason || (paymentPlan === 'Set A' ? 'Full Payment Discount' : ''),
    netAmount,
    installments,
    balance: netAmount,
    dueDate,
  });

  const populatedTuition = await Tuition.findById(tuition._id)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('enrollment');

  res.status(201).json(populatedTuition);
});

// @desc    Add payment
// @route   POST /api/tuitions/:id/payments
// @access  Private/Admin
export const addPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, referenceNumber, remarks } = req.body;

  const tuition = await Tuition.findById(req.params.id);

  if (!tuition) {
    res.status(404);
    throw new Error('Tuition record not found');
  }

  // Validate payment amount
  if (amount <= 0) {
    res.status(400);
    throw new Error('Payment amount must be greater than 0');
  }

  if (amount > tuition.balance) {
    res.status(400);
    throw new Error('Payment amount exceeds balance');
  }

  // Add payment
  tuition.payments.push({
    amount,
    paymentMethod,
    referenceNumber,
    remarks,
  });

  // Update total paid
  tuition.totalPaid += amount;

  // Update installment status if applicable
  if (tuition.paymentPlan === 'Set B') {
    let remainingPayment = amount;

    for (const installment of tuition.installments) {
      if (!installment.isPaid && remainingPayment > 0) {
        const amountToApply = Math.min(
          remainingPayment,
          installment.amount - installment.paidAmount
        );

        installment.paidAmount += amountToApply;
        remainingPayment -= amountToApply;

        if (installment.paidAmount >= installment.amount) {
          installment.isPaid = true;
          installment.paidDate = new Date();
        }
      }
    }
  }

  // Update status and balance
  tuition.updateStatus();

  await tuition.save();

  const updatedTuition = await Tuition.findById(tuition._id)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('enrollment');

  res.json(updatedTuition);
});

// @desc    Update tuition
// @route   PUT /api/tuitions/:id
// @access  Private/Admin
export const updateTuition = asyncHandler(async (req, res) => {
  const tuition = await Tuition.findById(req.params.id);

  if (!tuition) {
    res.status(404);
    throw new Error('Tuition record not found');
  }

  const { breakdown, discount, discountReason } = req.body;

  if (breakdown) {
    tuition.breakdown = breakdown;
    tuition.totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);
  }

  if (discount !== undefined) {
    tuition.discount = discount;
  }

  if (discountReason) {
    tuition.discountReason = discountReason;
  }

  // Recalculate net amount and balance
  tuition.netAmount = tuition.totalAmount - tuition.discount;
  tuition.updateStatus();

  await tuition.save();

  const updatedTuition = await Tuition.findById(tuition._id)
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName middleName email',
      },
    })
    .populate('enrollment');

  res.json(updatedTuition);
});

// @desc    Delete tuition
// @route   DELETE /api/tuitions/:id
// @access  Private/Admin
export const deleteTuition = asyncHandler(async (req, res) => {
  const tuition = await Tuition.findById(req.params.id);

  if (!tuition) {
    res.status(404);
    throw new Error('Tuition record not found');
  }

  await tuition.deleteOne();

  res.json({ message: 'Tuition record deleted' });
});
