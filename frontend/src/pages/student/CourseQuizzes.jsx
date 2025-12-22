import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, studentsAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Clock, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const CourseQuizzes = () => {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

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
    navigate(`${quiz._id}/detail`);
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
          <p className="text-gray-600">Check back later for new quizzes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {quizzes.map((quiz) => {
            const isExpired = quiz.expiresAt && new Date(quiz.expiresAt) < new Date();
            const hasSubmission = quiz.submission;

            return (
              <div
                key={quiz._id}
                onClick={() => handleQuizClick(quiz)}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">{quiz.title}</h3>
                  {hasSubmission ? (
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 shrink-0">
                      ✓ Done
                    </span>
                  ) : isExpired ? (
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 shrink-0">
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 shrink-0">
                      Available
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-sm">{quiz.duration} minutes</span>
                  </div>

                  {quiz.expiresAt && (
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">
                        {isExpired ? 'Expired' : 'Expires'}: {new Date(quiz.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {hasSubmission && (
                    <div className="flex items-center text-indigo-600 font-semibold">
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <span className="text-sm">
                        Score: {quiz.submission.score}/{quiz.totalPoints}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseQuizzes;
