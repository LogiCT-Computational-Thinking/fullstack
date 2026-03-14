import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom'
import { ClipboardList, LogOut, Bell, User, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import QuestionBank from '../pages/QuestionBank'
import AdminMaterials from '../pages/AdminMaterials'
import AdminUserManagement from '../pages/AdminUserManagement'

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Role check sudah dihandle oleh AdminGuard di App.jsx

    const allNavItems = [
        { id: 'admin-qbank', label: 'Question Bank', icon: ClipboardList, path: '/admin/qbank', title: 'Question Bank' },
        { id: 'admin-materials', label: 'Course Manager', icon: BookOpen, path: '/admin/materials', title: 'Course Manager' },
        ...(user?.role === 'admin'
            ? [{ id: 'admin-users', label: 'User Management', icon: User, path: '/admin/users', title: 'User Management' }]
            : []
        ),
    ];

    const sidebarItems = allNavItems; // All items are now implicitly sidebar items

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

    const currentPage = allNavItems.find(item => item.path === location.pathname) || allNavItems[0];

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* ── Sidebar (sama persis dengan student sidebar) ── */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200 z-20">

                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo-logict.png"
                            alt="LogiCT"
                            className="w-10 h-10 rounded-lg"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 font-['Outfit'] leading-none">LogiCT</h1>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-500">Admin Portal</span>
                        </div>
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-150 active:scale-95
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
                                    ${item.id === 'back-dashboard' ? 'mt-8 border border-gray-200' : ''}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 ml-64">

                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">{currentPage.title}</h2>

                        <div className="flex items-center gap-4">
                            {/* Notification */}
                            <button className="p-2.5 bg-gray-100/50 hover:bg-gray-100 rounded-2xl transition-all duration-150 active:scale-90 relative">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center gap-3 p-1 pl-3 pr-1 rounded-full hover:bg-gray-50 transition-all"
                                >
                                    <span className="text-sm font-bold text-gray-700 font-['Outfit']">
                                        {user?.name || 'Admin'}
                                    </span>
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 bg-blue-50 flex items-center justify-center">
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

                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                {user?.role}
                                            </span>
                                        </div>

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
                        {user?.role === 'admin' && (
                            <Route path="/users" element={<AdminUserManagement />} />
                        )}
                    </Routes>
                </main>
            </div>
        </div>
    );
}
