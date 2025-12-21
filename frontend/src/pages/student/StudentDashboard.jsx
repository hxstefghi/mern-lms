import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, enrollmentsAPI } from '../../api';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  CreditCard, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  GraduationCap,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = useCallback(async () => {
    try {
      const studentRes = await studentsAPI.getStudentByUserId(user._id);
      setStudent(studentRes.data);

      // Get current enrollment
      const enrollmentsRes = await enrollmentsAPI.getStudentEnrollments(studentRes.data._id);
      const enrollments = enrollmentsRes.data.enrollments || enrollmentsRes.data || [];
      
      // Find most recent enrollment
      const current = enrollments.find(e => e.status === 'Approved' || e.status === 'Pending');
      setCurrentEnrollment(current);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const getEnrollmentStatusConfig = (status) => {
    switch (status) {
      case 'Approved':
        return { icon: CheckCircle, color: 'green', bg: 'bg-green-100', text: 'text-green-800', label: 'Enrolled' };
      case 'Pending':
        return { icon: Clock, color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
      default:
        return { icon: AlertCircle, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Enrolled' };
    }
  };

  const statusConfig = getEnrollmentStatusConfig(currentEnrollment?.status);
  const StatusIcon = statusConfig.icon;
  const totalSubjects = currentEnrollment?.subjects?.length || 0;
  const totalUnits = currentEnrollment?.totalUnits || 0;
  const isIrregular = currentEnrollment?.enrollmentType === 'Admin-Manual';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Minimalist Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Student Dashboard</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 ml-1">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>{student?.program}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span>{student?.yearLevel}</span>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-auto text-left lg:text-right bg-gray-50 rounded-xl px-6 py-4">
              <div className="text-xs text-gray-500 mb-1">Student ID</div>
              <div className="text-2xl font-bold text-gray-900">{student?.studentNumber}</div>
            </div>
          </div>

          {/* Enrollment Status Banner */}
          {currentEnrollment && (
            <div className={`mt-6 p-4 rounded-xl border ${
              statusConfig.color === 'green' 
                ? 'bg-green-50 border-green-200' 
                : statusConfig.color === 'yellow'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`w-5 h-5 ${
                    statusConfig.color === 'green' ? 'text-green-600' :
                    statusConfig.color === 'yellow' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {statusConfig.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {currentEnrollment.schoolYear} • {currentEnrollment.semester} Semester
                    </div>
                  </div>
                </div>
                {isIrregular && (
                  <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-orange-200">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-800">Irregular</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Irregular Notice */}
        {isIrregular && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-orange-900 mb-1">Irregular Enrollment</h3>
                <p className="text-xs text-orange-700">
                  Your enrollment was customized by the registrar. Your subject list may differ from the standard curriculum.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subjects Card */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{totalSubjects}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Enrolled Subjects</div>
          </div>

          {/* Units Card */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{totalUnits}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Total Units</div>
          </div>

          {/* Balance Card */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {currentEnrollment ? '₱0' : '-'}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">Balance</div>
          </div>
        </div>

        {/* Info Notice - Minimalist */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Auto-Enrollment System</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Subjects are automatically assigned based on your curriculum, program, year level, and semester. 
                Contact the registrar for enrollment adjustments.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Minimalist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/student/courses"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="font-semibold text-gray-900 mb-1">My Subjects</div>
            <div className="text-xs text-gray-500">View enrolled courses</div>
          </Link>

          <Link
            to="/sis/registration"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-green-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="font-semibold text-gray-900 mb-1">Registration</div>
            <div className="text-xs text-gray-500">View registration card</div>
          </Link>

          <Link
            to="/sis/tuition"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-purple-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="font-semibold text-gray-900 mb-1">Tuition</div>
            <div className="text-xs text-gray-500">Payment details</div>
          </Link>

          <Link
            to="/sis/history"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-orange-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="font-semibold text-gray-900 mb-1">History</div>
            <div className="text-xs text-gray-500">Academic records</div>
          </Link>
        </div>

        {/* Current Subjects - Minimalist List */}
        {currentEnrollment && currentEnrollment.subjects && currentEnrollment.subjects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Current Subjects</h2>
              <Link 
                to="/student/courses" 
                className="flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 group"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2">
              {currentEnrollment.subjects.slice(0, 5).map((subjectEnrollment, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {subjectEnrollment.subject?.code}
                      </div>
                      <div className="text-xs text-gray-600">
                        {subjectEnrollment.subject?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {subjectEnrollment.subject?.units} units
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
            {currentEnrollment.subjects.length > 5 && (
              <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <Link
                  to="/student/courses"
                  className="inline-flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <span>View {currentEnrollment.subjects.length - 5} more subjects</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
