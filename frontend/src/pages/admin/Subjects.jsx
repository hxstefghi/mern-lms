import { useState, useEffect } from 'react';
import { subjectsAPI, usersAPI } from '../../api';
import { BookOpen, Plus, Edit2, Trash2, Search, X, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    units: 3,
    program: '',
    yearLevel: '1st Year',
    semester: '1st',
  });
  const [offeringData, setOfferingData] = useState({
    schoolYear: '',
    semester: '1st',
    instructor: '',
    schedule: [],
    capacity: 40,
    room: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchInstructors();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getSubjects({});
      setSubjects(response.data.subjects || response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await usersAPI.getUsersByRole('instructor');
      setInstructors(response.data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingSubject) {
        await subjectsAPI.updateSubject(editingSubject._id, formData);
        toast.success('Subject updated successfully!');
      } else {
        await subjectsAPI.createSubject(formData);
        toast.success('Subject created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save subject';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description || '',
      units: subject.units,
      program: subject.program,
      yearLevel: subject.yearLevel,
      semester: subject.semester,
    });
    setShowModal(true);
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      await subjectsAPI.deleteSubject(subjectId);
      setSuccess('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete subject');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      units: 3,
      program: '',
      yearLevel: '1st Year',
      semester: '1st',
    });
    setEditingSubject(null);
    setError('');
  };

  const handleAssignInstructor = (subject) => {
    setSelectedSubject(subject);
    
    setOfferingData({
      schoolYear: '',
      semester: subject.semester, // Default to subject's semester
      instructor: '', // User will select from available instructors
      schedule: [],
      capacity: 40,
      room: '',
    });
    setShowOfferingModal(true);
  };

  const handleOfferingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create a schedule entry with the room
      const scheduleWithRoom = offeringData.room ? [
        { day: 'Monday', startTime: '08:00', endTime: '10:00', room: offeringData.room }
      ] : [];

      const submissionData = {
        ...offeringData,
        schedule: scheduleWithRoom
      };

      await subjectsAPI.addSubjectOffering(selectedSubject._id, submissionData);
      toast.success('Offering created successfully!');
      setShowOfferingModal(false);
      setOfferingData({
        schoolYear: '',
        semester: '1st',
        instructor: '',
        schedule: [],
        capacity: 40,
        room: '',
      });
      await fetchSubjects();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create offering';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  const handleRemoveInstructor = async (subjectId, offeringId) => {
    if (!window.confirm('Are you sure you want to remove this instructor assignment?')) return;

    try {
      await subjectsAPI.deleteSubjectOffering(subjectId, offeringId);
      toast.success('Instructor removed successfully!');
      fetchSubjects();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove instructor';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.program?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subjects Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage course subjects and curriculum</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No subjects found</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <div key={subject._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-indigo-600 mb-1">
                    {subject.code}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-medium text-gray-900">{subject.units}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Program:</span>
                  <span className="font-medium text-gray-900 text-right truncate ml-2">{subject.program}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Year Level:</span>
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {subject.yearLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Semester:</span>
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {subject.semester}
                  </span>
                </div>
              </div>

              {/* Assigned Instructors */}
              {subject.offerings && subject.offerings.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-medium text-gray-700 mb-2">Assigned Instructors:</div>
                  <div className="space-y-2">
                    {subject.offerings.map((offering) => offering.instructor && (
                      <div key={offering._id} className="flex items-center justify-between">
                        <div className="text-sm text-gray-900">
                          {offering.instructor.firstName} {offering.instructor.lastName}
                          <span className="text-xs text-gray-500 ml-2">({offering.schoolYear} - {offering.semester})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveInstructor(subject._id, offering._id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleAssignInstructor(subject)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign</span>
                </button>
                <button
                  onClick={() => handleEdit(subject)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(subject._id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CS101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="6"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Introduction to Programming"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description of the subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BS Computer Science"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingSubject ? 'Update' : 'Create'}
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

      {/* Offering/Instructor Assignment Modal */}
      {showOfferingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Assign Instructor to {selectedSubject?.code}
              </h2>
              <button
                onClick={() => setShowOfferingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOfferingSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Subject:</strong> {selectedSubject?.code} - {selectedSubject?.name}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Program:</strong> {selectedSubject?.program}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Year Level:</strong> {selectedSubject?.yearLevel}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                <select
                  required
                  value={offeringData.semester}
                  onChange={(e) => setOfferingData({ ...offeringData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor *
                </label>
                <select
                  required
                  value={offeringData.instructor}
                  onChange={(e) => setOfferingData({ ...offeringData, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Instructor</option>
                  {instructors
                    .filter(instructor => instructor.assignedProgram === selectedSubject?.program)
                    .map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Showing instructors assigned to {selectedSubject?.program} program
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Year *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2024-2025"
                  value={offeringData.schoolYear}
                  onChange={(e) => setOfferingData({ ...offeringData, schoolYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={offeringData.capacity}
                  onChange={(e) => setOfferingData({ ...offeringData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Room 101, Lab 3"
                  value={offeringData.room || ''}
                  onChange={(e) => setOfferingData({ ...offeringData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Offering
                </button>
                <button
                  type="button"
                  onClick={() => setShowOfferingModal(false)}
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

export default Subjects;
