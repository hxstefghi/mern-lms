import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, enrollmentsAPI, subjectsAPI, curriculumAPI } from '../../api';

const Enrollment = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [curriculumSubjects, setCurriculumSubjects] = useState([]);
  const [selectedOfferings, setSelectedOfferings] = useState({});
  
  // Auto-detect school year and semester
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // January is 0
    
    // If month is August (8) to December (12), school year is current-next
    // If month is January (1) to July (7), school year is previous-current
    if (currentMonth >= 8) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };
  
  const getCurrentSemester = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    
    // August to December: 1st Semester
    // January to May: 2nd Semester
    // June to July: Summer
    if (currentMonth >= 8 && currentMonth <= 12) {
      return '1st';
    } else if (currentMonth >= 1 && currentMonth <= 5) {
      return '2nd';
    } else {
      return 'Summer';
    }
  };
  
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [semester, setSemester] = useState(getCurrentSemester());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  useEffect(() => {
    if (student) {
      fetchCurriculumSubjects();
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

  const fetchCurriculumSubjects = async () => {
    try {
      if (!student?.program) {
        setCurriculumSubjects([]);
        return;
      }

      // Fetch curriculum for student's program
      const curriculumRes = await curriculumAPI.getCurriculumByProgram(student.program);
      const curriculum = curriculumRes.data.curriculum;
      
      if (!curriculum) {
        setCurriculumSubjects([]);
        return;
      }
      
      // Filter subjects based on student's year level and current semester
      const subjectsForPeriod = curriculum.subjects
        .filter(currSubject => 
          currSubject.yearLevel === student?.yearLevel &&
          currSubject.semester === semester
        )
        .map(currSubject => {
          const subject = currSubject.subject;
          // Filter offerings for current school year and semester
          const validOfferings = subject.offerings?.filter(
            offering => offering.schoolYear === schoolYear && 
                       offering.semester === semester &&
                       offering.isOpen
          ) || [];
          
          return {
            ...subject,
            offerings: validOfferings
          };
        })
        .filter(subject => subject.offerings.length > 0);
      
      setCurriculumSubjects(subjectsForPeriod);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setCurriculumSubjects([]);
    }
  };

  const handleOfferingSelect = (subjectId, offeringId) => {
    setSelectedOfferings(prev => ({
      ...prev,
      [subjectId]: offeringId
    }));
  };

  const totalUnits = curriculumSubjects
    .filter(subject => selectedOfferings[subject._id])
    .reduce((sum, subject) => sum + subject.units, 0);

  const handleRequestEnrollment = async () => {
    const selectedSubjectIds = Object.keys(selectedOfferings);
    
    if (selectedSubjectIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one subject offering' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const subjects = selectedSubjectIds.map(subjectId => ({
        subjectId,
        offeringId: selectedOfferings[subjectId]
      }));

      await enrollmentsAPI.createEnrollment({
        studentId: student._id,
        schoolYear,
        semester,
        subjects,
        enrollmentType: 'Self',
        status: 'Pending', // Request needs admin approval
      });

      setMessage({ 
        type: 'success', 
        text: 'Enrollment request submitted successfully! Please wait for registrar approval.' 
      });
      setSelectedOfferings({});
      
      // Refresh the list
      fetchCurriculumSubjects();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">View Available Subjects</h1>
        <p className="text-gray-600">View available subjects and request enrollment for the semester</p>
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
          <h2 className="text-lg font-semibold text-gray-900">Available Subjects & Offerings</h2>
          <p className="text-sm text-gray-600">Select one offering (section/schedule) for each subject</p>
        </div>
        <div className="p-6">
          {curriculumSubjects.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No subjects available for enrollment in the selected period
            </p>
          ) : (
            <div className="space-y-6">
              {curriculumSubjects.map((subject) => (
                <div key={subject._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {subject.code} - {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600">{subject.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                      <span>Units: {subject.units}</span>
                      {subject.prerequisites?.length > 0 && (
                        <span className="text-amber-600">
                          Prerequisites: {subject.prerequisites.map(p => p.code).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Available Sections/Schedules:
                    </div>
                    {subject.offerings.map((offering, idx) => {
                      const isSelected = selectedOfferings[subject._id] === offering._id;
                      const availableSlots = offering.capacity - offering.enrolled;
                      
                      return (
                        <div
                          key={offering._id}
                          onClick={() => handleOfferingSelect(subject._id, offering._id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="font-medium text-gray-900">
                                  Section {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {offering.instructor?.firstName} {offering.instructor?.lastName}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  availableSlots > 10 
                                    ? 'bg-green-100 text-green-800' 
                                    : availableSlots > 0 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {availableSlots} slots left
                                </span>
                              </div>
                              {offering.schedule && (
                                <div className="text-sm text-gray-600">
                                  {offering.schedule}
                                  {offering.room && <span> • Room {offering.room}</span>}
                                </div>
                              )}
                            </div>
                            <div>
                              <input
                                type="radio"
                                name={`offering-${subject._id}`}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {Object.keys(selectedOfferings).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Enrollment Request Summary</h2>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is an enrollment request. After submission, please wait for the registrar's approval. You can also visit the registrar's office to enroll in a blocked section with your classmates.
            </p>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Selected Subjects:</span>
              <span className="font-medium">{Object.keys(selectedOfferings).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Units:</span>
              <span className="font-medium">{totalUnits}</span>
            </div>
          </div>
          <button
            onClick={handleRequestEnrollment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Submitting Request...' : 'Submit Enrollment Request'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Enrollment;
