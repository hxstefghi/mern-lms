import Quiz, { QuizSubmission } from './quiz.model.js';

const quizController = {
  // Create a new quiz
  async createQuiz(req, res) {
    try {
      const { subjectId, offeringId } = req.params;
      const { title, description, duration, totalPoints, questions } = req.body;

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Questions are required' });
      }

      // Validate questions format
      for (const q of questions) {
        if (!q.question || !q.type || !q.options || !q.correctAnswer) {
          return res.status(400).json({ 
            message: 'Each question must have: question, type, options, and correctAnswer' 
          });
        }
      }

      const quiz = await Quiz.create({
        subject: subjectId,
        offering: offeringId,
        title,
        description,
        duration,
        totalPoints,
        questions,
        status: 'draft',
      });

      res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
      console.error('Error creating quiz:', error);
      res.status(500).json({ message: 'Failed to create quiz', error: error.message });
    }
  },

  // Get all quizzes for an offering
  async getQuizzes(req, res) {
    try {
      const { offeringId } = req.params;
      const userRole = req.user?.role;

      // Instructors get quizzes with answers, students without
      const includeAnswers = userRole === 'instructor' || userRole === 'admin';
      
      let quizzes = await Quiz.find({ offering: offeringId })
        .sort({ createdAt: -1 })
        .lean();

      // Remove correct answers for students
      if (!includeAnswers) {
        quizzes = quizzes.map(quiz => {
          if (quiz.questions) {
            quiz.questions = quiz.questions.map(q => {
              const { correctAnswer, ...questionWithoutAnswer } = q;
              return questionWithoutAnswer;
            });
          }
          return quiz;
        });
      }

      res.json({ quizzes });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
    }
  },

  // Get a specific quiz
  async getQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const userRole = req.user?.role;

      let quiz = await Quiz.findById(quizId).lean();

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Remove correct answers for students
      if (userRole === 'student' && quiz.questions) {
        quiz.questions = quiz.questions.map(q => {
          const { correctAnswer, ...questionWithoutAnswer } = q;
          return questionWithoutAnswer;
        });
      }

      res.json({ quiz });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
    }
  },

  // Update a quiz
  async updateQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const updateData = req.body;

      const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      res.json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
      console.error('Error updating quiz:', error);
      res.status(500).json({ message: 'Failed to update quiz', error: error.message });
    }
  },

  // Delete a quiz
  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;

      // Delete all submissions for this quiz
      await QuizSubmission.deleteMany({ quiz: quizId });

      const quiz = await Quiz.findByIdAndDelete(quizId);

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
    }
  },

  // Submit quiz answers (student)
  async submitQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const { studentId, answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Answers array is required' });
      }

      // Get quiz with correct answers
      const quiz = await Quiz.findById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Calculate score
      let score = 0;
      const gradedAnswers = answers.map((answer, index) => {
        const question = quiz.questions[index];
        const isCorrect = answer === question.correctAnswer;
        
        if (isCorrect) {
          score += question.points || 1;
        }

        return {
          questionIndex: index,
          studentAnswer: answer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          points: isCorrect ? (question.points || 1) : 0,
        };
      });

      // Check if student already submitted
      let submission = await QuizSubmission.findOne({ quiz: quizId, student: studentId });

      if (submission) {
        // Update existing submission
        submission.answers = gradedAnswers;
        submission.score = score;
        submission.submittedAt = new Date();
        await submission.save();
      } else {
        // Create new submission
        submission = await QuizSubmission.create({
          quiz: quizId,
          student: studentId,
          answers: gradedAnswers,
          score,
        });
      }

      res.json({ message: 'Quiz submitted successfully', submission });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
    }
  },

  // Get student's quiz submission
  async getSubmission(req, res) {
    try {
      const { quizId, studentId } = req.params;

      const submission = await QuizSubmission.findOne({ quiz: quizId, student: studentId })
        .populate({
          path: 'student',
          select: 'studentNumber program yearLevel',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        });

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      res.json({ submission });
    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
    }
  },

  // Get all submissions for a quiz (instructor)
  async getQuizSubmissions(req, res) {
    try {
      const { quizId } = req.params;

      const submissions = await QuizSubmission.find({ quiz: quizId })
        .populate({
          path: 'student',
          select: 'studentNumber program yearLevel',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        })
        .sort({ submittedAt: -1 });

      res.json({ submissions });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
  },
};

export default quizController;
