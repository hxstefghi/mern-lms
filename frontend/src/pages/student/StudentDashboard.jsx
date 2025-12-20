import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, enrollmentsAPI } from '../../api';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const studentRes = await studentsAPI.getStudentByUserId(user._id);
      setStudent(studentRes.data);

      const enrollmentsRes = await enrollmentsAPI.getStudentEnrollments(studentRes.data._id);
      setEnrollments(enrollmentsRes.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentEnrollment = enrollments.find(
    (e) => e.status === 'Approved' || e.status === 'Pending'
  );

  const isEnrolled = currentEnrollment && currentEnrollment.status === 'Approved';

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-blue-100">
          {student?.program} - {student?.yearLevel}
        </p>
        <p className="text-blue-100">Student Number: {student?.studentNumber}</p>
      </div>

      {/* Not Enrolled Warning */}
      {!isEnrolled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Not Currently Enrolled</h2>
              <p className="text-yellow-700 mb-4">
                You are not enrolled in any courses this semester. Please visit the Student Information System to enroll.
              </p>
              <Link
                to="/sis/enrollment"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                <span className="mr-2">🎓</span>
                Go to Enrollment
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {isEnrolled && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Current Semester</div>
            <div className="text-2xl font-bold text-gray-900">
              {currentEnrollment?.semester || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">{currentEnrollment?.schoolYear || ''}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Enrolled Units</div>
            <div className="text-2xl font-bold text-blue-600">
              {currentEnrollment?.totalUnits || 0}
            </div>
            <div className="text-xs text-gray-500">
              {currentEnrollment?.subjects?.length || 0} subjects
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Year Level</div>
            <div className="text-2xl font-bold text-green-600">{student?.yearLevel}</div>
            <div className="text-xs text-gray-500">{student?.program}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="text-2xl font-bold text-indigo-600">{student?.status}</div>
            <div className="text-xs text-gray-500">Academic Status</div>
          </div>
        </div>
      )}

      {/* Current Enrollment */}
      {isEnrolled && currentEnrollment && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Current Enrollment Overview</h2>
            <p className="text-sm text-gray-600">
              {currentEnrollment.schoolYear} - {currentEnrollment.semester} Semester
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {currentEnrollment.subjects?.slice(0, 3).map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{subject.subject?.name}</div>
                    <div className="text-sm text-gray-600">{subject.subject?.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {subject.subject?.units} units
                    </div>
                    <div
                      className={`text-xs ${
                        subject.status === 'Enrolled'
                          ? 'text-green-600'
                          : subject.status === 'Dropped'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {subject.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentEnrollment.subjects?.length > 3 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                ... and {currentEnrollment.subjects.length - 3} more courses
              </div>
            )}

            <div className="mt-6">
              <Link
                to="/student/courses"
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
              >
                View All Courses
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/student/courses"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">📚</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">My Courses</div>
          <p className="text-sm text-gray-600">View your enrolled courses and schedules</p>
        </Link>

        <Link
          to="/sis/enrollment"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">📝</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Enrollment</div>
          <p className="text-sm text-gray-600">Enroll in subjects for the upcoming semester</p>
        </Link>

        <Link
          to="/sis/registration"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">📄</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Registration Card</div>
          <p className="text-sm text-gray-600">View and print your registration card</p>
        </Link>

        <Link
          to="/sis/tuition"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">💰</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Tuition & Fees</div>
          <p className="text-sm text-gray-600">Check your tuition balance and payment history</p>
        </Link>

        <Link
          to="/sis/history"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">🎓</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Academic History</div>
          <p className="text-sm text-gray-600">View your grades and academic records</p>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
