import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, enrollmentsAPI } from '../../api';

const Courses = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoursesData();
  }, [user]);

  const fetchCoursesData = async () => {
    try {
      const studentRes = await studentsAPI.getStudentByUserId(user._id);
      setStudent(studentRes.data);

      const enrollmentsRes = await enrollmentsAPI.getStudentEnrollments(studentRes.data._id);
      const enrollments = enrollmentsRes.data;

      // Find current enrollment (Approved or Pending)
      const current = enrollments.find(
        (e) => e.status === 'Approved' || e.status === 'Pending'
      );
      setCurrentEnrollment(current);
    } catch (error) {
      console.error('Error fetching courses data:', error);
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

  // Not enrolled
  if (!currentEnrollment || currentEnrollment.status === 'Rejected') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Not Currently Enrolled</h2>
          <p className="text-yellow-700 mb-4">
            You are not enrolled in any courses this semester.
          </p>
          <p className="text-sm text-yellow-600">
            Please visit the{' '}
            <a href="/sis/enrollment" className="underline font-medium">
              Student Information System
            </a>{' '}
            to enroll in courses.
          </p>
        </div>
      </div>
    );
  }

  const enrolledSubjects = currentEnrollment.subjects.filter(
    (s) => s.status === 'Enrolled' || s.status === 'Completed'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">
            {currentEnrollment.schoolYear} - {currentEnrollment.semester} Semester
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Enrollment Status</div>
          <div
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              currentEnrollment.status === 'Approved'
                ? 'bg-green-100 text-green-800'
                : currentEnrollment.status === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {currentEnrollment.status}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Courses</div>
          <div className="text-3xl font-bold text-blue-600">{enrolledSubjects.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Units</div>
          <div className="text-3xl font-bold text-green-600">
            {currentEnrollment.totalUnits}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Semester</div>
          <div className="text-2xl font-bold text-purple-600">
            {currentEnrollment.semester}
          </div>
          <div className="text-xs text-gray-500">{currentEnrollment.schoolYear}</div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Enrolled Courses</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {enrolledSubjects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No enrolled courses found.
            </div>
          ) : (
            enrolledSubjects.map((subject, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subject.subject?.code}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {subject.subject?.units} {subject.subject?.units === 1 ? 'Unit' : 'Units'}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          subject.status === 'Enrolled'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {subject.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{subject.subject?.name}</p>

                    {/* Schedule Information */}
                    {subject.offering?.schedule && subject.offering.schedule.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600">Schedule:</div>
                        <div className="flex flex-wrap gap-2">
                          {subject.offering.schedule.map((schedule, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg text-sm"
                            >
                              <span className="font-medium text-gray-700">{schedule.day}</span>
                              <span className="text-gray-500">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              {schedule.room && (
                                <span className="text-gray-600">• Room {schedule.room}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructor */}
                    {subject.offering?.instructor && (
                      <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-medium">Instructor:</span>
                        <span>
                          {subject.offering.instructor.firstName}{' '}
                          {subject.offering.instructor.lastName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Actions (Optional) */}
                  <div className="ml-4">
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Notice */}
      {currentEnrollment.status === 'Pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="font-semibold text-yellow-800">Enrollment Pending Approval</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your enrollment is awaiting approval from the registrar. You will be notified once
                it has been processed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
