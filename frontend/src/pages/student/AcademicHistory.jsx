import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentsAPI } from '../../api';

const AcademicHistory = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const studentRes = await studentsAPI.getStudentByUserId(user._id);
      setStudent(studentRes.data);

      const historyRes = await studentsAPI.getAcademicHistory(studentRes.data._id);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching academic history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Group history by school year and semester
  const groupedHistory = history.reduce((acc, record) => {
    const key = `${record.schoolYear}-${record.semester}`;
    if (!acc[key]) {
      acc[key] = {
        schoolYear: record.schoolYear,
        semester: record.semester,
        subjects: [],
      };
    }
    acc[key].subjects.push(record);
    return acc;
  }, {});

  const periods = Object.values(groupedHistory).sort((a, b) => {
    return b.schoolYear.localeCompare(a.schoolYear);
  });

  const calculateGPA = (subjects) => {
    const completedSubjects = subjects.filter((s) => s.grade && s.remarks === 'Passed');
    if (completedSubjects.length === 0) return 'N/A';

    const totalGrade = completedSubjects.reduce((sum, s) => sum + s.grade, 0);
    return (totalGrade / completedSubjects.length).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic History</h1>
        <p className="text-gray-600">View your past subjects, instructors, and grades</p>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Student Number</div>
            <div className="font-semibold text-gray-900">{student?.studentNumber}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Program</div>
            <div className="font-semibold text-gray-900">{student?.program}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Year Level</div>
            <div className="font-semibold text-gray-900">{student?.yearLevel}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Overall GPA</div>
            <div className="font-semibold text-blue-600">{calculateGPA(history)}</div>
          </div>
        </div>
      </div>

      {/* Academic History by Period */}
      {periods.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No academic history found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {periods.map((period, index) => (
            <div key={index} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {period.schoolYear} - {period.semester} Semester
                    </h2>
                    <p className="text-sm text-gray-600">
                      {period.subjects.length} subjects
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">GPA</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {calculateGPA(period.subjects)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Subject Code
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Subject Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Instructor
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Units
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {period.subjects.map((record, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {record.subject?.code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.subject?.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.instructor
                            ? `${record.instructor.firstName} ${record.instructor.lastName}`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {record.subject?.units}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {record.grade || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              record.remarks === 'Passed'
                                ? 'bg-green-100 text-green-800'
                                : record.remarks === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : record.remarks === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {record.remarks}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademicHistory;
