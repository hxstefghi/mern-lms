import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { subjectsAPI } from '../../api';
import { FileText, Download, Link as LinkIcon, Video, Calendar, User, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const SubjectMaterials = () => {
  const { subjectId, offeringId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'link',
    url: '',
    description: '',
  });

  const loadMaterials = useCallback(async () => {
    try {
      const response = await subjectsAPI.getOfferingMaterials(subjectId, offeringId);
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, offeringId]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await subjectsAPI.addOfferingMaterial(subjectId, offeringId, form);
      toast.success('Material uploaded successfully!');
      setForm({ title: '', type: 'link', url: '', description: '' });
      setShowModal(false);
      loadMaterials();
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Delete this material?')) return;
    try {
      await subjectsAPI.deleteOfferingMaterial(subjectId, offeringId, materialId);
      toast.success('Material deleted');
      loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const getFileIcon = (type) => {
    if (type === 'link') return <LinkIcon className="w-6 h-6" />;
    if (type === 'video') return <Video className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const getFileColor = (type) => {
    if (type === 'link') return 'bg-blue-50 text-blue-600';
    if (type === 'video') return 'bg-purple-50 text-purple-600';
    return 'bg-green-50 text-green-600';
  };

  const handleMaterialClick = (material) => {
    if (material.type === 'link' && material.url) {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    } else if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600">Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Course Materials</h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload Material
        </button>
      </div>

      {materials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Materials Yet</h3>
          <p className="text-gray-600 mb-4">Upload your first material to share with students.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Material
          </button>
        </div>
      ) : (
        materials.map((material) => (
          <div
            key={material._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getFileColor(material.type)}`}>
                {getFileIcon(material.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 wrap-break-word">
                  {material.title}
                </h3>
                
                {material.description && (
                  <p className="text-gray-600 text-sm mb-3 wrap-break-word">
                    {material.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  {material.uploadedBy && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>
                        {material.uploadedBy.firstName} {material.uploadedBy.lastName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium capitalize">
                    {material.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMaterialClick(material)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    {material.type === 'link' ? (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        Open Link
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(material._id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Upload Material Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upload New Material</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="link">Link</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Upload Material
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
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

export default SubjectMaterials;
