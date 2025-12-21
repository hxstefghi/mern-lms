import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { subjectsAPI } from '../../api';
import { FileText, Download, Link as LinkIcon, Video, Calendar, User } from 'lucide-react';

const CourseMaterials = () => {
  const { subjectId, offeringId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Materials Yet</h3>
        <p className="text-gray-600">Your instructor hasn't uploaded any materials.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Course Materials</h2>
        <span className="text-sm text-gray-600">{materials.length} items</span>
      </div>

      {materials.map((material) => (
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseMaterials;
