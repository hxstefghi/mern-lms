import { useOutletContext } from 'react-router-dom';
import { BookOpen, User, Calendar, Clock, MapPin, Mail, Users, GraduationCap } from 'lucide-react';

const SubjectOverview = () => {
  const { subject, offering, enrolledStudents } = useOutletContext();

  if (!subject) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600">Loading subject information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Header */}
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

        {/* Enrolled Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Enrolled Students</div>
              <div className="text-lg font-semibold text-gray-900">
                {enrolledStudents?.length || 0} / {offering?.capacity || 0}
              </div>
            </div>
          </div>
        </div>

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
      </div>

      {/* Enrolled Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Enrolled Students ({enrolledStudents?.length || 0})
        </h3>
        
        {enrolledStudents && enrolledStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrolledStudents.map((enrollment) => {
                  const student = enrollment.student;
                  const studentUser = student?.user;
                  
                  return (
                    <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student?.studentNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {studentUser?.firstName || student?.firstName || ''} {studentUser?.lastName || student?.lastName || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{studentUser?.email || student?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student?.program || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student?.yearLevel || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          enrollment.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : enrollment.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600">No students enrolled yet</p>
            <p className="text-sm text-gray-500 mt-1">Students will appear here once they enroll in this offering</p>
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
    </div>
  );
};

export default SubjectOverview;
