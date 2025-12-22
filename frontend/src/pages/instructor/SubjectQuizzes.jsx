import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI } from '../../api';
import { Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, Clock, FileText, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const SubjectQuizzes = () => {
  const { subjectId, offeringId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    totalPoints: 0,
    expiresAt: '',
    questions: [
      {
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      },
    ],
  });

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuizzesByOffering(offeringId);
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId]);

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          type: 'multiple-choice',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1,
        },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const calculateTotalPoints = () => {
    return formData.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (!q.correctAnswer) {
        toast.error(`Question ${i + 1} has no correct answer selected`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return;
      }
    }

    const totalPoints = calculateTotalPoints();

    try {
      const quizData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        questions: formData.questions,
        totalPoints,
        status: 'published',
      };

      if (selectedQuiz) {
        await quizAPI.updateQuiz(selectedQuiz._id, quizData);
        toast.success('Quiz updated successfully!');
      } else {
        await quizAPI.createQuiz(subjectId, offeringId, quizData);
        toast.success('Quiz created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchQuizzes();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to save quiz');
    }
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    
    // Convert UTC date to local datetime-local format
    let localExpiresAt = '';
    if (quiz.expiresAt) {
      const date = new Date(quiz.expiresAt);
      // Format: YYYY-MM-DDTHH:MM (local time)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      localExpiresAt = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration,
      totalPoints: quiz.totalPoints,
      expiresAt: localExpiresAt,
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options || ['', '', '', ''],
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await quizAPI.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleViewSubmissions = async (quiz) => {
    try {
      const response = await quizAPI.getQuizSubmissions(quiz._id);
      setSubmissions(response.data.submissions || []);
      setSelectedQuiz(quiz);
      setShowSubmissionsModal(true);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 60,
      totalPoints: 0,
      expiresAt: '',
      questions: [
        {
          question: '',
          type: 'multiple-choice',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1,
        },
      ],
    });
    setSelectedQuiz(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
          <p className="text-sm text-gray-600 mt-1">Create and manage quizzes with auto-grading</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Yet</h3>
          <p className="text-gray-600 mb-4">Create your first quiz to get started</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration & Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Expiration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.map((quiz) => {
                  const isExpired = quiz.expiresAt && new Date(quiz.expiresAt) < new Date();
                  return (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          {quiz.description && (
                            <div className="text-sm text-gray-500 mt-1">{quiz.description}</div>
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
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              quiz.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {quiz.status}
                          </span>
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
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewSubmissions(quiz)}
                            className="inline-flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Submissions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(quiz)}
                            className="inline-flex items-center px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Quiz"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(quiz._id)}
                            className="inline-flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Create/Edit Quiz Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Midterm Quiz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional quiz description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no expiration
                </p>
              </div>

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                  <div className="text-sm text-gray-600">
                    Total Points: <span className="font-semibold">{calculateTotalPoints()}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {formData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-md font-semibold text-gray-900">Question {qIndex + 1}</h4>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text *
                          </label>
                          <textarea
                            required
                            rows="2"
                            value={question.question}
                            onChange={(e) =>
                              handleQuestionChange(qIndex, 'question', e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your question..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="multiple-choice">Multiple Choice</option>
                              <option value="true-false">True/False</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Points *
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={question.points}
                              onChange={(e) =>
                                handleQuestionChange(qIndex, 'points', parseInt(e.target.value))
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {question.type === 'true-false' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Correct Answer *
                            </label>
                            <select
                              required
                              value={question.correctAnswer}
                              onChange={(e) =>
                                handleQuestionChange(qIndex, 'correctAnswer', e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Select...</option>
                              <option value="True">True</option>
                              <option value="False">False</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Options *
                            </label>
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={question.correctAnswer === option}
                                    onChange={() =>
                                      handleQuestionChange(qIndex, 'correctAnswer', option)
                                    }
                                    className="w-4 h-4 text-indigo-600"
                                  />
                                  <input
                                    type="text"
                                    required
                                    value={option}
                                    onChange={(e) =>
                                      handleOptionChange(qIndex, oIndex, e.target.value)
                                    }
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Select the radio button for the correct answer
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="mt-4 flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {selectedQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz?.title}</h2>
                <p className="text-sm text-gray-600">Student Submissions</p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {submission.student?.user?.firstName || 'Unknown'} {submission.student?.user?.lastName || 'Student'}
                        </h3>
                        <p className="text-sm text-gray-600">{submission.student?.studentNumber || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {submission.score}/{selectedQuiz?.totalPoints}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Show graded answers */}
                    <div className="mt-4 space-y-2">
                      {submission.answers?.map((answer, index) => (
                        <div
                          key={index}
                          className={`text-sm p-2 rounded ${
                            answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Question {index + 1}</span>
                            <div className="flex items-center space-x-2">
                              {answer.isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium">{answer.points} pts</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectQuizzes;
