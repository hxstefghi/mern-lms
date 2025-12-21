import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectsAPI } from '../../api';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  MapPin,
  FileText,
  Download,
  Megaphone,
  GraduationCap,
  Mail,
  Video,
  Link as LinkIcon,
  Bell
} from 'lucide-react';

const CourseDetail = () => {
  const { subjectId, offeringId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [offering, setOffering] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [announcements, setAnnouncements] = useState([]);
  const [materials, setMaterials] = useState([]);

  const fetchCourseData = useCallback(async () => {
    try {
      const subjectRes = await subjectsAPI.getSubjectById(subjectId);
      const subjectData = subjectRes.data.subject || subjectRes.data;
      setSubject(subjectData);

      const currentOffering = subjectData.offerings?.find(o => o._id === offeringId);
      setOffering(currentOffering);
      
      if (!currentOffering && subjectData.offerings?.length > 0) {
        setOffering(subjectData.offerings[0]);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectId, offeringId]);

  const loadAnnouncements = useCallback(async () => {
    try {
      const response = await subjectsAPI.getOfferingAnnouncements(subjectId, offeringId);
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    }
  }, [subjectId, offeringId]);

  const loadMaterials = useCallback(async () => {
    try {
      const response = await subjectsAPI.getOfferingMaterials(subjectId, offeringId);
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      setMaterials([]);
    }
  }, [subjectId, offeringId]);

  useEffect(() => {
    const run = async () => {
      await fetchCourseData();
      await loadAnnouncements();
      await loadMaterials();
    };
    run();
  }, [fetchCourseData, loadAnnouncements, loadMaterials]);

  const getFileIcon = (type) => {
    if (type === 'link') return <LinkIcon className="w-6 h-6" />;
    if (type === 'video') return <Video className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Subject Not Found</h3>
        <button
          onClick={() => navigate('/student/courses')}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Offering Not Found</h3>
        <p className="text-gray-500 mb-4">{subject.code} - {subject.name}</p>
        <button
          onClick={() => navigate('/student/courses')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'announcements', label: 'Announcements', count: announcements.length },
    { id: 'materials', label: 'Materials', count: materials.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/courses')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Courses
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-2 bg-indigo-600"></div>
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <span className="inline-block text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg mb-3">
                {subject.code}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{subject.name}</h1>
              <p className="text-gray-600">{subject.description}</p>
            </div>
            <div className="ml-6 shrink-0">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <GraduationCap className="w-4 h-4 mr-2" />
                Units
              </div>
              <div className="text-2xl font-bold text-gray-900">{subject.units}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                Semester
              </div>
              <div className="text-lg font-semibold text-gray-900">{offering.semester}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </div>
              <div className="text-sm font-medium text-gray-900">{offering.schedule || 'TBA'}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <MapPin className="w-4 h-4 mr-2" />
                Room
              </div>
              <div className="text-lg font-semibold text-gray-900">{offering.room || 'TBA'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
        <div className="flex items-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
            {offering.instructor?.firstName?.charAt(0)}{offering.instructor?.lastName?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">
              {offering.instructor?.firstName} {offering.instructor?.lastName}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Mail className="w-4 h-4 mr-1" />
              {offering.instructor?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">About This Course</h4>
                <p className="text-gray-600 leading-relaxed">{subject.description}</p>
              </div>

              {subject.prerequisites && subject.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {subject.prerequisites.map((prereq, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium"
                      >
                        {prereq.code || prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
                  <p className="text-gray-500">Your instructor hasn't posted any announcements</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement._id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{announcement.title}</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">{announcement.content}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Bell className="w-4 h-4 mr-1" />
                      {new Date(announcement.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-3">
              {materials.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No materials uploaded yet</p>
                </div>
              ) : (
                materials.map((material) => (
                  <div
                    key={material._id}
                    className="flex items-center justify-between border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="shrink-0">
                        <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                          {getFileIcon(material.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{material.title}</h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(material.uploadDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-4"
                      title="View/Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
