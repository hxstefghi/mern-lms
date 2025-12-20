import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, enrollmentsAPI, subjectsAPI } from '../../api';

const Enrollment = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('1st');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  useEffect(() => {
    if (student) {
      fetchAvailableSubjects();
    }
  }, [student, schoolYear, semester]);

  const fetchStudentData = async () => {
    try {
      const res = await studentsAPI.getStudentByUserId(user._id);
      setStudent(res.data);
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const fetchAvailableSubjects = async () => {
    try {
      const res = await subjectsAPI.getAvailableOfferings({
        schoolYear,
        semester,
        program: student?.program,
        yearLevel: student?.yearLevel,
      });
      setAvailableSubjects(res.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const toggleSubject = (subject) => {
    const isSelected = selectedSubjects.some((s) => s._id === subject._id);

    if (isSelected) {
      setSelectedSubjects(selectedSubjects.filter((s) => s._id !== subject._id));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const totalUnits = selectedSubjects.reduce((sum, subject) => sum + subject.units, 0);

  const handleEnroll = async () => {
    if (selectedSubjects.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one subject' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const enrollmentData = {
        studentId: student._id,
        schoolYear,
        semester,
        subjects: selectedSubjects.map((subject) => ({
          subjectId: subject._id,
          offeringId: subject.currentOffering._id,
        })),
        enrollmentType: 'Self',
      };

      await enrollmentsAPI.createEnrollment(enrollmentData);

      setMessage({
        type: 'success',
        text: 'Enrollment submitted successfully! Waiting for admin approval.',
      });
      setSelectedSubjects([]);
      fetchAvailableSubjects();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create enrollment',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Self-Enrollment</h1>
        <p className="text-gray-600">Select subjects for enrollment</p>
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

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Available Subjects */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Subjects</h2>
          <p className="text-sm text-gray-600">Select subjects you want to enroll in</p>
        </div>
        <div className="p-6">
          {availableSubjects.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No subjects available for the selected period
            </p>
          ) : (
            <div className="space-y-3">
              {availableSubjects.map((subject) => {
                const isSelected = selectedSubjects.some((s) => s._id === subject._id);
                const offering = subject.currentOffering;

                return (
                  <div
                    key={subject._id}
                    onClick={() => toggleSubject(subject)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-semibold text-gray-900">{subject.code}</div>
                          <div className="text-sm text-gray-600">-</div>
                          <div className="text-gray-700">{subject.name}</div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Units: {subject.units}</div>
                          <div>
                            Instructor: {offering?.instructor?.firstName}{' '}
                            {offering?.instructor?.lastName}
                          </div>
                          <div>
                            Available Slots: {offering?.capacity - offering?.enrolled} /{' '}
                            {offering?.capacity}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {offering?.schedule?.map((sched, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-xs rounded"
                              >
                                {sched.day} {sched.startTime}-{sched.endTime} ({sched.room})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {selectedSubjects.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Enrollment Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Selected Subjects:</span>
              <span className="font-medium">{selectedSubjects.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Units:</span>
              <span className="font-medium">{totalUnits}</span>
            </div>
          </div>
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Enrollment'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Enrollment;
