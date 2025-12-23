import { useState, useEffect } from 'react';
import { studentsAPI, subjectsAPI, enrollmentsAPI, usersAPI, programsAPI } from '../../api';
import { Users, BookOpen, GraduationCap, ClipboardList, UserCheck, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

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

  useEffect(() => {
    document.title = 'Admin Dashboard | LMS';
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

  const chartData = [
    { name: 'Students', value: stats.totalStudents },
    { name: 'Programs', value: stats.totalPrograms },
    { name: 'Subjects', value: stats.totalSubjects },
    { name: 'Instructors', value: stats.totalInstructors },
    { name: 'Pending', value: stats.pendingEnrollments },
  ];

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

      {/* Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
            <p className="text-sm text-gray-600 mt-1">High-level distribution of system totals</p>
          </div>
          <div className="text-xs text-gray-500">Counts</div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: 'rgba(0,0,0,0.08)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="currentColor" className="text-indigo-600" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
