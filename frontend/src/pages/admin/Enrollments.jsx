import { useState, useEffect, useCallback } from 'react';
import { enrollmentsAPI, studentsAPI, subjectsAPI, curriculumAPI } from '../../api';
import { ClipboardList, Plus, Check, X as XIcon, Search, Filter, Calendar, BookOpen, User, Zap } from 'lucide-react';
import { toast } from 'react-toastify';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showBlockedSectionModal, setShowBlockedSectionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [autoEnrollMode, setAutoEnrollMode] = useState(true);
  const [curriculumSubjects, setCurriculumSubjects] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState({
    schoolYear: '',
    semester: '1st',
  });
  const [blockedSectionData, setBlockedSectionData] = useState({
    schoolYear: '',
    semester: '1st',
    program: '',
    yearLevel: '',
    offerings: {}, // Map of subjectId to offeringId
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

  const handleComplete = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to mark this enrollment as completed?')) return;

    try {
      await enrollmentsAPI.updateEnrollmentStatus(enrollmentId, {
        status: 'Completed',
      });
      toast.success('Enrollment marked as completed');
      fetchEnrollments();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to complete enrollment';
      toast.error(errorMsg);
    }
  };

  const handleStudentSelect = async (studentId) => {
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student);
    
    if (student && enrollmentData.schoolYear && enrollmentData.semester) {
      if (autoEnrollMode) {
        // Auto-enrollment: Load curriculum subjects
        await loadCurriculumSubjects(student, enrollmentData.schoolYear, enrollmentData.semester);
      } else {
        // Manual mode: Load available subjects
        await fetchAvailableSubjects(
          student.program,
          student.yearLevel,
          enrollmentData.schoolYear,
          enrollmentData.semester
        );
      }
    }
  };

  const loadCurriculumSubjects = async (student, schoolYear, semester) => {
    try {
      console.log('Loading curriculum for:', { program: student.program, yearLevel: student.yearLevel, semester });
      
      // Get curricula from API
      const curriculaResponse = await curriculumAPI.getCurricula({});
      const curricula = curriculaResponse.data.curricula || curriculaResponse.data.data || curriculaResponse.data || [];
      
      console.log('All curricula:', curricula);
      
      if (curricula.length === 0) {
        setError('No curricula found. Please create curriculum first.');
        setCurriculumSubjects([]);
        return;
      }

      // Find matching curriculum for student's program and status Active
      const matchingCurriculum = curricula.find(c => 
        c.program === student.program &&
        c.status === 'Active'
      );

      console.log('Matching curriculum:', matchingCurriculum);

      if (!matchingCurriculum) {
        setError(`No active curriculum found for ${student.program}`);
        setCurriculumSubjects([]);
        return;
      }

      // Filter curriculum subjects by year level and semester
      const curriculumSubjectsForYearSemester = matchingCurriculum.subjects.filter(cs => 
        cs.yearLevel === student.yearLevel &&
        cs.semester === semester
      );

      console.log('Filtered curriculum subjects:', curriculumSubjectsForYearSemester);

      if (curriculumSubjectsForYearSemester.length === 0) {
        setError(`No subjects found in curriculum for ${student.yearLevel} - ${semester} Semester`);
        setCurriculumSubjects([]);
        return;
      }

      // Get all subjects from API to populate offerings
      const subjectsResponse = await subjectsAPI.getSubjects({});
      const allSubjects = subjectsResponse.data.subjects || subjectsResponse.data || [];

      // Build subjects with their offerings that match school year and semester
      const matchingOfferings = [];
      
      for (const currSubject of curriculumSubjectsForYearSemester) {
        const subjectId = currSubject.subject._id || currSubject.subject;
        const subject = allSubjects.find(s => s._id === subjectId);
        
        if (!subject) continue;

        // Filter offerings for this subject
        const offerings = (subject.offerings || []).filter(o => 
          o.schoolYear === schoolYear &&
          o.semester === semester &&
          o.isOpen === true &&
          o.enrolled < o.capacity
        );

        if (offerings.length > 0) {
          matchingOfferings.push({
            ...subject,
            offerings: offerings
          });
        }
      }

      console.log('Matching offerings:', matchingOfferings);

      setCurriculumSubjects(matchingOfferings);
      
      // Auto-select first offering of each subject
      const autoSelectedOfferings = matchingOfferings
        .filter(s => s.offerings && s.offerings.length > 0)
        .map(s => s.offerings[0]._id);
      
      setSelectedSubjects(autoSelectedOfferings);

      if (matchingOfferings.length === 0) {
        setError('No available offerings for curriculum subjects. Please create subject offerings first.');
      } else {
        toast.success(`Auto-loaded ${matchingOfferings.length} curriculum subjects`);
      }

    } catch (error) {
      console.error('Error loading curriculum subjects:', error);
      setError('Failed to load curriculum subjects');
      setCurriculumSubjects([]);
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
      let subjectsPayload;
      
      if (autoEnrollMode) {
        // Auto-enrollment: Use curriculum offerings from localStorage
        subjectsPayload = selectedSubjects.map(offeringId => {
          const offering = curriculumSubjects
            .flatMap(s => s.offerings)
            .find(o => o.id === offeringId);
          
          return {
            subjectId: offering.subjectId,
            offeringId: offeringId,
          };
        });
      } else {
        // Manual enrollment: Use API subjects
        subjectsPayload = selectedSubjects.map(offeringId => {
          const subject = subjects.find(s => 
            s.offerings?.some(o => o._id === offeringId)
          );
          return {
            subjectId: subject._id,
            offeringId: offeringId,
          };
        });
      }

      const payload = {
        studentId: selectedStudent._id,
        schoolYear: enrollmentData.schoolYear,
        semester: enrollmentData.semester,
        subjects: subjectsPayload,
        enrollmentType: autoEnrollMode ? 'Auto-Curriculum' : 'Admin-Manual',
        status: 'Approved', // Auto-approve admin enrollments
      };

      await enrollmentsAPI.createEnrollment(payload);
      toast.success(`Student enrolled successfully in ${selectedSubjects.length} subjects`);
      setShowEnrollModal(false);
      resetEnrollForm();
      fetchEnrollments();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to enroll student';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const resetEnrollForm = () => {
    setSelectedStudent(null);
    setSelectedSubjects([]);
    setSubjects([]);
    setCurriculumSubjects([]);
    setEnrollmentData({
      schoolYear: '',
      semester: '1st',
    });
    setError('');
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

  const getTotalUnits = () => {
    if (autoEnrollMode) {
      return selectedSubjects.reduce((sum, offeringId) => {
        const subject = curriculumSubjects.find(s => 
          s.offerings?.some(o => o.id === offeringId)
        );
        return sum + (subject?.units || 0);
      }, 0);
    } else {
      return selectedSubjects.reduce((sum, offeringId) => {
        const subject = subjects.find(s => 
          s.offerings?.some(o => o._id === offeringId)
        );
        return sum + (subject?.units || 0);
      }, 0);
    }
  };

  // Blocked Section Enrollment
  const handleBlockedSectionEnroll = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    if (Object.keys(blockedSectionData.offerings).length === 0) {
      setError('Please select at least one subject offering');
      return;
    }

    try {
      // Create enrollments for all selected students with the same offerings
      const enrollmentPromises = selectedStudents.map(studentId => {
        const subjects = Object.entries(blockedSectionData.offerings).map(([subjectId, offeringId]) => ({
          subjectId,
          offeringId,
        }));

        return enrollmentsAPI.createEnrollment({
          studentId,
          schoolYear: blockedSectionData.schoolYear,
          semester: blockedSectionData.semester,
          subjects,
          enrollmentType: 'Blocked-Section',
          status: 'Approved', // Auto-approve admin enrollments
        });
      });

      await Promise.all(enrollmentPromises);
      toast.success(`Successfully enrolled ${selectedStudents.length} students in blocked section`);
      setShowBlockedSectionModal(false);
      resetBlockedSectionForm();
      fetchEnrollments();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to enroll blocked section';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const resetBlockedSectionForm = () => {
    setSelectedStudents([]);
    setBlockedSectionData({
      schoolYear: '',
      semester: '1st',
      program: '',
      yearLevel: '',
      offerings: {},
    });
    setSubjects([]);
    setError('');
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleOfferingSelection = (subjectId, offeringId) => {
    setBlockedSectionData(prev => ({
      ...prev,
      offerings: {
        ...prev.offerings,
        [subjectId]: offeringId,
      },
    }));
  };

  const filteredStudentsForBlocked = students.filter(student =>
    student.program === blockedSectionData.program &&
    student.yearLevel === blockedSectionData.yearLevel
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Enrollments Management</h1>
          <p className="text-sm text-gray-600 mt-1">Review and manage student enrollments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBlockedSectionModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Zap className="w-4 h-4" />
            <span>Blocked Section</span>
          </button>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
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
                          : enrollment.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
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

                    {enrollment.status === 'Approved' && (
                      <button
                        onClick={() => handleComplete(enrollment._id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Complete</span>
                      </button>
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
              {/* Enrollment Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-center space-x-3">
                  <Zap className={`w-5 h-5 ${autoEnrollMode ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      {autoEnrollMode ? 'Auto-Enrollment Mode' : 'Manual Enrollment Mode'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {autoEnrollMode 
                        ? 'Automatically loads curriculum subjects based on program/year/semester' 
                        : 'Manually select subjects for irregular students'
                      }
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAutoEnrollMode(!autoEnrollMode);
                    setSelectedSubjects([]);
                    setCurriculumSubjects([]);
                    setSubjects([]);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoEnrollMode ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoEnrollMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

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
                      <h3 className="text-sm font-medium text-gray-900">
                        {autoEnrollMode ? 'Curriculum Subjects' : 'Available Subjects'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Total Units: <span className="font-medium text-indigo-600">{getTotalUnits()}</span>
                      </div>
                    </div>

                    {autoEnrollMode ? (
                      // Auto-enrollment: Display curriculum subjects
                      curriculumSubjects.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p>No curriculum subjects available</p>
                          <p className="text-xs mt-1">Please create curriculum and offerings first</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {curriculumSubjects.map((subject) => (
                            subject.offerings?.map((offering) => (
                              <div
                                key={offering.id}
                                onClick={() => toggleSubjectSelection(offering.id)}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedSubjects.includes(offering.id)
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <input
                                        type="checkbox"
                                        checked={selectedSubjects.includes(offering.id)}
                                        onChange={() => {}}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                      />
                                      <span className="font-medium text-gray-900">
                                        {subject.code} - {subject.name}
                                      </span>
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                        Curriculum
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 ml-6">
                                      {offering.instructorName} • {offering.schedule} • Room {offering.room}
                                    </div>
                                    <div className="text-sm text-gray-500 ml-6">
                                      {offering.enrolled}/{offering.capacity} enrolled • {subject.units} units
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ))}
                        </div>
                      )
                    ) : (
                      // Manual enrollment: Display all available subjects
                      subjects.length === 0 ? (
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
                                      {offering.schedule && (
                                        <div className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                                          {offering.schedule}
                                          {offering.room && <span> • Room {offering.room}</span>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ))}
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={selectedSubjects.length === 0}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enroll Student ({selectedSubjects.length} subjects, {getTotalUnits()} units)
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

      {/* Blocked Section Modal */}
      {showBlockedSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Blocked Section Enrollment</h2>
                <p className="text-sm text-gray-600 mt-1">Enroll multiple students in the same sections</p>
              </div>
              <button
                onClick={() => {
                  setShowBlockedSectionModal(false);
                  resetBlockedSectionForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Period and Program Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2024-2025"
                    value={blockedSectionData.schoolYear}
                    onChange={(e) => setBlockedSectionData({ ...blockedSectionData, schoolYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <select
                    value={blockedSectionData.semester}
                    onChange={(e) => setBlockedSectionData({ ...blockedSectionData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., BSCS, BSIT"
                    value={blockedSectionData.program}
                    onChange={async (e) => {
                      const newProgram = e.target.value;
                      setBlockedSectionData({ ...blockedSectionData, program: newProgram });
                      if (newProgram && blockedSectionData.yearLevel && blockedSectionData.schoolYear) {
                        await fetchAvailableSubjects(newProgram, blockedSectionData.yearLevel, blockedSectionData.schoolYear, blockedSectionData.semester);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Level *
                  </label>
                  <select
                    value={blockedSectionData.yearLevel}
                    onChange={async (e) => {
                      const newYearLevel = e.target.value;
                      setBlockedSectionData({ ...blockedSectionData, yearLevel: newYearLevel });
                      if (blockedSectionData.program && newYearLevel && blockedSectionData.schoolYear) {
                        await fetchAvailableSubjects(blockedSectionData.program, newYearLevel, blockedSectionData.schoolYear, blockedSectionData.semester);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Year Level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Select Students */}
              {blockedSectionData.program && blockedSectionData.yearLevel && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Students ({selectedStudents.length} selected)
                  </h3>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
                    {filteredStudentsForBlocked.length === 0 ? (
                      <p className="text-sm text-gray-500">No students found for this program and year level</p>
                    ) : (
                      filteredStudentsForBlocked.map(student => (
                        <label key={student._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => toggleStudentSelection(student._id)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {student.user?.firstName} {student.user?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.studentNumber} • {student.program} • {student.yearLevel}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Select Offerings */}
              {selectedStudents.length > 0 && subjects.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Subject Offerings
                  </h3>
                  <div className="space-y-4">
                    {subjects.map(subject => (
                      <div key={subject._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900">{subject.code} - {subject.name}</h4>
                          <p className="text-sm text-gray-600">{subject.units} units</p>
                        </div>
                        <div className="space-y-2">
                          {subject.offerings?.map(offering => (
                            <label key={offering._id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name={`offering-${subject._id}`}
                                checked={blockedSectionData.offerings[subject._id] === offering._id}
                                onChange={() => handleOfferingSelection(subject._id, offering._id)}
                                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {offering.instructor?.firstName} {offering.instructor?.lastName}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {offering.schedule && (
                                    <span>
                                      {offering.schedule}
                                      {offering.room && <span> • Room {offering.room}</span>}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {offering.enrolled}/{offering.capacity} enrolled
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleBlockedSectionEnroll}
                  disabled={selectedStudents.length === 0 || Object.keys(blockedSectionData.offerings).length === 0}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enroll {selectedStudents.length} Students
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBlockedSectionModal(false);
                    resetBlockedSectionForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enrollments;
