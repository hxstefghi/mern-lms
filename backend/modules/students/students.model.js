import mongoose from 'mongoose';

const academicHistorySchema = new mongoose.Schema({
  schoolYear: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', 'Summer'],
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  grade: {
    type: Number,
    min: 1.0,
    max: 5.0,
  },
  remarks: {
    type: String,
    enum: ['Passed', 'Failed', 'Dropped', 'Incomplete', 'In Progress'],
    default: 'In Progress',
  },
});

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null values during creation before pre-save hook
    },
    program: {
      type: String,
      required: [true, 'Program is required'],
      trim: true,
    },
    yearLevel: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
      required: [true, 'Year level is required'],
    },
    section: {
      type: String,
      required: false,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      street: String,
      city: String,
      province: String,
      zipCode: String,
    },
    contactNumber: {
      type: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      contactNumber: String,
    },
    admissionYear: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Graduated', 'Dropped', 'LOA'], // LOA = Leave of Absence
      default: 'Active',
    },
    academicHistory: [academicHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Generate student number before saving
studentSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  // Generate student number: YEAR-XXXXX (e.g., 2024-00001)
  const year = new Date().getFullYear();
  const count = await mongoose.model('Student').countDocuments();
  const studentNum = String(count + 1).padStart(5, '0');
  this.studentNumber = `${year}-${studentNum}`;

  next();
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
