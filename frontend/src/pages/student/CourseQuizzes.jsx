import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI, studentsAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const CourseQuizzes = () => {
  const { offeringId } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    fetchStudent();
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId]);

  useEffect(() => {
    if (activeQuiz && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuiz, timeRemaining]);

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
              // No submission found
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

  const handleStartQuiz = async (quiz) => {
    try {
      const response = await quizAPI.getQuiz(quiz._id);
      const fullQuiz = response.data.quiz;
      
      setActiveQuiz(fullQuiz);
      setAnswers(new Array(fullQuiz.questions.length).fill(''));
      setTimeRemaining(fullQuiz.duration * 60); // Convert to seconds
      setShowResults(false);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz');
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleAutoSubmit = async () => {
    await handleSubmitQuiz();
    toast.warning('Time is up! Quiz auto-submitted.');
  };

  const handleSubmitQuiz = async () => {
    if (!student) {
      toast.error('Student information not found');
      return;
    }

    // Check if all questions are answered
    const unanswered = answers.some((answer) => !answer);
    if (unanswered && !window.confirm('Some questions are not answered. Submit anyway?')) {
      return;
    }

    try {
      const response = await quizAPI.submitQuiz(activeQuiz._id, {
        studentId: student._id,
        answers,
      });

      setSubmission(response.data.submission);
      setShowResults(true);
      toast.success('Quiz submitted successfully!');
      fetchQuizzes(); // Refresh to show submission
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  const handleViewResults = async (quiz) => {
    try {
      const response = await quizAPI.getSubmission(quiz._id, student._id);
      setSubmission(response.data.submission);
      setActiveQuiz(quiz);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Taking Quiz View
  if (activeQuiz && !showResults) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeQuiz.title}</h2>
              {activeQuiz.description && (
                <p className="text-gray-600">{activeQuiz.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-indigo-600'}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">Time Remaining</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {activeQuiz.questions.map((question, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start mb-4">
                <span className="shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 mb-1">{question.question}</p>
                  <p className="text-sm text-gray-500">{question.points} point(s)</p>
                </div>
              </div>

              <div className="ml-11 space-y-2">
                {question.type === 'true-false' ? (
                  <>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="True"
                        checked={answers[index] === 'True'}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-3 text-gray-900">True</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value="False"
                        checked={answers[index] === 'False'}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-3 text-gray-900">False</span>
                    </label>
                  </>
                ) : (
                  question.options.map((option, oIndex) => (
                    <label
                      key={oIndex}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-yellow-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">Make sure you've answered all questions before submitting</span>
            </div>
            <button
              onClick={handleSubmitQuiz}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (showResults && submission) {
    const percentage = ((submission.score / activeQuiz.totalPoints) * 100).toFixed(1);
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{activeQuiz.title}</h2>
          <div className="text-6xl font-bold text-indigo-600 mb-2">
            {submission.score}/{activeQuiz.totalPoints}
          </div>
          <p className="text-xl text-gray-600">Score: {percentage}%</p>
          <button
            onClick={() => {
              setShowResults(false);
              setActiveQuiz(null);
            }}
            className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back to Quizzes
          </button>
        </div>

        {/* Answer Review */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Answer Review</h3>
          {submission.answers.map((answer, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                answer.isCorrect ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-semibold mr-3">
                    {index + 1}
                  </span>
                  <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  {answer.isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-semibold">Correct</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-semibold">Incorrect</span>
                    </>
                  )}
                </div>
              </div>

              <div className="ml-11 space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                  <p className={`text-gray-900 ${!answer.isCorrect && 'line-through text-red-600'}`}>
                    {answer.studentAnswer || 'Not answered'}
                  </p>
                </div>
                {!answer.isCorrect && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                    <p className="text-green-600 font-medium">{answer.correctAnswer}</p>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Points: {answer.points} / {activeQuiz.questions[index].points}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Quizzes List View
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        <p className="text-sm text-gray-600 mt-1">View and take course quizzes</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
          <p className="text-gray-600">Check back later for new quizzes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes
            .filter((quiz) => quiz.status === 'published')
            .map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{quiz.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{quiz.questions?.length || 0} questions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>{quiz.totalPoints} points</span>
                  </div>
                </div>

                {quiz.submission ? (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-green-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Completed</span>
                        <span className="text-lg font-bold text-green-600">
                          {quiz.submission.score}/{quiz.totalPoints}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewResults(quiz)}
                      className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium"
                    >
                      View Results
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Start Quiz
                  </button>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CourseQuizzes;
