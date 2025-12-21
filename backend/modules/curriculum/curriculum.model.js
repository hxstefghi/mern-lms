import mongoose from 'mongoose';

const curriculumSubjectSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  yearLevel: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
    required: true,
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', 'Summer'],
    required: true,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
});

const curriculumSchema = new mongoose.Schema(
  {
    program: {
      type: String,
      required: true,
    },
    effectiveYear: {
      type: String,
      required: true,
    },
    subjects: [curriculumSubjectSchema],
    totalUnits: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
curriculumSchema.index({ program: 1, effectiveYear: 1 });

const Curriculum = mongoose.model('Curriculum', curriculumSchema);

export default Curriculum;
