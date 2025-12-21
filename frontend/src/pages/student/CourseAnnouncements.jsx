import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { subjectsAPI } from '../../api';
import { Megaphone, Calendar, User } from 'lucide-react';

const CourseAnnouncements = () => {
  const { subjectId, offeringId } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = useCallback(async () => {
    try {
      const response = await subjectsAPI.getOfferingAnnouncements(subjectId, offeringId);
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, offeringId]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600">Loading announcements...</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
        <p className="text-gray-600">Your instructor hasn't posted any announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
        <span className="text-sm text-gray-600">{announcements.length} total</span>
      </div>
      
      {announcements.map((announcement) => (
        <div
          key={announcement._id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {announcement.title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                {announcement.content}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {announcement.postedBy && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>
                      {announcement.postedBy.firstName} {announcement.postedBy.lastName}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseAnnouncements;
