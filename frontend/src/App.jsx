import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, BookOpen, FileQuestion, Settings as SettingsIcon, Search, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import Register from './pages/Register'
import Quiz from './pages/Quiz'
import QuizIntro from './pages/QuizIntro'
import QuizResult from './pages/QuizResult'
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import ProfilingQuiz from './pages/ProfilingQuiz'
import Exercise from './pages/Exercise'
import QuestionBank from './pages/QuestionBank'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import LandingPage from './pages/LandingPage'
import ProfilingResult from './pages/ProfilingResult'
import MaterialViewer from './pages/MaterialViewer'

import AdminLayout from './components/AdminLayout'

// Guard: hanya teacher/admin yang bisa akses /admin/*
function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // tunggu auth selesai load
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'teacher' && user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}


function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'modules', label: 'Material', icon: BookOpen, path: '/dashboard/modules' },
    { id: 'exercise', label: 'Exercise', icon: FileQuestion, path: '/exercise' },
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-[100] h-20 shadow-sm">
        <div className="w-full h-full px-8 flex items-center justify-start">
          {/* Left: Logo and Nav Items */}
          <div className="flex items-center gap-20 h-full">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 h-full shrink-0 group transition-transform active:scale-95">
              <div className="w-11 h-11 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                <img
                  src="/images/logo-logict.png"
                  alt="LogiCT"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Outfit']">LogiCT</h1>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 h-full self-stretch">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.id === 'modules' && (
                    location.pathname.startsWith('/dashboard/quiz/') ||
                    location.pathname.startsWith('/dashboard/modules')
                  ));

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`relative flex items-center gap-2 h-full transition-all duration-200 active:scale-95 ${isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-900 font-medium'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-900'}`} />
                    <span>{item.label}</span>

                    {/* Active Underline at the bottom of the header */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Search, Notifications, Profile */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Search Bar */}
            <div className="hidden md:block relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="pl-11 pr-5 py-2.5 w-72 bg-gray-100/70 border-2 border-transparent rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
              />
            </div>

            {/* Notification Icon */}
            <button className="p-2.5 bg-gray-100/50 hover:bg-gray-100 rounded-2xl transition-all group relative border border-transparent hover:border-gray-200">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 p-1 pl-4 pr-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
              >
                <span className="hidden sm:block text-sm font-bold text-gray-700 font-['Outfit'] group-hover:text-blue-600">{user?.name || 'User LogiCT'}</span>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-blue-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={user?.profilePicture || (user?.gender === 'Female' ? "/images/default-avatar-female.png" : "/images/default-avatar.png")}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = user?.gender === 'Female' ? "/images/default-avatar-female.png" : "/images/default-avatar.png"; }}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                    <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                  </div>

                  <div className="p-2">
                    <Link
                      to="/dashboard/profile-display"
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-3 mb-1"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile Display
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-3"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  <div className="h-px bg-gray-100 my-1 mx-3"></div>

                  <div className="p-2 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all flex items-center gap-3"
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

      {/* Main Content */}
      <main className={`flex-1 w-full ${['/exercise', '/dashboard/settings'].includes(location.pathname) ? 'px-0 pt-0' : 'px-24 pt-8'}`}>
        <Outlet />
      </main>
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
        <Route path="/quiz/:courseId" element={<Quiz />} />
        <Route path="/profiling-quiz" element={<ProfilingQuiz />} />

        {/* Main Routes - With Top Navigation Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/modules" element={<Modules />} />
          <Route path="/dashboard/quiz/:courseId" element={<QuizIntro />} />
          <Route path="/dashboard/quiz/:courseId/result" element={<QuizResult />} />
          <Route path="/dashboard/profile-display" element={<ProfilingResult />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>

        {/* Exercise - Full page with sidebar as per design */}
        <Route path="/exercise" element={<Exercise />} />

        {/* Material Viewer - Full page, no sidebar */}
        <Route path="/dashboard/material" element={<MaterialViewer />} />

        {/* Admin Routes - With Dedicated Layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        } />

      </Routes>
    </Router>
  )
}

export default App
