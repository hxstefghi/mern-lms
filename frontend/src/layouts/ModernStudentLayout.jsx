import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  BookOpen,
  BookMarked,
  GraduationCap, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ModernStudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const syncSidebarToViewport = (eventOrQuery) => {
      const matches = 'matches' in eventOrQuery ? eventOrQuery.matches : mediaQuery.matches;
      setSidebarOpen(matches);
    };

    syncSidebarToViewport(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncSidebarToViewport);
      return () => mediaQuery.removeEventListener('change', syncSidebarToViewport);
    }

    mediaQuery.addListener(syncSidebarToViewport);
    return () => mediaQuery.removeListener(syncSidebarToViewport);
  }, []);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop) return;

    if (sidebarOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [sidebarOpen]);

  const currentPath = location.pathname.replace(/\/+$/, '');
  const isNavItemActive = (itemPath) => {
    const normalizedItemPath = itemPath.replace(/\/+$/, '');
    if (normalizedItemPath === '/student') return currentPath === '/student';
    return currentPath === normalizedItemPath || currentPath.startsWith(`${normalizedItemPath}/`);
  };

  // Check if we're in CourseDetail page (has its own navigation)
  const isInCourseDetail = /^\/student\/courses\/[^/]+\/offering\/[^/]+/.test(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Portal',
      items: [
        { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/student/courses', label: 'My Courses', icon: BookOpen },
        { path: '/student/curriculum', label: 'Program Curriculum', icon: BookMarked },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">EduPortal</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-5">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isNavItemActive(item.path);

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            const isMobile = window.matchMedia('(max-width: 1023px)').matches;
                            if (isMobile) setSidebarOpen(false);
                          }}
                          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-5 border-t border-gray-100">
                <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  SIS
                </div>
                <Link
                  to="/sis/enrollment"
                  onClick={() => {
                    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-purple-50 text-purple-600 hover:bg-purple-100"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student Information System</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      {!isInCourseDetail && (
        <button
          onClick={() => setSidebarOpen(true)}
          className={`lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg ${
            sidebarOpen ? 'hidden' : 'block'
          }`}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className={`p-4 sm:p-6 lg:p-8 ${isInCourseDetail ? 'pt-4 sm:pt-6 lg:pt-8' : 'pt-16 sm:pt-16 lg:pt-8'}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ModernStudentLayout;
