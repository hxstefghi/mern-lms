import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, enrollmentsAPI } from '../../api';
import { BookOpen, Clock, User, MapPin, AlertCircle, Calendar } from 'lucide-react';

const Courses = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const studentRes = await studentsAPI.getStudentByUserId(user._id);
      setStudent(studentRes.data);

      const enrollmentsRes = await enrollmentsAPI.getStudentEnrollments(studentRes.data._id);
      const enrollments = enrollmentsRes.data.enrollments || enrollmentsRes.data || [];
      
      const current = enrollments.find(e => e.status === 'Approved' || e.status === 'Pending');
      setCurrentEnrollment(current);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const isIrregular = currentEnrollment?.enrollmentType === 'Admin-Manual';
  const subjects = currentEnrollment?.subjects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Subjects</h1>
        <p className="text-sm text-gray-600 mt-1">
          {currentEnrollment ? (
            `${currentEnrollment.schoolYear} - ${currentEnrollment.semester} Semester`
          ) : (
            'No current enrollment'
          )}
        </p>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">
              {isIrregular ? 'Custom Enrollment' : 'Curriculum-Based Subjects'}
            </h3>
            <p className="text-sm text-blue-800">
              {isIrregular
                ? 'Your enrollment was adjusted by the registrar. Your subject list may differ from the standard curriculum.'
                : 'These subjects are automatically assigned based on your program curriculum, year level, and semester. You cannot manually add or remove subjects.'}
            </p>
          </div>
        </div>
      </div>

      {/* Enrollment Summary */}
      {currentEnrollment && (
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Subjects</div>
              <div className="text-2xl font-bold text-gray-900">{subjects.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Units</div>
              <div className="text-2xl font-bold text-indigo-600">{currentEnrollment.totalUnits}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className={`text-lg font-medium ${
                currentEnrollment.status === 'Approved' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {currentEnrollment.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Enrollment Type</div>
              <div className="text-lg font-medium text-gray-900">
                {isIrregular ? 'Irregular' : 'Regular'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Enrolled</h3>
            <p className="text-gray-600">
              You are not currently enrolled in any subjects. Contact the registrar's office for assistance.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subjects.map((subjectEnrollment, index) => {
            const subject = subjectEnrollment.subject;
            const offering = subjectEnrollment.offering;

            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium opacity-90 mb-1">{subject?.code}</div>
                      <h3 className="text-lg font-bold">{subject?.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                        {subject?.units} Units
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {subject?.description && (
                    <div>
                      <p className="text-sm text-gray-600">{subject.description}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    {offering?.instructor && (
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-1">Instructor:</span>
                        <span>
                          {offering.instructor.firstName} {offering.instructor.lastName}
                        </span>
                      </div>
                    )}

                    {offering?.schedule && offering.schedule.length > 0 && (
                      <div className="flex items-start text-sm text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium">Schedule:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {offering.schedule.map((sched, idx) => (
                              <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {sched.day} {sched.startTime}-{sched.endTime}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {offering?.room && (
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium mr-1">Room:</span>
                        <span>{offering.room}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-1">Semester:</span>
                      <span>{offering?.semester || currentEnrollment.semester}</span>
                    </div>
                  </div>

                  {/* Subject Info Tags */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {subject?.program || student?.program}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      {subject?.yearLevel || student?.yearLevel}
                    </span>
                    {isIrregular && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      {subjects.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Subjects are automatically assigned based on your curriculum</p>
            <p>• If you have questions about your subjects, contact your academic adviser</p>
            <p>• For enrollment adjustments, visit the registrar's office</p>
            <p>• View your complete registration card in the SIS portal</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Courses;
