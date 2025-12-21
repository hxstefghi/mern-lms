import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolYear: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      enum: ['1st', '2nd', 'Summer'],
      required: true,
    },
    subjects: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        offering: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        enrollmentDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['Enrolled', 'Dropped', 'Completed'],
          default: 'Enrolled',
        },
      },
    ],
    totalUnits: {
      type: Number,
      default: 0,
    },
    paymentPlan: {
      type: String,
      enum: ['Set A', 'Set B'],
      default: 'Set A',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    enrollmentType: {
      type: String,
      enum: ['Admin', 'Self'],
      default: 'Self',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one enrollment per student per semester
enrollmentSchema.index({ student: 1, schoolYear: 1, semester: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
