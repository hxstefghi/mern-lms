import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, studentsAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const TakeQuiz = () => {
  const { offeringId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (student) {
      fetchQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  const fetchStudent = async () => {
    try {
      const res = await studentsAPI.getStudentByUserId(user._id);
      setStudent(res.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student information');
    }
  };

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(quizId);
      setQuiz(response.data.quiz);
      setAnswers(new Array(response.data.quiz.questions.length).fill(''));
      setTimeRemaining(response.data.quiz.duration * 60); // Convert to seconds
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [quizId, navigate]);

  // Timer effect
  useEffect(() => {
    if (!quiz || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeRemaining]);

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;

    if (!student) {
      toast.error('Student information not found');
      return;
    }

    // Check if all questions are answered
    if (!autoSubmit && answers.some(answer => !answer)) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const submissionData = {
        studentId: student._id,
        answers,
      };

      await quizAPI.submitQuiz(quizId, submissionData);
      toast.success(autoSubmit ? 'Time is up! Quiz submitted automatically.' : 'Quiz submitted successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600">{quiz.description}</p>
              )}
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>{quiz.questions.length} Questions</span>
            <span>{quiz.totalPoints} Points</span>
            <span>{quiz.duration} Minutes</span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Important Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure you have a stable internet connection</li>
              <li>The quiz will auto-submit when time runs out</li>
              <li>You cannot pause or resume the quiz</li>
              <li>Answer all questions before submitting</li>
            </ul>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 mb-1">{question.question}</p>
                  <p className="text-sm text-gray-500">{question.points} point{question.points !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {question.type === 'multiple-choice' && (
                <div className="space-y-3 ml-12">
                  {question.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[index] === option
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'true-false' && (
                <div className="space-y-3 ml-12">
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[index] === option
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'short-answer' && (
                <div className="ml-12">
                  <textarea
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Type your answer here..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 rounded-t-lg shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{answers.filter(a => a).length}</span> of {quiz.questions.length} answered
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
