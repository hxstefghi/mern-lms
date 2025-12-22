import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, studentsAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Clock, FileText, CheckCircle, Calendar, PlayCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const CourseQuizzes = () => {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (student) {
      fetchQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, offeringId]);

  const fetchStudent = async () => {
    try {
      const res = await studentsAPI.getStudentByUserId(user._id);
      setStudent(res.data);
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuizzesByOffering(offeringId);
      const quizzesData = response.data.quizzes || [];

      // Fetch submissions for each quiz
      if (student) {
        const quizzesWithSubmissions = await Promise.all(
          quizzesData.map(async (quiz) => {
            try {
              const subResponse = await quizAPI.getSubmission(quiz._id, student._id);
              return { ...quiz, submission: subResponse.data.submission };
            } catch {
              return { ...quiz, submission: null };
            }
          })
        );
        setQuizzes(quizzesWithSubmissions);
      } else {
        setQuizzes(quizzesData);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailsModal(true);
  };

  const handleTakeQuiz = (quiz) => {
    const isExpired = quiz.expiresAt && new Date(quiz.expiresAt) < new Date();
    if (isExpired) {
      toast.error('This quiz has expired');
      return;
    }
    navigate(`/student/courses/${offeringId}/quizzes/${quiz._id}/take`);
  };

  const handleViewResults = async (quiz) => {
    try {
      const response = await quizAPI.getSubmission(quiz._id, student._id);
      const submission = response.data.submission;
      
      setSelectedQuiz({ ...quiz, submission });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Course Quizzes</h2>
        <p className="text-sm text-gray-600 mt-1">View and take available quizzes</p>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
          <p className="text-gray-600">Check back later for new quizzes</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration & Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.map((quiz) => {
                  const isExpired = quiz.expiresAt && new Date(quiz.expiresAt) < new Date();
                  const hasSubmission = quiz.submission;

                  return (
                    <tr
                      key={quiz._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleQuizClick(quiz)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          {quiz.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.description}</div>
                          )}
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <FileText className="w-3 h-3 mr-1" />
                            {quiz.questions?.length || 0} questions
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {quiz.duration} minutes
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-gray-400" />
                            {quiz.totalPoints} points
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {hasSubmission ? (
                            <div className="flex items-center">
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Completed
                              </span>
                              <span className="ml-2 text-sm font-semibold text-indigo-600">
                                {quiz.submission.score}/{quiz.totalPoints}
                              </span>
                            </div>
                          ) : isExpired ? (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Available
                            </span>
                          )}
                          {quiz.expiresAt && (
                            <div className={`flex items-center text-xs mt-2 ${
                              isExpired ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              {isExpired ? 'Expired' : 'Expires'}: {new Date(quiz.expiresAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          {hasSubmission ? (
                            <button
                              onClick={() => handleViewResults(quiz)}
                              className="inline-flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Results</span>
                            </button>
                          ) : !isExpired ? (
                            <button
                              onClick={() => handleTakeQuiz(quiz)}
                              className="inline-flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>Take Quiz</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quiz Details Modal */}
      {showDetailsModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedQuiz.title}</h2>
                {selectedQuiz.description && (
                  <p className="text-gray-600 mb-4">{selectedQuiz.description}</p>
                )}
                
                {/* Quiz Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm">Duration: <strong>{selectedQuiz.duration} minutes</strong></span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm">Total Points: <strong>{selectedQuiz.totalPoints}</strong></span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FileText className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm">Questions: <strong>{selectedQuiz.questions?.length || 0}</strong></span>
                  </div>
                  {selectedQuiz.expiresAt && (
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm">
                        Expires: <strong>{new Date(selectedQuiz.expiresAt).toLocaleString()}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Submission Results */}
                {selectedQuiz.submission && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Results</h3>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700">Score:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {selectedQuiz.submission.score}/{selectedQuiz.totalPoints}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Percentage:</span>
                      <span className="font-semibold text-gray-900">
                        {((selectedQuiz.submission.score / selectedQuiz.totalPoints) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-700">Submitted:</span>
                      <span className="text-gray-600">
                        {new Date(selectedQuiz.submission.submittedAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Detailed Answers */}
                    {selectedQuiz.submission.answers && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">Question Results:</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {selectedQuiz.submission.answers.map((answer, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded text-center text-sm font-medium ${
                                answer.isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              Q{index + 1}: {answer.isCorrect ? '✓' : '✗'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t">
              {!selectedQuiz.submission && !(selectedQuiz.expiresAt && new Date(selectedQuiz.expiresAt) < new Date()) ? (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleTakeQuiz(selectedQuiz);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Take Quiz Now</span>
                </button>
              ) : null}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseQuizzes;
