import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ClipboardList, 
  FileText, 
  CreditCard, 
  History, 
  LogOut,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ModernSISLayout = () => {
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/sis/enrollment', label: 'Enrollment', icon: ClipboardList },
    { path: '/sis/registration', label: 'Registration Card', icon: FileText },
    { path: '/sis/tuition', label: 'Tuition & Fees', icon: CreditCard },
    { path: '/sis/history', label: 'Academic History', icon: History },
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
            <div>
              <h1 className="text-xl font-semibold text-purple-600">SIS Portal</h1>
              <p className="text-xs text-gray-500">Student Information System</p>
            </div>
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
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Back to Main Portal */}
          <div className="p-4 border-b border-gray-100">
            <Link
              to="/student"
              onClick={() => {
                const isMobile = window.matchMedia('(max-width: 1023px)').matches;
                if (isMobile) setSidebarOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Main Portal</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
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
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
      <button
        onClick={() => setSidebarOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg ${
          sidebarOpen ? 'hidden' : 'block'
        }`}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ModernSISLayout;
