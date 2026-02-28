import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, LogOut, Bell, User, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import QuestionBank from '../pages/QuestionBank'
import AdminMaterials from '../pages/AdminMaterials'

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Jika bukan teacher, arahkan kembali ke dashboard
    useEffect(() => {
        if (user && user.role !== 'teacher' && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const allNavItems = [
        { id: 'admin-qbank', label: 'Question Bank', icon: ClipboardList, path: '/admin/qbank', title: 'Question Bank', inSidebar: true },
        { id: 'admin-materials', label: 'Study Materials', icon: BookOpen, path: '/admin/materials', title: 'Study Materials', inSidebar: true },
        { id: 'back-dashboard', label: 'Back to Dashboard', icon: LayoutDashboard, path: '/dashboard', title: 'Dashboard', inSidebar: true },
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-sm border-r border-slate-800 z-20">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white tracking-widest text-xs">
                            ADMIN
                        </div>
                        <h1 className="text-xl font-bold text-white font-['Outfit']">LogiCT Portal</h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.includes(item.path) && item.id !== 'back-dashboard';

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-150 active:scale-95 ${isActive
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    } ${item.id === 'back-dashboard' ? 'mt-8 border border-slate-700' : ''}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-64">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">{currentPage.title}</h2>

                        <div className="flex items-center gap-4">
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
                                    <span className="text-sm font-bold text-gray-700 font-['Outfit']">{user?.name || 'Admin'}</span>
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 bg-red-50 flex items-center justify-center">
                                        <User className="w-5 h-5 text-red-600" />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</p>
                                            <span className="text-[10px] font-black tracking-widest uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1 inline-block">Role: {user?.role}</span>
                                        </div>

                                        {/* Logout Button */}
                                        <div className="p-2">
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
                        <Route path="/qbank" element={<QuestionBank />} />
                        <Route path="/materials" element={<AdminMaterials />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
