import { BookOpen, User, Calendar, Clock, MapPin, Mail, Users, GraduationCap } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const CourseOverview = () => {
  const { subject, offering } = useOutletContext();

  if (!subject) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600">Loading course information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {subject.code} - {subject.name}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {subject.description}
            </p>
          </div>
        </div>
      </div>

      {/* Course Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credits/Units */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Credits</div>
              <div className="text-lg font-semibold text-gray-900">{subject.units} Units</div>
            </div>
          </div>
        </div>

        {/* Instructor */}
        {offering?.instructor && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Instructor</div>
                <div className="text-lg font-semibold text-gray-900">
                  {offering.instructor.firstName} {offering.instructor.lastName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule */}
        {offering?.schedule && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Schedule</div>
                <div className="text-base font-semibold text-gray-900">{offering.schedule}</div>
              </div>
            </div>
          </div>
        )}

        {/* Room */}
        {offering?.room && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Room</div>
                <div className="text-lg font-semibold text-gray-900">{offering.room}</div>
              </div>
            </div>
          </div>
        )}

        {/* Period */}
        {offering && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Academic Period</div>
                <div className="text-base font-semibold text-gray-900">
                  {offering.schoolYear} - {offering.semester}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Capacity */}
        {offering && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Class Size</div>
                <div className="text-lg font-semibold text-gray-900">
                  {offering.enrolled || 0}/{offering.capacity}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prerequisites */}
      {subject.prerequisites && subject.prerequisites.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Prerequisites
          </h3>
          <div className="flex flex-wrap gap-2">
            {subject.prerequisites.map((prereq, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
              >
                {prereq.code} - {prereq.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructor Contact */}
      {offering?.instructor?.email && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Contact Information
          </h3>
          <a
            href={`mailto:${offering.instructor.email}`}
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {offering.instructor.email}
          </a>
        </div>
      )}
    </div>
  );
};

export default CourseOverview;
