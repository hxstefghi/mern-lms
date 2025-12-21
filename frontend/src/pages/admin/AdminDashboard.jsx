import { useState, useEffect } from 'react';
import { studentsAPI, subjectsAPI, enrollmentsAPI, usersAPI, programsAPI } from '../../api';
import { Users, BookOpen, GraduationCap, ClipboardList, UserCheck, TrendingUp, Calendar, Bell } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalPrograms: 0,
    pendingEnrollments: 0,
    totalInstructors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, subjectsRes, programsRes, enrollmentsRes, instructorsRes] = await Promise.all([
        studentsAPI.getStudents({ limit: 1 }),
        subjectsAPI.getSubjects({ limit: 1 }),
        programsAPI.getPrograms({ limit: 1 }),
        enrollmentsAPI.getEnrollments({ status: 'Pending', limit: 1 }),
        usersAPI.getUsersByRole('instructor'),
      ]);

      setStats({
        totalStudents: studentsRes.data.totalStudents || studentsRes.data.count || 0,
        totalSubjects: subjectsRes.data.totalSubjects || subjectsRes.data.count || 0,
        totalPrograms: programsRes.data.count || 0,
        pendingEnrollments: enrollmentsRes.data.totalEnrollments || enrollmentsRes.data.count || 0,
        totalInstructors: instructorsRes.data.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Overview of your system metrics</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Programs</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPrograms}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Subjects</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSubjects}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <ClipboardList className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Pending Enrollments</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingEnrollments}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Instructors</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalInstructors}</p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Students</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Courses</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalSubjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Faculty Members</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalInstructors}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.pendingEnrollments > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ClipboardList className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Pending Enrollment Requests</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.pendingEnrollments} enrollment{stats.pendingEnrollments !== 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">System Status</p>
                <p className="text-xs text-gray-600 mt-1">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
