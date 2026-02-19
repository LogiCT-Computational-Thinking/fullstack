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
import ProfilingResult from './pages/ProfilingResult'


function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', title: 'Dashboard', inSidebar: true },
    { id: 'modules', label: 'Material', icon: BookOpen, path: '/dashboard/modules', title: 'Material', inSidebar: true },
    { id: 'quiz-bank', label: 'Exercise', icon: FileQuestion, path: '/dashboard/quiz-bank', title: 'Exercise', inSidebar: true },
    { id: 'profile-display', label: 'Profile', icon: User, path: '/dashboard/profile-display', title: 'My CT Profile', inSidebar: false },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/dashboard/settings', title: 'Settings', inSidebar: false }
  ];

  const sidebarItems = allNavItems.filter(item => item.inSidebar);

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
  const currentPage = allNavItems.find(item => item.path === location.pathname) || allNavItems[0];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200 z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-logict.png"
              alt="LogiCT"
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-xl font-bold text-gray-900 font-['Outfit']">LogiCT</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {sidebarItems.map((item) => {
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
                  placeholder="What do you want to learn?"
                  className="pl-10 pr-4 py-2 w-72 bg-gray-100/50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>

              {/* Notification Icon */}
              <button className="p-2.5 bg-gray-100/50 hover:bg-gray-100 rounded-2xl transition-all duration-150 active:scale-90 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* User Profile with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 p-1 pl-3 pr-1 rounded-full hover:bg-gray-50 transition-all"
                >
                  <span className="text-sm font-bold text-gray-700 font-['Outfit']">{user?.name || 'User LogiCT'}</span>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 bg-blue-50 flex items-center justify-center">
                    <img
                      src="/images/chatbot.png"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "/images/welkam_atas.png"; }}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/dashboard/profile-display"
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-150 flex items-center gap-3 mb-1"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile Display
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-150 flex items-center gap-3"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>

                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                    {/* Logout Button */}
                    <div className="p-2 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors duration-150 active:bg-red-100 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
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
            <Route path="/modules" element={<Modules />} />
            <Route path="/quiz-bank" element={<QuizBank />} />
            <Route path="/profile-display" element={<ProfilingResult />} />
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
        <Route path="/profiling-quiz" element={<ProfilingQuiz />} />

        {/* Dashboard Routes - With Layout */}
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </Router>
  )
}

export default App
