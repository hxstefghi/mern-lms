import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import ModernStudentLayout from './layouts/ModernStudentLayout';
import ModernSISLayout from './layouts/ModernSISLayout';
import ModernAdminLayout from './layouts/ModernAdminLayout';
import ModernInstructorLayout from './layouts/ModernInstructorLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import CourseOverview from './pages/student/CourseOverview';
import CourseAnnouncements from './pages/student/CourseAnnouncements';
import CourseMaterials from './pages/student/CourseMaterials';
import CourseQuizzes from './pages/student/CourseQuizzes';
import CurriculumView from './pages/student/CurriculumView';
import Enrollment from './pages/student/Enrollment';
import RegistrationCard from './pages/student/RegistrationCard';
import Tuition from './pages/student/Tuition';
import AcademicHistory from './pages/student/AcademicHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Students from './pages/admin/Students';
import Instructors from './pages/admin/Instructors';
import Programs from './pages/admin/Programs';
import Subjects from './pages/admin/Subjects';
import Curriculum from './pages/admin/Curriculum';
import SubjectOfferings from './pages/admin/SubjectOfferings';
import Enrollments from './pages/admin/Enrollments';
import Tuitions from './pages/admin/Tuitions';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import MySubjects from './pages/instructor/MySubjects';
import SubjectDetail from './pages/instructor/SubjectDetail';
import SubjectOverview from './pages/instructor/SubjectOverview';
import SubjectStudents from './pages/instructor/SubjectStudents';
import SubjectQuizzes from './pages/instructor/SubjectQuizzes';
import SubjectAnnouncements from './pages/instructor/SubjectAnnouncements';
import SubjectMaterials from './pages/instructor/SubjectMaterials';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ModernStudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:subjectId/offering/:offeringId" element={<CourseDetail />}>
              <Route index element={<CourseOverview />} />
              <Route path="quizzes" element={<CourseQuizzes />} />
              <Route path="announcements" element={<CourseAnnouncements />} />
              <Route path="materials" element={<CourseMaterials />} />
            </Route>
            <Route path="curriculum" element={<CurriculumView />} />
          </Route>

          {/* Student Information System (SIS) Routes */}
          <Route
            path="/sis"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ModernSISLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/sis/enrollment" replace />} />
            <Route path="enrollment" element={<Enrollment />} />
            <Route path="registration" element={<RegistrationCard />} />
            <Route path="tuition" element={<Tuition />} />
            <Route path="history" element={<AcademicHistory />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ModernAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="students" element={<Students />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="programs" element={<Programs />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="curriculum" element={<Curriculum />} />
            <Route path="subject-offerings" element={<SubjectOfferings />} />
            <Route path="enrollments" element={<Enrollments />} />
            <Route path="tuition" element={<Tuitions />} />
          </Route>

          {/* Instructor Routes */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <ModernInstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InstructorDashboard />} />
            <Route path="subjects" element={<MySubjects />} />
            <Route path="subjects/:subjectId/offering/:offeringId" element={<SubjectDetail />}>
              <Route index element={<SubjectOverview />} />
              <Route path="students" element={<SubjectStudents />} />
              <Route path="quizzes" element={<SubjectQuizzes />} />
              <Route path="announcements" element={<SubjectAnnouncements />} />
              <Route path="materials" element={<SubjectMaterials />} />
            </Route>
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
