import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { subjectsAPI, enrollmentsAPI } from '../../api';
import { 
  ArrowLeft, 
  BookOpen,
  FileText,
  Megaphone,
  Menu,
  X,
  Users,
  ClipboardList
} from 'lucide-react';

const SubjectDetail = () => {
  const { subjectId, offeringId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [subject, setSubject] = useState(null);
  const [offering, setOffering] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchSubjectDetails = useCallback(async () => {
    try {
      const response = await subjectsAPI.getSubjectById(subjectId);
      const subjectData = response.data.subject || response.data;
      setSubject(subjectData);
      
      console.log('=== SUBJECT DEBUG ===');
      console.log('Subject data:', subjectData);
      console.log('Offerings:', subjectData.offerings);
      console.log('Looking for offering ID:', offeringId);
      
      const currentOffering = subjectData.offerings?.find(o => {
        console.log('Comparing:', o._id, 'with', offeringId);
        return o._id === offeringId;
      });
      
      console.log('Found offering:', currentOffering);
      console.log('=== END SUBJECT DEBUG ===');
      
      setOffering(currentOffering);
      
      if (!currentOffering && subjectData.offerings?.length > 0) {
        setOffering(subjectData.offerings[0]);
      }
    } catch (error) {
      console.error('Error fetching subject:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectId, offeringId]);

  const fetchEnrolledStudents = useCallback(async () => {
    try {
      const response = await enrollmentsAPI.getEnrollments({ limit: 1000 });
      const allEnrollments = response.data.enrollments || response.data;
      
      console.log('=== ENROLLMENT DEBUG ===');
      console.log('Current offeringId from URL:', offeringId);
      console.log('Total enrollments fetched:', allEnrollments.length);
      
      // Log first enrollment structure
      if (allEnrollments.length > 0) {
        console.log('First enrollment sample:', JSON.stringify(allEnrollments[0], null, 2));
      }
      
      const relevantEnrollments = allEnrollments.filter(enrollment => {
        // Only include approved enrollments
        if (enrollment.status !== 'Approved') {
          return false;
        }
        
        // Check if any subject in this enrollment matches the offering
        const hasMatchingOffering = enrollment.subjects?.some(subj => {
          // Get the offering ID - it could be nested or a string
          let subjOfferingId = null;
          
          if (typeof subj.offering === 'object' && subj.offering !== null) {
            subjOfferingId = subj.offering._id || subj.offering.id;
          } else {
            subjOfferingId = subj.offering;
          }
          
          const matches = String(subjOfferingId) === String(offeringId);
          
          if (matches) {
            console.log('✓ Match found:', {
              enrollmentId: enrollment._id,
              studentNumber: enrollment.student?.studentNumber,
              studentName: `${enrollment.student?.user?.firstName} ${enrollment.student?.user?.lastName}`,
              subjectCode: subj.subject?.code,
              offeringId: subjOfferingId
            });
          }
          
          return matches;
        });
        
        return hasMatchingOffering;
      });
      
      console.log('Filtered enrollments count:', relevantEnrollments.length);
      console.log('Filtered enrollments:', relevantEnrollments);
      console.log('=== END DEBUG ===');
      
      setEnrolledStudents(relevantEnrollments);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  }, [offeringId]);

  useEffect(() => {
    fetchSubjectDetails();
    fetchEnrolledStudents();
  }, [fetchSubjectDetails, fetchEnrolledStudents]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Subject Not Found</h3>
        <button
          onClick={() => navigate('/instructor/subjects')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to My Subjects
        </button>
      </div>
    );
  }

  const navigationItems = [
    { 
      path: `/instructor/subjects/${subjectId}/offering/${offeringId}`, 
      label: 'Overview', 
      icon: BookOpen,
      exact: true 
    },
    { 
      path: `/instructor/subjects/${subjectId}/offering/${offeringId}/students`, 
      label: 'Students', 
      icon: Users 
    },
    { 
      path: `/instructor/subjects/${subjectId}/offering/${offeringId}/quizzes`, 
      label: 'Quizzes', 
      icon: ClipboardList 
    },
    { 
      path: `/instructor/subjects/${subjectId}/offering/${offeringId}/announcements`, 
      label: 'Announcements', 
      icon: Megaphone 
    },
    { 
      path: `/instructor/subjects/${subjectId}/offering/${offeringId}/materials`, 
      label: 'Materials', 
      icon: FileText 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/instructor/subjects')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen lg:h-auto
            w-72 bg-white border-r border-gray-200
            transition-transform duration-300 ease-in-out z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="h-full overflow-y-auto">
            {/* Subject Header */}
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={() => navigate('/instructor/subjects')}
                className="hidden lg:flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to My Subjects
              </button>
              
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-indigo-600 mb-1">
                    {subject.code}
                  </div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {subject.name}
                  </h2>
                </div>
              </div>

              {offering && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                  <div>{offering.schoolYear} - {offering.semester}</div>
                  <div className="text-xs">
                    {enrolledStudents.length} / {offering.capacity} students
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      className={({ isActive: navIsActive }) => {
                        const active = item.exact 
                          ? navIsActive && location.pathname === item.path 
                          : navIsActive;
                        return `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                          active
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`;
                      }}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet context={{ subject, offering, enrolledStudents }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubjectDetail;
