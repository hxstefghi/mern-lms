import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Online'],
    default: 'Cash',
  },
  referenceNumber: {
    type: String,
  },
  remarks: {
    type: String,
  },
});

const tuitionBreakdownSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const installmentPlanSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidDate: {
    type: Date,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
});

const tuitionSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
      unique: true,
    },
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
    breakdown: [tuitionBreakdownSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentPlan: {
      type: String,
      enum: ['Set A', 'Set B'], // Set A: Full Payment, Set B: Installment
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountReason: {
      type: String,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    installments: [installmentPlanSchema],
    payments: [paymentSchema],
    totalPaid: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid', 'Overdue'],
      default: 'Unpaid',
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update status based on payments
tuitionSchema.methods.updateStatus = function () {
  if (this.totalPaid === 0) {
    this.status = 'Unpaid';
  } else if (this.totalPaid >= this.netAmount) {
    this.status = 'Paid';
    this.balance = 0;
  } else {
    this.status = 'Partial';
  }

  // Check if overdue
  if (this.status !== 'Paid' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }

  this.balance = Math.max(0, this.netAmount - this.totalPaid);
};

const Tuition = mongoose.model('Tuition', tuitionSchema);

export default Tuition;
