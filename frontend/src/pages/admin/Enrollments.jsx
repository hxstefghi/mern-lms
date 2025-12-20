import { useState, useEffect, useCallback } from 'react';
import { enrollmentsAPI, studentsAPI, subjectsAPI } from '../../api';
import { ClipboardList, Plus, Check, X as XIcon, Search, Filter, Calendar, BookOpen, User } from 'lucide-react';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState({
    schoolYear: '',
    semester: '1st',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await enrollmentsAPI.getEnrollments(params);
      setEnrollments(response.data.enrollments || response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await studentsAPI.getStudents({});
      setStudents(response.data.students || response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
  }, [fetchEnrollments, fetchStudents]);

  const fetchAvailableSubjects = async (program, yearLevel, schoolYear, semester) => {
    try {
      const response = await subjectsAPI.getAvailableOfferings({
        program,
        yearLevel,
        schoolYear,
        semester,
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load available subjects');
    }
  };

  const handleApprove = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to approve this enrollment?')) return;

    try {
      await enrollmentsAPI.updateEnrollmentStatus(enrollmentId, {
        status: 'Approved',
      });
      setSuccess('Enrollment approved successfully');
      fetchEnrollments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve enrollment');
    }
  };

  const handleReject = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to reject this enrollment?')) return;

    try {
      await enrollmentsAPI.updateEnrollmentStatus(enrollmentId, {
        status: 'Rejected',
      });
      setSuccess('Enrollment rejected successfully');
      fetchEnrollments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject enrollment');
    }
  };

  const handleStudentSelect = async (studentId) => {
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student);
    
    if (student && enrollmentData.schoolYear && enrollmentData.semester) {
      await fetchAvailableSubjects(
        student.program,
        student.yearLevel,
        enrollmentData.schoolYear,
        enrollmentData.semester
      );
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    try {
      // Transform selected offerings to the format expected by backend
      const subjectsPayload = selectedSubjects.map(offeringId => {
        const subject = subjects.find(s => 
          s.offerings?.some(o => o._id === offeringId)
        );
        return {
          subjectId: subject._id,
          offeringId: offeringId,
        };
      });

      const payload = {
        studentId: selectedStudent._id,
        schoolYear: enrollmentData.schoolYear,
        semester: enrollmentData.semester,
        subjects: subjectsPayload,
        enrollmentType: 'Admin',
      };

      await enrollmentsAPI.createEnrollment(payload);
      setSuccess('Student enrolled successfully');
      setShowEnrollModal(false);
      resetEnrollForm();
      fetchEnrollments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll student');
    }
  };

  const resetEnrollForm = () => {
    setSelectedStudent(null);
    setSelectedSubjects([]);
    setSubjects([]);
    setEnrollmentData({
      schoolYear: '',
      semester: '1st',
    });
  };

  const toggleSubjectSelection = (offeringId) => {
    setSelectedSubjects(prev =>
      prev.includes(offeringId)
        ? prev.filter(id => id !== offeringId)
        : [...prev, offeringId]
    );
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const studentName = `${enrollment.student?.user?.firstName} ${enrollment.student?.user?.lastName}`.toLowerCase();
    const studentNumber = enrollment.student?.studentNumber?.toLowerCase() || '';
    return studentName.includes(searchTerm.toLowerCase()) || studentNumber.includes(searchTerm.toLowerCase());
  });

  const totalUnits = selectedSubjects.reduce((sum, offeringId) => {
    const subject = subjects.find(s => 
      s.offerings?.some(o => o._id === offeringId)
    );
    return sum + (subject?.units || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Enrollments Management</h1>
          <p className="text-sm text-gray-600 mt-1">Review and manage student enrollments</p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll Student</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No enrollments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {enrollment.student?.user?.firstName?.[0]}{enrollment.student?.user?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {enrollment.student?.studentNumber} • {enrollment.student?.program}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">School Year</div>
                        <div className="text-sm font-medium text-gray-900">{enrollment.schoolYear}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Semester</div>
                        <div className="text-sm font-medium text-gray-900">{enrollment.semester}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Units</div>
                        <div className="text-sm font-medium text-gray-900">{enrollment.totalUnits}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Subjects</div>
                        <div className="text-sm font-medium text-gray-900">{enrollment.subjects?.length || 0}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-gray-500 mb-2">Enrolled Subjects:</div>
                      <div className="flex flex-wrap gap-2">
                        {enrollment.subjects?.map((subject, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700"
                          >
                            {subject.subject?.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        enrollment.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : enrollment.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {enrollment.status}
                    </span>

                    {enrollment.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(enrollment._id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(enrollment._id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <XIcon className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Type: {enrollment.enrollmentType}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Enroll Student</h2>
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  resetEnrollForm();
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEnrollStudent} className="space-y-6">
              {/* Period Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2024-2025"
                    value={enrollmentData.schoolYear}
                    onChange={(e) => setEnrollmentData({ ...enrollmentData, schoolYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    value={enrollmentData.semester}
                    onChange={(e) => setEnrollmentData({ ...enrollmentData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student *
                </label>
                <select
                  value={selectedStudent?._id || ''}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.studentNumber} - {student.user?.firstName} {student.user?.lastName} ({student.program} - {student.yearLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              {selectedStudent && enrollmentData.schoolYear && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Available Subjects</h3>
                      <div className="text-sm text-gray-600">
                        Total Units: <span className="font-medium text-indigo-600">{totalUnits}</span>
                      </div>
                    </div>

                    {subjects.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p>No available subjects for this program and semester</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {subjects.map((subject) => (
                          subject.offerings?.map((offering) => (
                            <div
                              key={offering._id}
                              onClick={() => toggleSubjectSelection(offering._id)}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedSubjects.includes(offering._id)
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubjects.includes(offering._id)}
                                      onChange={() => {}}
                                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <h4 className="font-medium text-gray-900">{subject.code}</h4>
                                    <span className="text-sm text-gray-600">- {subject.name}</span>
                                  </div>
                                  <div className="ml-6 text-sm text-gray-600">
                                    <div className="flex items-center space-x-4 mt-1">
                                      <span>{subject.units} units</span>
                                      {offering.instructor && (
                                        <span>• Instructor: {offering.instructor.firstName} {offering.instructor.lastName}</span>
                                      )}
                                      <span>• Slots: {offering.enrolled}/{offering.capacity}</span>
                                    </div>
                                    {offering.schedule && offering.schedule.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {offering.schedule.map((sched, idx) => (
                                          <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                            {sched.day} {sched.startTime}-{sched.endTime}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={selectedSubjects.length === 0}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enroll Student ({selectedSubjects.length} subjects, {totalUnits} units)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEnrollModal(false);
                        resetEnrollForm();
                        setError('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enrollments;
