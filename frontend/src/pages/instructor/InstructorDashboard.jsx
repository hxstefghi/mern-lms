const InstructorDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600">View your assigned subjects and manage students</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">👨‍🏫</div>
        <h2 className="text-2xl font-semibold mb-2">Welcome, Instructor!</h2>
        <p className="text-gray-600">
          Your dashboard for managing subjects and students will appear here
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">My Subjects</div>
          <div className="text-3xl font-bold text-green-600">0</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Students</div>
          <div className="text-3xl font-bold text-blue-600">0</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">This Semester</div>
          <div className="text-3xl font-bold text-indigo-600">2024-2025</div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
