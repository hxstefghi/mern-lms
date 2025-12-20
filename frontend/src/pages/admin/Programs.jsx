import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = () => {
    const stored = localStorage.getItem('programs');
    if (stored) {
      setPrograms(JSON.parse(stored));
    }
    setLoading(false);
  };

  const savePrograms = (newPrograms) => {
    localStorage.setItem('programs', JSON.stringify(newPrograms));
    setPrograms(newPrograms);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (editingProgram) {
        const updated = programs.map(p => 
          p.id === editingProgram.id 
            ? { ...editingProgram, ...formData, code: formData.code.toUpperCase() }
            : p
        );
        savePrograms(updated);
        toast.success('Program updated successfully!');
      } else {
        const newProgram = {
          id: Date.now(),
          ...formData,
          code: formData.code.toUpperCase(),
          createdAt: new Date().toISOString(),
        };
        savePrograms([...programs, newProgram]);
        toast.success('Program created successfully!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save program');
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      code: program.code,
      name: program.name,
      description: program.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;

    try {
      savePrograms(programs.filter(p => p.id !== programId));
      toast.success('Program deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete program');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
    });
    setEditingProgram(null);
  };

  const filteredPrograms = programs.filter(program =>
    program.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Programs Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage academic programs and degrees</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Program</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <GraduationCap className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No programs found</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="text-sm font-medium text-indigo-600 mb-1">
                  {program.code}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {program.name}
                </h3>
                {program.description && (
                  <p className="text-sm text-gray-600">
                    {program.description}
                  </p>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(program)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
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
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProgram ? 'Edit Program' : 'Add New Program'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BSIT, BSCS"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BS Information Technology"
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
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingProgram ? 'Update' : 'Create'}
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

export default Programs;
