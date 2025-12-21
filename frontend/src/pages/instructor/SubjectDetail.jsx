import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { subjectsAPI, enrollmentsAPI } from '../../api';
import { Users, Bell, FileText, Plus, X, Upload, Link as LinkIcon, Video, Download, Trash2, BookOpen, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const SubjectDetail = () => {
  const { subjectId, offeringId } = useParams();
  const [subject, setSubject] = useState(null);
  const [offering, setOffering] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  
  // Announcement state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
  });

  // Material state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'link',
    url: '',
    description: '',
  });

  useEffect(() => {
    fetchSubjectDetails();
    fetchEnrolledStudents();
    loadAnnouncements();
    loadMaterials();
  }, [subjectId, offeringId]);

  const fetchSubjectDetails = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getSubjectById(subjectId);
      setSubject(response.data);
      const currentOffering = response.data.offerings?.find(o => o._id === offeringId);
      setOffering(currentOffering);
    } catch (error) {
      console.error('Error fetching subject:', error);
      toast.error('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const response = await enrollmentsAPI.getEnrollments({});
      const allEnrollments = response.data.enrollments || response.data;
      
      // Filter enrollments for this specific offering
      const relevantEnrollments = allEnrollments.filter(enrollment =>
        enrollment.subjects?.some(subj => subj.offeringId === offeringId)
      );
      
      setEnrolledStudents(relevantEnrollments);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await subjectsAPI.getOfferingAnnouncements(subjectId, offeringId);
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await subjectsAPI.getOfferingMaterials(subjectId, offeringId);
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await subjectsAPI.postOfferingAnnouncement(subjectId, offeringId, {
        title: announcementForm.title,
        content: announcementForm.content,
      });
      setAnnouncements(response.data.announcements || []);
      toast.success('Announcement posted successfully!');
      setShowAnnouncementModal(false);
      setAnnouncementForm({ title: '', content: '' });
    } catch (error) {
      console.error('Error posting announcement:', error);
      toast.error('Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const response = await subjectsAPI.deleteOfferingAnnouncement(subjectId, offeringId, id);
      setAnnouncements(response.data.announcements || []);
      toast.success('Announcement deleted successfully!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    try {
      const response = await subjectsAPI.postOfferingMaterial(subjectId, offeringId, {
        title: materialForm.title,
        type: materialForm.type,
        url: materialForm.url,
        description: materialForm.description,
      });
      setMaterials(response.data.materials || []);
      toast.success('Material uploaded successfully!');
      setShowMaterialModal(false);
      setMaterialForm({ title: '', type: 'link', url: '', description: '' });
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      const response = await subjectsAPI.deleteOfferingMaterial(subjectId, offeringId, id);
      setMaterials(response.data.materials || []);
      toast.success('Material deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'link':
      default:
        return <LinkIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-2 bg-indigo-600"></div>
        
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  {subject?.code}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">
                  {subject?.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {offering?.schoolYear} • {offering?.semester} Semester
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {subject?.units} Units
                  </span>
                  {offering?.schedule && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {offering.schedule}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <div className="text-sm font-medium text-indigo-700 mb-1">Students Enrolled</div>
              <div className="text-4xl font-bold text-indigo-900">
                {offering?.enrolled || enrolledStudents.length}
              </div>
              <div className="text-sm text-indigo-600 mt-1">of {offering?.capacity} capacity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-2 pt-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-medium text-sm transition-colors ${
                activeTab === 'students'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                {enrolledStudents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-medium text-sm transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                {announcements.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-xl font-medium text-sm transition-colors ${
                activeTab === 'materials'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Materials</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                {materials.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Yet</h3>
                  <p className="text-gray-500">Students will appear here once they enroll</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledStudents.map((enrollment) => (
                    <div key={enrollment._id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-sm">
                              {enrollment.student?.user?.firstName?.charAt(0)}
                              {enrollment.student?.user?.lastName?.charAt(0)}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
                              </h3>
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                enrollment.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                enrollment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {enrollment.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="font-medium text-indigo-600">
                                {enrollment.student?.studentNumber}
                              </span>
                              <span>•</span>
                              <span>{enrollment.student?.program}</span>
                              <span>•</span>
                              <span>{enrollment.student?.yearLevel} Year</span>
                            </div>
                            
                            <div className="text-sm text-gray-500 mt-1">
                              {enrollment.student?.user?.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Announcement</span>
                </button>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
                  <p className="text-gray-500">Post your first announcement to communicate with students</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Materials</h2>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Add Material</span>
                </button>
              </div>

              {materials.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Materials Yet</h3>
                  <p className="text-gray-500">Upload course materials for your students</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div key={material._id} className="flex items-center justify-between bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                          {getMaterialIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{material.title}</h3>
                          {material.description && (
                            <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Upload className="w-3 h-3 mr-1" />
                            {new Date(material.uploadDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleDeleteMaterial(material._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Post Announcement</h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  required
                  rows="4"
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Material</h2>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add Material
                </button>
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
