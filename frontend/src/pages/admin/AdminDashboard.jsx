import { useState, useEffect } from 'react';
import { studentsAPI, subjectsAPI, enrollmentsAPI, usersAPI } from '../../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    pendingEnrollments: 0,
    totalInstructors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, subjectsRes, enrollmentsRes, instructorsRes] = await Promise.all([
        studentsAPI.getStudents({ limit: 1 }),
        subjectsAPI.getSubjects({ limit: 1 }),
        enrollmentsAPI.getEnrollments({ status: 'Pending', limit: 1 }),
        usersAPI.getUsersByRole('instructor'),
      ]);

      setStats({
        totalStudents: studentsRes.data.totalStudents,
        totalSubjects: subjectsRes.data.totalSubjects,
        pendingEnrollments: enrollmentsRes.data.totalEnrollments,
        totalInstructors: instructorsRes.data.length,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the LMS + SIS administration panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
            <div className="text-4xl">👨‍🎓</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalSubjects}</p>
            </div>
            <div className="text-4xl">📖</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Enrollments</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingEnrollments}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Instructors</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalInstructors}</p>
            </div>
            <div className="text-4xl">👩‍🏫</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium text-gray-900">Add New Student</div>
            <div className="text-sm text-gray-600">Create a new student profile</div>
          </button>

          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium text-gray-900">Manage Subjects</div>
            <div className="text-sm text-gray-600">Add or edit subject offerings</div>
          </button>

          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-medium text-gray-900">Review Enrollments</div>
            <div className="text-sm text-gray-600">Approve pending enrollments</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-center py-8">
            Activity tracking will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
