import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, BookOpen, Calendar, Users as UsersIcon, Clock } from 'lucide-react';
import { subjectsAPI, usersAPI } from '../../api';
import { toast } from 'react-toastify';

const SubjectOfferings = () => {
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    instructorId: '',
    schoolYear: '',
    semester: '1st',
    schedule: '',
    room: '',
    capacity: '',
    isOpen: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load subjects
      const subjectsResponse = await subjectsAPI.getSubjects({ limit: 1000 });
      const subjectsData = subjectsResponse.data.subjects || subjectsResponse.data || [];
      setSubjects(subjectsData);

      // Load instructors
      const instructorsResponse = await usersAPI.getUsersByRole('instructor');
      setInstructors(instructorsResponse.data.users || instructorsResponse.data || []);

      // Build offerings list from all subjects' offerings
      const allOfferings = [];
      subjectsData.forEach(subject => {
        if (subject.offerings && subject.offerings.length > 0) {
          subject.offerings.forEach(offering => {
            allOfferings.push({
              ...offering,
              _id: offering._id,
              subjectId: subject._id,
              subjectCode: subject.code,
              subjectName: subject.name,
              subjectUnits: subject.units,
              instructorName: offering.instructor 
                ? `${offering.instructor.firstName} ${offering.instructor.lastName}`
                : 'N/A',
            });
          });
        }
      });
      setOfferings(allOfferings);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingOffering) {
        // Update existing offering
        await subjectsAPI.updateSubjectOffering(
          formData.subjectId,
          editingOffering._id,
          {
            instructor: formData.instructorId,
            schedule: formData.schedule,
            room: formData.room,
            capacity: parseInt(formData.capacity),
            isOpen: formData.isOpen,
          }
        );
        toast.success('Offering updated successfully!');
      } else {
        // Create new offering
        await subjectsAPI.addSubjectOffering(formData.subjectId, {
          schoolYear: formData.schoolYear,
          semester: formData.semester,
          instructor: formData.instructorId,
          schedule: formData.schedule,
          room: formData.room,
          capacity: parseInt(formData.capacity),
          isOpen: formData.isOpen,
        });
        toast.success('Offering created successfully!');
      }

      setShowModal(false);
      resetForm();
      loadData(); // Reload data
    } catch (error) {
      console.error('Error saving offering:', error);
      toast.error(error.response?.data?.message || 'Failed to save offering');
    }
  };

  const handleEdit = (offering) => {
    setEditingOffering(offering);
    setFormData({
      subjectId: offering.subjectId,
      instructorId: offering.instructorId,
      schoolYear: offering.schoolYear,
      semester: offering.semester,
      schedule: offering.schedule,
      room: offering.room,
      capacity: offering.capacity.toString(),
      isOpen: offering.isOpen,
    });
    setShowModal(true);
  };

  const handleDelete = async (offering) => {
    if (!window.confirm('Are you sure you want to delete this offering?')) return;

    try {
      await subjectsAPI.deleteSubjectOffering(offering.subjectId, offering._id);
      toast.success('Offering deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting offering:', error);
      toast.error('Failed to delete offering');
    }
  };

  const toggleStatus = async (offering) => {
    try {
      await subjectsAPI.updateSubjectOffering(
        offering.subjectId,
        offering._id,
        { isOpen: !offering.isOpen }
      );
      toast.success('Offering status updated!');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      subjectId: '',
      instructorId: '',
      schoolYear: '',
      semester: '1st',
      schedule: '',
      room: '',
      capacity: '',
      isOpen: true,
    });
    setEditingOffering(null);
  };

  const filteredOfferings = offerings.filter(offering =>
    offering.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offering.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offering.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offering.schoolYear?.includes(searchTerm)
  );

  const currentYear = new Date().getFullYear();
  const schoolYears = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
    `${currentYear - 1}-${currentYear}`,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subject Offerings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage class schedules and instructor assignments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Offering</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search offerings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Offerings Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : filteredOfferings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No offerings found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first offering to get started</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOfferings.map((offering) => {
            const enrollmentPercentage = (offering.enrolled / offering.capacity) * 100;
            const isFull = offering.enrolled >= offering.capacity;

            return (
              <div key={offering.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-600">{offering.subjectCode}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        offering.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {offering.isOpen ? 'Open' : 'Closed'}
                      </span>
                      {isFull && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                          Full
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {offering.subjectName}
                  </h3>
                  <p className="text-sm text-gray-600">{offering.instructorName}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{offering.schoolYear} - {offering.semester} Semester</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{offering.schedule} | Room {offering.room}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{offering.subjectUnits} Units</span>
                  </div>
                </div>

                {/* Enrollment Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span>Enrollment</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {offering.enrolled}/{offering.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isFull ? 'bg-red-500' : enrollmentPercentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleStatus(offering)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {offering.isOpen ? 'Close' : 'Open'}
                  </button>
                  <button
                    onClick={() => handleEdit(offering)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(offering)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingOffering ? 'Edit Offering' : 'Add New Offering'}
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
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => {
                      const selectedSubject = subjects.find(s => s._id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        subjectId: e.target.value,
                        semester: selectedSubject?.semester || '1st' // Auto-fill semester from subject
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.code} - {subject.name} ({subject.program})
                      </option>
                    ))}
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
                  {formData.subjectId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Default: {subjects.find(s => s._id === formData.subjectId)?.semester}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor *
                </label>
                <select
                  required
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={!formData.subjectId}
                >
                  <option value="">Select Instructor</option>
                  {formData.subjectId && instructors
                    .filter(instructor => {
                      const selectedSubject = subjects.find(s => s._id === formData.subjectId);
                      return instructor.assignedProgram === selectedSubject?.program;
                    })
                    .map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))
                  }
                </select>
                {formData.subjectId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing instructors for {subjects.find(s => s._id === formData.subjectId)?.program}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Year *
                </label>
                <select
                  required
                  value={formData.schoolYear}
                  onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select School Year</option>
                  {schoolYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., MWF 10:00-11:30"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
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
                    placeholder="e.g., 301-A"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 40"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.isOpen}
                    onChange={(e) => setFormData({ ...formData, isOpen: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="true">Open</option>
                    <option value="false">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingOffering ? 'Update' : 'Create'}
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

export default SubjectOfferings;
