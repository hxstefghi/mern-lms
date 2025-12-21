import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, registrationAPI } from '../../api';

const RegistrationCard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [registrationCard, setRegistrationCard] = useState(null);
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('1st');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudent();
  }, [user]);

  const fetchStudent = async () => {
    try {
      const res = await studentsAPI.getStudentByUserId(user._id);
      setStudent(res.data);
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const fetchRegistrationCard = async () => {
    if (!student) return;

    setLoading(true);
    setError('');

    try {
      const res = await registrationAPI.getRegistrationCardByStudent(student._id, {
        schoolYear,
        semester,
      });
      setRegistrationCard(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch registration card');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student) {
      fetchRegistrationCard();
    }
  }, [student, schoolYear, semester]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registration Card</h1>
        <p className="text-gray-600">View your official registration card</p>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Select Period</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
            <input
              type="text"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Loading registration card...</div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      {registrationCard && !loading && (
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <h2 className="text-2xl font-bold text-center">REGISTRATION CARD</h2>
            <p className="text-center text-blue-100 mt-2">
              {registrationCard.academicPeriod.schoolYear} -{' '}
              {registrationCard.academicPeriod.semester} Semester
            </p>
          </div>

          {/* Student Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Student Number</div>
                <div className="font-semibold text-gray-900">
                  {registrationCard.student.studentNumber}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Student Name</div>
                <div className="font-semibold text-gray-900">{registrationCard.student.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Program</div>
                <div className="font-semibold text-gray-900">
                  {registrationCard.student.program}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Year Level</div>
                <div className="font-semibold text-gray-900">
                  {registrationCard.student.yearLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Enrolled Subjects</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Units
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Instructor
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Schedule
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrationCard.subjects.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{subject.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{subject.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{subject.units}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {subject.instructor?.firstName} {subject.instructor?.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {subject.schedule || 'N/A'}
                        {subject.room && <div className="text-xs text-gray-500">Room: {subject.room}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total Units
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">
                      {registrationCard.totalUnits}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Enrollment Date</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(registrationCard.enrollmentDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div
                  className={`text-sm font-medium ${
                    registrationCard.status === 'Approved'
                      ? 'text-green-600'
                      : registrationCard.status === 'Pending'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}
                >
                  {registrationCard.status}
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Print Registration Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationCard;
