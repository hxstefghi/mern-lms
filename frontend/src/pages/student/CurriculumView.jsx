import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI, curriculumAPI, enrollmentsAPI } from '../../api';
import { BookOpen, Clock, User, Award, CheckCircle, AlertCircle, Calendar, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const CurriculumView = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const studentRes = await studentsAPI.getStudentByUserId(user._id);
      const studentData = studentRes.data;
      setStudent(studentData);

      // Fetch curriculum for student's program
      const curriculumRes = await curriculumAPI.getCurriculumByProgram(studentData.program);
      setCurriculum(curriculumRes.data.curriculum);

      // Fetch enrolled subjects
      const enrollmentsRes = await enrollmentsAPI.getStudentEnrollments(studentData._id);
      const enrollments = enrollmentsRes.data.enrollments || enrollmentsRes.data || [];
      
      // Get all enrolled subject IDs
      const enrolledIds = enrollments
        .flatMap(e => e.subjects?.map(s => s.subject?._id || s.subject) || [])
        .filter(Boolean);
      setEnrolledSubjects(enrolledIds);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading curriculum...</div>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-900">No Curriculum Found</h3>
            <p className="text-sm text-yellow-800 mt-1">
              There is no active curriculum for your program ({student?.program}).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group subjects by year level and semester
  const groupedSubjects = {};
  curriculum.subjects?.forEach(currSubject => {
    const yearLevel = currSubject.yearLevel;
    const semester = currSubject.semester;
    const key = `${yearLevel}-${semester}`;
    
    if (!groupedSubjects[key]) {
      groupedSubjects[key] = {
        yearLevel,
        semester,
        subjects: [],
      };
    }
    groupedSubjects[key].subjects.push(currSubject);
  });

  // Filter subjects
  const filteredGroups = Object.values(groupedSubjects).filter(group => {
    if (yearFilter !== 'all' && group.yearLevel !== yearFilter) return false;
    if (semesterFilter !== 'all' && group.semester !== semesterFilter) return false;
    return true;
  });

  // Sort groups by year level and semester
  filteredGroups.sort((a, b) => {
    const yearOrder = { '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4, '5th Year': 5 };
    const semOrder = { '1st': 1, '2nd': 2, 'Summer': 3 };
    
    if (yearOrder[a.yearLevel] !== yearOrder[b.yearLevel]) {
      return yearOrder[a.yearLevel] - yearOrder[b.yearLevel];
    }
    return semOrder[a.semester] - semOrder[b.semester];
  });

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
  const semesters = ['1st', '2nd', 'Summer'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Program Curriculum</h1>
        <p className="text-sm text-gray-600 mt-1">
          {curriculum.program} - Effective Year: {curriculum.effectiveYear}
        </p>
      </div>

      {/* Curriculum Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-indigo-100 text-sm mb-1">Your Program</div>
            <div className="text-2xl font-bold">{student?.program}</div>
          </div>
          <div>
            <div className="text-indigo-100 text-sm mb-1">Total Curriculum Units</div>
            <div className="text-2xl font-bold">{curriculum.totalUnits}</div>
          </div>
          <div>
            <div className="text-indigo-100 text-sm mb-1">Year Level & Section</div>
            <div className="text-2xl font-bold">{student?.yearLevel} - {student?.section}</div>
          </div>
        </div>
        {curriculum.description && (
          <p className="mt-4 text-indigo-50">{curriculum.description}</p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Year Level
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Year Levels</option>
                {yearLevels.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Semester
              </label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>{sem} Semester</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects by Year and Semester */}
      <div className="space-y-6">
        {filteredGroups.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No subjects found for the selected filters.</p>
          </div>
        ) : (
          filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Group Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
                <h3 className="text-lg font-semibold">
                  {group.yearLevel} - {group.semester} Semester
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  {group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''} • 
                  {' '}{group.subjects.reduce((sum, s) => sum + (s.subject?.units || 0), 0)} total units
                </p>
              </div>

              {/* Subjects List */}
              <div className="divide-y divide-gray-200">
                {group.subjects.map((currSubject, idx) => {
                  const subject = currSubject.subject;
                  const isEnrolled = enrolledSubjects.includes(subject?._id);
                  const hasPrerequisites = currSubject.prerequisites?.length > 0;

                  return (
                    <div
                      key={idx}
                      className={`p-6 hover:bg-gray-50 transition-colors ${
                        isEnrolled ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {subject?.code} - {subject?.name}
                            </h4>
                            {isEnrolled && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Enrolled/Completed
                              </span>
                            )}
                            {currSubject.isRequired && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {subject?.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Award className="w-4 h-4 mr-1" />
                              <span className="font-medium">{subject?.units}</span> units
                            </div>

                            {hasPrerequisites && (
                              <div className="flex items-center text-amber-600">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                <span>Prerequisites required</span>
                              </div>
                            )}
                          </div>

                          {hasPrerequisites && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-xs font-medium text-amber-900 mb-1">
                                Prerequisites:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {currSubject.prerequisites.map((prereq, prereqIdx) => (
                                  <span
                                    key={prereqIdx}
                                    className="inline-flex items-center px-2 py-1 text-xs rounded bg-amber-100 text-amber-800"
                                  >
                                    {prereq?.code} - {prereq?.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Available Offerings */}
                          {subject?.offerings?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-700 mb-2">
                                Available Offerings:
                              </p>
                              <div className="space-y-2">
                                {subject.offerings.map((offering, offerIdx) => (
                                  <div
                                    key={offerIdx}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-4 text-sm">
                                        <span className="font-medium text-gray-700">
                                          {offering.schoolYear}
                                        </span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-600">
                                          {offering.semester} Semester
                                        </span>
                                      </div>
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        offering.isOpen
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {offering.isOpen ? 'Open' : 'Closed'}
                                      </span>
                                    </div>
                                    
                                    {offering.instructor && (
                                      <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <User className="w-4 h-4 mr-2" />
                                        Instructor: {offering.instructor.firstName} {offering.instructor.lastName}
                                      </div>
                                    )}

                                    <div className="text-xs text-gray-500">
                                      Capacity: {offering.enrolled}/{offering.capacity} students
                                    </div>

                                    {offering.schedule && (
                                      <div className="mt-2 text-xs text-gray-600">
                                        <div className="flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          <span>{offering.schedule}</span>
                                          {offering.room && <span className="ml-2">• Room {offering.room}</span>}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to Enroll:</p>
            <p>
              To enroll in subjects, go to the <strong>Enrollment</strong> page during the enrollment period. 
              Subject offerings shown here are based on the current curriculum and may vary per semester.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumView;
