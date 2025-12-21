import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, BookCheck, Calendar, GraduationCap } from 'lucide-react';
import { subjectsAPI, programsAPI, curriculumAPI } from '../../api';
import { toast } from 'react-toastify';

const Curriculum = () => {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  
  // Simple form for adding subjects to curriculum
  const [formData, setFormData] = useState({
    program: '',
    effectiveYear: '',
    description: '',
    status: 'Active',
    subjects: [],
  });

  // Current subject being added
  const [currentSubject, setCurrentSubject] = useState({
    subject: '',
    yearLevel: '1st Year',
    semester: '1st',
    isRequired: true,
    prerequisites: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [programsRes, subjectsRes, curriculaRes] = await Promise.all([
        programsAPI.getPrograms({}),
        subjectsAPI.getSubjects({}),
        curriculumAPI.getCurricula({}),
      ]);

      console.log('Curricula Response:', curriculaRes.data);
      
      setPrograms(programsRes.data.data || programsRes.data || []);
      setSubjects(subjectsRes.data.subjects || subjectsRes.data || []);
      setCurricula(curriculaRes.data.curricula || curriculaRes.data.data || curriculaRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    if (!formData.program) {
      toast.error('Please select a program');
      return;
    }

    try {
      if (editingCurriculum) {
        await curriculumAPI.updateCurriculum(editingCurriculum._id, formData);
        toast.success('Curriculum updated successfully!');
      } else {
        await curriculumAPI.createCurriculum(formData);
        toast.success('Curriculum created successfully!');
      }
      
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast.error(error.response?.data?.message || 'Failed to save curriculum');
    }
  };

  const handleEdit = (curriculum) => {
    setEditingCurriculum(curriculum);
    setFormData({
      program: curriculum.program,
      effectiveYear: curriculum.effectiveYear,
      description: curriculum.description || '',
      status: curriculum.status || 'Active',
      subjects: curriculum.subjects.map(s => ({
        subject: s.subject._id || s.subject,
        yearLevel: s.yearLevel,
        semester: s.semester,
        isRequired: s.isRequired !== false,
        prerequisites: s.prerequisites?.map(p => p._id || p) || [],
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (curriculumId) => {
    if (!window.confirm('Are you sure you want to delete this curriculum?')) return;

    try {
      await curriculumAPI.deleteCurriculum(curriculumId);
      await loadData();
      toast.success('Curriculum deleted successfully!');
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      toast.error('Failed to delete curriculum');
    }
  };

  const resetForm = () => {
    setFormData({
      program: '',
      effectiveYear: '',
      description: '',
      status: 'Active',
      subjects: [],
    });
    setCurrentSubject({
      subject: '',
      yearLevel: '1st Year',
      semester: '1st',
      isRequired: true,
      prerequisites: [],
    });
    setEditingCurriculum(null);
  };

  const addSubjectToForm = (subjectId, yearLevel, semester) => {
    // Check if subject already exists
    if (formData.subjects.some(s => s.subject === subjectId && s.yearLevel === yearLevel && s.semester === semester)) {
      toast.error('Subject already added for this year level and semester');
      return;
    }

    setFormData({
      ...formData,
      subjects: [...formData.subjects, {
        subject: subjectId,
        yearLevel,
        semester,
        isRequired: true,
        prerequisites: [],
      }],
    });
  };

  const toggleSubject = (subjectId, yearLevel, semester) => {
    const existingIndex = formData.subjects.findIndex(
      s => s.subject === subjectId && s.yearLevel === yearLevel && s.semester === semester
    );

    if (existingIndex >= 0) {
      // Remove subject
      setFormData({
        ...formData,
        subjects: formData.subjects.filter((_, i) => i !== existingIndex),
      });
    } else {
      // Add subject
      addSubjectToForm(subjectId, yearLevel, semester);
    }
  };

  const isSubjectSelected = (subjectId, yearLevel, semester) => {
    return formData.subjects.some(
      s => s.subject === subjectId && s.yearLevel === yearLevel && s.semester === semester
    );
  };

  const getSubjectDetails = (subjectId) => {
    return subjects.find(s => s._id === subjectId);
  };

  const getTotalUnits = (curriculumSubjects) => {
    return curriculumSubjects.reduce((total, currSubject) => {
      const subject = subjects.find(s => s._id === (currSubject.subject?._id || currSubject.subject));
      return total + (subject?.units || 0);
    }, 0);
  };

  const getProgramName = (programCode) => {
    const program = programs.find(p => p.code === programCode);
    return program?.name || programCode;
  };

  const filteredCurricula = curricula.filter(curriculum =>
    curriculum.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curriculum.effectiveYear?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Curriculum Management</h1>
          <p className="text-sm text-gray-600 mt-1">Define curriculum structure for each program</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Create Curriculum</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search curricula by program or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Curricula Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : filteredCurricula.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <BookCheck className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No curricula found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first curriculum to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCurricula.map((curriculum) => (
            <div key={curriculum._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {curriculum.program} - {getProgramName(curriculum.program)}
                    </h3>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      curriculum.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {curriculum.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Effective Year: {curriculum.effectiveYear}
                    </div>
                    <div className="flex items-center">
                      <BookCheck className="w-4 h-4 mr-1" />
                      {curriculum.subjects.length} Subjects
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      {getTotalUnits(curriculum.subjects)} Total Units
                    </div>
                  </div>
                  {curriculum.description && (
                    <p className="text-sm text-gray-600 mt-2">{curriculum.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(curriculum)}
                    className="px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(curriculum._id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subjects by Year and Semester */}
              <div className="space-y-4">
                {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map(yearLevel => {
                  const yearSubjects = curriculum.subjects.filter(s => s.yearLevel === yearLevel);
                  if (yearSubjects.length === 0) return null;

                  return (
                    <div key={yearLevel} className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">{yearLevel}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['1st', '2nd', 'Summer'].map(semester => {
                          const semesterSubjects = yearSubjects.filter(s => s.semester === semester);
                          if (semesterSubjects.length === 0) return null;

                          return (
                            <div key={semester} className="space-y-2">
                              <div className="text-sm font-medium text-gray-700">{semester} Semester</div>
                              {semesterSubjects.map((currSubject, idx) => {
                                const subject = getSubjectDetails(currSubject.subject?._id || currSubject.subject);
                                return subject ? (
                                  <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                    <div className="font-medium text-gray-900">{subject.code}</div>
                                    <div className="text-gray-600">{subject.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{subject.units} units</div>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCurriculum ? 'Edit Curriculum' : 'Create New Curriculum'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Code *
                  </label>
                  <select
                    required
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program._id} value={program.code}>
                        {program.code} - {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2024-2025"
                    value={formData.effectiveYear}
                    onChange={(e) => setFormData({ ...formData, effectiveYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Select Subjects (Backup-style checkbox list) */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Subjects</h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Level
                    </label>
                    <select
                      value={currentSubject.yearLevel}
                      onChange={(e) => setCurrentSubject({ ...currentSubject, yearLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year">5th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <select
                      value={currentSubject.semester}
                      onChange={(e) => setCurrentSubject({ ...currentSubject, semester: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subjects for {currentSubject.yearLevel} • {currentSubject.semester} Semester (Total: {getTotalUnits(
                    formData.subjects.filter((s) => s.yearLevel === currentSubject.yearLevel && s.semester === currentSubject.semester)
                  )} units)
                </label>

                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-gray-500">No subjects available. Please create subjects first.</p>
                  ) : (
                    subjects.map((subject) => (
                      <label
                        key={subject._id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSubjectSelected(subject._id, currentSubject.yearLevel, currentSubject.semester)}
                          onChange={() => toggleSubject(subject._id, currentSubject.yearLevel, currentSubject.semester)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {subject.code} - {subject.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subject.units} units{subject.program ? ` | ${subject.program}` : ''}{subject.yearLevel ? ` | ${subject.yearLevel}` : ''}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Summary of Added Subjects */}
              {formData.subjects.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Selected Subjects ({formData.subjects.length}) - Total Units: {getTotalUnits(formData.subjects)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map(yearLevel => {
                      const yearSubjects = formData.subjects.filter(s => s.yearLevel === yearLevel);
                      if (yearSubjects.length === 0) return null;

                      return (
                        <div key={yearLevel} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-gray-900 mb-2 text-sm">{yearLevel}</div>
                          {['1st', '2nd', 'Summer'].map(semester => {
                            const semesterSubjects = yearSubjects.filter(s => s.semester === semester);
                            if (semesterSubjects.length === 0) return null;

                            return (
                              <div key={semester} className="mb-2">
                                <div className="text-xs font-medium text-gray-600 mb-1">{semester} Semester</div>
                                {semesterSubjects.map((currSubject, idx) => {
                                  const subject = getSubjectDetails(currSubject.subject);
                                  return subject ? (
                                    <div key={idx} className="text-xs text-gray-700 ml-2">
                                      • {subject.code} ({subject.units}u)
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {editingCurriculum ? 'Update Curriculum' : 'Create Curriculum'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curriculum;
