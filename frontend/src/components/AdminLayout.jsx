import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom'
import { ClipboardList, LogOut, Bell, User, BookOpen, Search, Settings as SettingsIcon, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import QuestionBank from '../pages/QuestionBank'
import AdminMaterials from '../pages/AdminMaterials'
import AdminUserManagement from '../pages/AdminUserManagement'
import AdminDashboard from '../pages/AdminDashboard'

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const navItems = [
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { id: 'admin-qbank', label: 'Question Bank', icon: ClipboardList, path: '/admin/qbank' },
        { id: 'admin-materials', label: 'Course Manager', icon: BookOpen, path: '/admin/materials' },
        { id: 'admin-users', label: 'User Manager', icon: User, path: '/admin/users' },
    ];

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header - Matching DashboardLayout in App.jsx */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-[100] h-20 shadow-sm">
                <div className="w-full h-full px-8 flex items-center justify-start">
                    {/* Left: Logo and Nav Items */}
                    <div className="flex items-center gap-20 h-full">
                        {/* Logo */}
                        <Link to="/admin/qbank" className="flex items-center gap-3 h-full shrink-0 group transition-transform active:scale-95">
                            <div className="w-11 h-11 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                                <img
                                    src="/images/logo-logict.png"
                                    alt="LogiCT"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold text-gray-900 font-['Outfit'] leading-none">LogiCT</h1>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mt-0.5">Admin Portal</span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-8 h-full self-stretch">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname.startsWith(item.path);

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
                                placeholder="Search everything..."
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
                                <div className="flex flex-col items-end">
                                    <span className="hidden sm:block text-sm font-bold text-gray-700 font-['Outfit'] group-hover:text-blue-600 leading-none">{user?.name || 'Admin'}</span>
                                    <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 mt-1">{user?.role}</span>
                                </div>
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-blue-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showUserDropdown && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                                        <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                                    </div>

                                    <div className="p-2">
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

            {/* Main Content Area */}
            <main className="flex-1 w-full px-24 pt-8">
                <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/qbank" element={<QuestionBank />} />
                    <Route path="/materials" element={<AdminMaterials />} />
                    <Route path="/users" element={<AdminUserManagement />} />
                </Routes>
            </main>
        </div>
    );
}
