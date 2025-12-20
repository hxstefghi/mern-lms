import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { subjectsAPI } from '../../api';
import { BookOpen, Users, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const MySubjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Subjects</h1>
        <p className="text-sm text-gray-600 mt-1">Subjects assigned to you for this semester</p>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No subjects assigned yet</p>
            <p className="text-sm text-gray-500 mt-1">Contact the admin to get assigned to subjects</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            subject.myOfferings.map((offering) => (
              <div 
                key={`${subject._id}-${offering._id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewSubject(subject._id, offering._id)}
              >
                <div className="mb-4">
                  <div className="text-sm font-medium text-green-600 mb-1">
                    {subject.code}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{subject.units} Units</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{offering.schoolYear} - {offering.semester} Semester</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{offering.enrolled || 0} / {offering.capacity} Students</span>
                  </div>
                </div>

                {offering.schedule && offering.schedule.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-700 mb-2">Schedule:</div>
                    {offering.schedule.slice(0, 2).map((sched, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{sched.day}: {sched.startTime} - {sched.endTime}</span>
                      </div>
                    ))}
                    {offering.schedule.length > 2 && (
                      <span className="text-xs text-gray-500">+{offering.schedule.length - 2} more</span>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSubject(subject._id, offering._id);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
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
