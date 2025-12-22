import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false'], required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  offering: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  totalPoints: { type: Number, required: true },
  questions: [questionSchema],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
}, {
  timestamps: true,
});

const submissionAnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  studentAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  points: { type: Number, required: true },
});

const quizSubmissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: [submissionAnswerSchema],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);

export { Quiz, QuizSubmission };
export default Quiz;
