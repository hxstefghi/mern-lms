import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, enrollmentsAPI } from '../../api';
import { BookOpen, Clock, User, MapPin, GraduationCap, Grid, List, CheckCircle, ArrowRight, LayoutGrid, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const subjects = currentEnrollment?.subjects || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-500">
          {currentEnrollment 
            ? `${currentEnrollment.schoolYear} • ${currentEnrollment.semester} Semester`
            : 'No active enrollment'
          }
        </p>
      </div>

      {/* Stats Overview */}
      {currentEnrollment && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{subjects.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Units</p>
                <p className="text-3xl font-bold text-gray-900">{currentEnrollment.totalUnits}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className={`text-xl font-semibold ${
                  currentEnrollment.status === 'Approved' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {currentEnrollment.status}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                currentEnrollment.status === 'Approved' ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  currentEnrollment.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      {subjects.length > 0 && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses</h2>
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Courses List */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
          <p className="text-gray-500">You are not currently enrolled in any courses.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((subjectEnrollment, index) => {
            const subject = subjectEnrollment.subject;
            const offering = subjectEnrollment.offering;

            return (
              <div
                key={index}
                onClick={() => navigate(`/student/courses/${subject._id}/offering/${offering._id}`)}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              >
                {/* Color Bar */}
                <div className="h-2 bg-indigo-600"></div>
                
                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        {subject?.code}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {subject?.units} Units
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {subject?.name}
                    </h3>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    {offering?.instructor && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">
                          {offering.instructor.firstName} {offering.instructor.lastName}
                        </span>
                      </div>
                    )}
                    
                    {offering?.schedule && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{offering.schedule}</span>
                      </div>
                    )}
                    
                    {offering?.room && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Room {offering.room}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-2">
                    <div className="text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                      View Course
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subjectEnrollment, index) => {
            const subject = subjectEnrollment.subject;
            const offering = subjectEnrollment.offering;

            return (
              <div
                key={index}
                onClick={() => navigate(`/student/courses/${subject._id}/offering/${offering._id}`)}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {subject?.code}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {subject?.units} Units
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {subject?.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {offering?.instructor && (
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            {offering.instructor.firstName} {offering.instructor.lastName}
                          </span>
                        )}
                        {offering?.schedule && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {offering.schedule}
                          </span>
                        )}
                        {offering?.room && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            Room {offering.room}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
