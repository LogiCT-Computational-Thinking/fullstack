import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, BookOpen, FileQuestion, Settings as SettingsIcon, Search, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Quiz from './pages/Quiz'
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import ProfilingQuiz from './pages/ProfilingQuiz'
import QuizBank from './pages/QuizBank'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import LandingPage from './pages/LandingPage'


function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', title: 'Dashboard' },
    { id: 'profiling', label: 'Profiling Quiz', icon: ClipboardList, path: '/dashboard/profiling-quiz', title: 'Profiling Quiz' },
    { id: 'modules', label: 'Modules', icon: BookOpen, path: '/dashboard/modules', title: 'Modules' },
    { id: 'quiz-bank', label: 'Quiz Bank', icon: FileQuestion, path: '/dashboard/quiz-bank', title: 'Quiz Bank' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/dashboard/settings', title: 'Settings' }
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');

  };

  // Get current page title
  const currentPage = menuItems.find(item => item.path === location.pathname) || menuItems[0];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-logict.png"
              alt="LogiCT"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">LogiCT</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-150 active:scale-95 ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{currentPage.title}</h2>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-64 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notification Icon */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 active:scale-90">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>

              {/* User Profile with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-150 active:scale-90"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 active:bg-red-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profiling-quiz" element={<ProfilingQuiz />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/quiz-bank" element={<QuizBank />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/quiz" element={<Quiz />} />

        {/* Dashboard Routes - With Layout */}
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </Router>
  )
}

export default App
