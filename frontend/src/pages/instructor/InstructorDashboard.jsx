import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { subjectsAPI } from '../../api';
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalStudents: 0,
    activeSubjects: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await subjectsAPI.getSubjects({ limit: 1000 });
      const allSubjects = response.data.subjects || response.data;
      
      // Filter subjects assigned to this instructor
      const mySubjects = allSubjects.filter(subject =>
        subject.offerings?.some(offering => 
          offering.instructor && offering.instructor._id === user._id
        )
      );
      
      const totalStudents = mySubjects.reduce((sum, subject) => {
        const myOfferings = subject.offerings.filter(o => o.instructor?._id === user._id);
        return sum + myOfferings.reduce((s, o) => s + (o.enrolled || 0), 0);
      }, 0);
      
      setStats({
        totalSubjects: mySubjects.length,
        totalStudents,
        activeSubjects: mySubjects.filter(s => s.offerings?.some(o => o.isOpen)).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Instructor Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Subjects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSubjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeSubjects}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/instructor/subjects')}
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <BookOpen className="w-8 h-8 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">View My Subjects</div>
              <div className="text-sm text-gray-600">See all assigned subjects</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/instructor/subjects')}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Manage Students</div>
              <div className="text-sm text-gray-600">View enrolled students</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
