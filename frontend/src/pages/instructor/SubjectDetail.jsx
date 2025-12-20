import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { subjectsAPI, enrollmentsAPI } from '../../api';
import { Users, Bell, FileText, Plus, X, Upload, Link as LinkIcon, Video, Download, Trash2 } from 'lucide-react';
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

  // Load announcements from localStorage
  const loadAnnouncements = () => {
    const stored = localStorage.getItem(`announcements_${offeringId}`);
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    }
  };

  // Load materials from localStorage
  const loadMaterials = () => {
    const stored = localStorage.getItem(`materials_${offeringId}`);
    if (stored) {
      setMaterials(JSON.parse(stored));
    }
  };

  // Save announcements to localStorage
  const saveAnnouncements = (newAnnouncements) => {
    localStorage.setItem(`announcements_${offeringId}`, JSON.stringify(newAnnouncements));
    setAnnouncements(newAnnouncements);
  };

  // Save materials to localStorage
  const saveMaterials = (newMaterials) => {
    localStorage.setItem(`materials_${offeringId}`, JSON.stringify(newMaterials));
    setMaterials(newMaterials);
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    const newAnnouncement = {
      id: Date.now(),
      ...announcementForm,
      date: new Date().toISOString(),
    };
    saveAnnouncements([newAnnouncement, ...announcements]);
    toast.success('Announcement posted successfully!');
    setShowAnnouncementModal(false);
    setAnnouncementForm({ title: '', content: '' });
  };

  const handleDeleteAnnouncement = (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    saveAnnouncements(announcements.filter(a => a.id !== id));
    toast.success('Announcement deleted successfully!');
  };

  const handleUploadMaterial = (e) => {
    e.preventDefault();
    const newMaterial = {
      id: Date.now(),
      ...materialForm,
      uploadDate: new Date().toISOString(),
    };
    saveMaterials([newMaterial, ...materials]);
    toast.success('Material uploaded successfully!');
    setShowMaterialModal(false);
    setMaterialForm({ title: '', type: 'link', url: '', description: '' });
  };

  const handleDeleteMaterial = (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    saveMaterials(materials.filter(m => m.id !== id));
    toast.success('Material deleted successfully!');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm font-medium text-green-600 mb-1">
              {subject?.code}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {subject?.name}
            </h1>
            <p className="text-sm text-gray-600">
              {offering?.schoolYear} - {offering?.semester} Semester | {subject?.units} Units
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Students Enrolled</div>
            <div className="text-3xl font-bold text-green-600">
              {offering?.enrolled || enrolledStudents.length}
            </div>
            <div className="text-sm text-gray-500">of {offering?.capacity}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Students ({enrolledStudents.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Announcements ({announcements.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'materials'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Materials ({materials.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students enrolled yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Program
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Year Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {enrolledStudents.map((enrollment) => (
                        <tr key={enrollment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {enrollment.student?.studentNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.student?.user?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {enrollment.student?.program}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {enrollment.student?.yearLevel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              enrollment.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              enrollment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {enrollment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Announcement</span>
                </button>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No announcements yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(announcement.date).toLocaleString()}
                      </p>
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
                <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  <span>Add Material</span>
                </button>
              </div>

              {materials.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No materials uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3 flex-1">
                        {getMaterialIcon(material.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900">{material.title}</h3>
                          {material.description && (
                            <p className="text-sm text-gray-600">{material.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded on {new Date(material.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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
