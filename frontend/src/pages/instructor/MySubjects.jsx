import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { subjectsAPI } from '../../api';
import { BookOpen, Users, Calendar, Clock, MapPin, Grid, List } from 'lucide-react';
import { toast } from 'react-toastify';

const MySubjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchMySubjects();
  }, [user]);

  const fetchMySubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getSubjects({});
      const allSubjects = response.data.subjects || response.data;
      
      // Filter subjects where the logged-in instructor is assigned
      const mySubjects = allSubjects.filter(subject =>
        subject.offerings?.some(offering => 
          offering.instructor && offering.instructor._id === user._id
        )
      ).map(subject => ({
        ...subject,
        myOfferings: subject.offerings.filter(offering => 
          offering.instructor && offering.instructor._id === user._id
        )
      }));
      
      setSubjects(mySubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load your subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubject = (subjectId, offeringId) => {
    navigate(`/instructor/subjects/${subjectId}/offering/${offeringId}`);
  };

  const totalOfferings = subjects.reduce((sum, subject) => sum + subject.myOfferings.length, 0);
  const totalStudents = subjects.reduce((sum, subject) => 
    sum + subject.myOfferings.reduce((offeringSum, offering) => offeringSum + (offering.enrolled || 0), 0), 0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-500">Subjects assigned to you for this semester</p>
      </div>

      {/* Stats Overview */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Subjects</p>
                <p className="text-3xl font-bold text-gray-900">{totalOfferings}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Classes</p>
                <p className="text-3xl font-bold text-gray-900">{subjects.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      {subjects.length > 0 && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your Subjects</h2>
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

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subjects Assigned Yet</h3>
          <p className="text-gray-500">Contact the admin to get assigned to subjects</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            subject.myOfferings.map((offering) => (
              <div 
                key={`${subject._id}-${offering._id}`}
                onClick={() => handleViewSubject(subject._id, offering._id)}
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
                        {subject.code}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {subject.units} Units
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {subject.name}
                    </h3>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{offering.schoolYear} • {offering.semester} Sem</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{offering.enrolled || 0} / {offering.capacity} Students</span>
                    </div>
                    
                    {offering.schedule && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{offering.schedule}</span>
                      </div>
                    )}

                    {offering.room && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Room {offering.room}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-2">
                    <div className="text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                      View Details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            subject.myOfferings.map((offering) => (
              <div
                key={`${subject._id}-${offering._id}`}
                onClick={() => handleViewSubject(subject._id, offering._id)}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {subject.code}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {subject.units} Units
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {subject.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {offering.schoolYear} • {offering.semester}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {offering.enrolled || 0}/{offering.capacity}
                        </span>
                        {offering.schedule && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {offering.schedule}
                          </span>
                        )}
                        {offering.room && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            Room {offering.room}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubjects;
