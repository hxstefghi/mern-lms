import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Program code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    duration: {
      years: {
        type: Number,
        required: [true, 'Duration in years is required'],
        min: 1,
      },
      semesters: {
        type: Number,
        required: [true, 'Total semesters is required'],
        min: 2,
      },
    },
    degree: {
      type: String,
      enum: ['Bachelor', 'Master', 'Doctorate', 'Certificate', 'Diploma'],
      required: [true, 'Degree type is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    enrolledStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
    coordinator: {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full program name with degree
programSchema.virtual('fullName').get(function () {
  return `${this.degree} in ${this.name}`;
});

// Ensure virtuals are included in JSON
programSchema.set('toJSON', { virtuals: true });
programSchema.set('toObject', { virtuals: true });

const Program = mongoose.model('Program', programSchema, 'lms_programs');

export default Program;
