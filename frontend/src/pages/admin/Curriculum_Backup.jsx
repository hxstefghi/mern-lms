import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, BookCheck, Calendar } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    program: '',
    effectiveYear: '',
    description: '',
    status: 'Active',
    subjects: [], // Array of {subject, yearLevel, semester, isRequired, prerequisites}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load programs from API
      const programsResponse = await programsAPI.getPrograms({});
      setPrograms(programsResponse.data.data || programsResponse.data || []);

      // Load subjects from API
      const response = await subjectsAPI.getSubjects({});
      setSubjects(response.data.subjects || response.data || []);

      // Load curricula from API
      const curriculaResponse = await curriculumAPI.getCurricula({});
      setCurricula(curriculaResponse.data.curricula || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const saveCurricula = async () => {
    // Reload curricula from API
    try {
      const curriculaResponse = await curriculumAPI.getCurricula({});
      setCurricula(curriculaResponse.data.curricula || []);
    } catch (error) {
      console.error('Error reloading curricula:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.subjects.length === 0) {
      toast.error('Please add at least one subject');
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
      
      await saveCurricula();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast.error(error.response?.data?.message || 'Failed to save curriculum');
    }
  };

  const calculateTotalUnits = (curriculumSubjects) => {
    return curriculumSubjects.reduce((total, currSubject) => {
      const subject = subjects.find(s => s._id === currSubject.subject);
      return total + (subject?.units || 0);
    }, 0);
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
      await saveCurricula();
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
    setEditingCurriculum(null);
  };

  const addSubjectToCurriculum = (yearLevel, semester) => {
    const newSubject = {
      subject: '',
      yearLevel,
      semester,
      isRequired: true,
      prerequisites: [],
    };
    setFormData({
      ...formData,
      subjects: [...formData.subjects, newSubject],
    });
  };

  const updateSubjectInCurriculum = (index, field, value) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const removeSubjectFromCurriculum = (index) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const togglePrerequisite = (subjectIndex, prerequisiteId) => {
    const updatedSubjects = [...formData.subjects];
    const subject = updatedSubjects[subjectIndex];
    const prerequisites = subject.prerequisites || [];
    
    if (prerequisites.includes(prerequisiteId)) {
      subject.prerequisites = prerequisites.filter(id => id !== prerequisiteId);
    } else {
      subject.prerequisites = [...prerequisites, prerequisiteId];
    }
    
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const filteredCurricula = curricula.filter(curriculum =>
    curriculum.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curriculum.effectiveYear?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubjectDetails = (subjectId) => {
    return subjects.find(s => s._id === subjectId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Curriculum Management</h1>
          <p className="text-sm text-gray-600 mt-1">Define subjects per program, year level, and semester</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Curriculum</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search curricula..."
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCurricula.map((curriculum) => (
            <div key={curriculum.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-indigo-600">
                    {curriculum.programCode} - {curriculum.version}
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    {curriculum.totalUnits} Units
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {curriculum.programName}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {curriculum.yearLevel}
                  </div>
                  <div className="flex items-center">
                    <BookCheck className="w-4 h-4 mr-1" />
                    {curriculum.semester} Semester
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Subjects ({curriculum.subjects.length}):
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {curriculum.subjects.map((subjectId) => {
                    const subject = getSubjectDetails(subjectId);
                    return subject ? (
                      <div key={subjectId} className="text-sm text-gray-600 flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span>{subject.code} - {subject.name}</span>
                        <span className="text-xs text-gray-500">{subject.units} units</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(curriculum)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(curriculum._id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCurriculum ? 'Edit Curriculum' : 'Add New Curriculum'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program *
                  </label>
                  <select
                    required
                    value={formData.programId}
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.code} - {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2022, 2023"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Level *
                  </label>
                  <select
                    value={formData.yearLevel}
                    onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subjects * (Total: {calculateTotalUnits(formData.subjects)} units)
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-gray-500">No subjects available. Please create subjects first.</p>
                  ) : (
                    subjects.map((subject) => (
                      <label key={subject._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject._id)}
                          onChange={() => toggleSubject(subject._id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {subject.code} - {subject.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subject.units} units | {subject.program} | {subject.yearLevel}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingCurriculum ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
