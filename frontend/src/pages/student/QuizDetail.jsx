import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, studentsAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Clock, FileText, CheckCircle, Calendar, PlayCircle, ArrowLeft, Award } from 'lucide-react';
import { toast } from 'react-toastify';

const QuizDetail = () => {
  const { offeringId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (student) {
      fetchQuizDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, quizId]);

  const fetchStudent = async () => {
    try {
      const res = await studentsAPI.getStudentByUserId(user._id);
      setStudent(res.data);
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(quizId);
      setQuiz(response.data.quiz);

      // Check if student has submitted
      if (student) {
        try {
          const subResponse = await quizAPI.getSubmission(quizId, student._id);
          setSubmission(subResponse.data.submission);
        } catch {
          setSubmission(null);
        }
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = () => {
    const isExpired = quiz.expiresAt && new Date(quiz.expiresAt) < new Date();
    if (isExpired) {
      toast.error('This quiz has expired');
      return;
    }
    navigate(`../quizzes/${quizId}/take`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const isExpired = quiz.expiresAt && new Date(quiz.expiresAt) < new Date();
  const hasSubmission = submission !== null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Quizzes</span>
      </button>

      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 text-lg">{quiz.description}</p>
              )}
            </div>
            {hasSubmission ? (
              <span className="inline-flex px-4 py-2 text-sm font-medium rounded-full bg-green-100 text-green-800">
                Completed
              </span>
            ) : isExpired ? (
              <span className="inline-flex px-4 py-2 text-sm font-medium rounded-full bg-red-100 text-red-800">
                Expired
              </span>
            ) : (
              <span className="inline-flex px-4 py-2 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                Available
              </span>
            )}
          </div>

          {/* Quiz Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{quiz.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-lg font-semibold text-gray-900">{quiz.questions?.length || 0}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-lg font-semibold text-gray-900">{quiz.totalPoints}</p>
              </div>
            </div>
          </div>

          {/* Expiration Info */}
          {quiz.expiresAt && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              isExpired ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Calendar className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-yellow-600'}`} />
                <span className={`font-medium ${isExpired ? 'text-red-900' : 'text-yellow-900'}`}>
                  {isExpired ? 'Expired on:' : 'Expires on:'} {new Date(quiz.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submission Results */}
        {hasSubmission && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-md p-8 mb-6 border border-indigo-200">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-8 h-8 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Results</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Score</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {submission.score}/{quiz.totalPoints}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Percentage</p>
                <p className="text-3xl font-bold text-purple-600">
                  {((submission.score / quiz.totalPoints) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Submitted</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Question Results */}
            {submission.answers && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Question Results</h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {submission.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded text-center font-semibold ${
                        answer.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!hasSubmission && !isExpired && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to take the quiz?</h3>
              <p className="text-gray-600 mb-6">
                Make sure you have enough time and a stable internet connection before starting.
              </p>
              <button
                onClick={handleTakeQuiz}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                <PlayCircle className="w-6 h-6" />
                <span>Start Quiz</span>
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDetail;
