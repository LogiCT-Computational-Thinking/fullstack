import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Loader2, Edit2, Trash2, PlusCircle, 
    CheckCircle2, AlertCircle, Shield, X, MoreVertical, Settings 
} from 'lucide-react';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// --- Modal Component ---
function UserModal({ user, onClose, onSuccess }) {
    const isEdit = !!user;
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'student',
        student_class: user?.student_class || '',
        student_id: user?.student_id || '' // NIM
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (isEdit) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Don't send empty password
                await api.put(`/admin/users/${user.id}/`, payload);
            } else {
                if (!formData.password) {
                    setError("Password is required for new users");
                    setSaving(false);
                    return;
                }
                await api.post(`/admin/users/`, formData);
            }
            onSuccess(isEdit ? "User updated successfully!" : "User created successfully!");
        } catch (err) {
            const data = err.response?.data;
            if (data?.detail) {
                setError(data.detail);
            } else if (data && typeof data === 'object') {
                setError(Object.values(data).map(v => Array.isArray(v) ? v.join(' ') : v).join(' | '));
            } else {
                setError('Failed to save user.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'scaleIn 0.2s ease-out' }}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="font-bold text-gray-900">{isEdit ? 'Edit User' : 'Add New User'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Manage user credentials and roles</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/60 text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-600">Full Name *</label>
                            <input required name="name" value={formData.name} onChange={handleChange}
                                placeholder="John Doe"
                                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-600">Email *</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange}
                                placeholder="john@example.com"
                                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-600">Password {isEdit && '(Leave blank to keep)'}</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                placeholder={isEdit ? "••••••••" : "Enter password"}
                                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-600">Role *</label>
                            <select name="role" value={formData.role} onChange={handleChange}
                                className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {(formData.role === 'student' || formData.role === 'teacher') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Student ID / NIP</label>
                                <input name="student_id" value={formData.student_id} onChange={handleChange}
                                    placeholder="e.g. 19102..."
                                    className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-600">Class</label>
                                <input name="student_class" value={formData.student_class} onChange={handleChange}
                                    placeholder="e.g. SS-01"
                                    className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                            {isEdit ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
                <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
            </div>
        </div>
    );
}

function SaveIcon({ className }) {
    return <CheckCircle2 className={className} />;
}


// --- Main Page Component ---
export default function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    
    // Modals & Action States
    const [userModal, setUserModal] = useState({ open: false, data: null });
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/users/');
            setUsers(res.data);
        } catch (err) {
            showToast('error', 'Gagal memuat data pengguna.');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Hapus pengguna "${name}"? Tindakan ini tidak bisa dikembalikan.`)) return;
        setDeletingId(id);
        try {
            await api.delete(`/admin/users/${id}/`);
            showToast('success', `Pengguna ${name} berhasil dihapus.`);
            fetchUsers();
        } catch (err) {
            showToast('error', 'Gagal menghapus pengguna.');
        } finally {
            setDeletingId(null);
        }
    };

    // Filter Logic
    let filteredUsers = users;
    if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
    }
    if (search) {
        const query = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
            (u.name && u.name.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.student_id && u.student_id.toLowerCase().includes(query))
        );
    }

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        admins: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="max-w-7xl mx-auto font-['Outfit']">
            {toast && (
                <div className={`fixed top-6 right-6 z-[500] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-top-4
                    ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        User Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data mahasiswa, guru, dan admin (TailAdmin Theme)</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchUsers} 
                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Loader2 className="w-4 h-4" /> Refresh
                    </button>
                    <button 
                        onClick={() => setUserModal({ open: true, data: null })}
                        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Tambah User
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Students', value: stats.students, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Teachers', value: stats.teachers, icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Admins', value: stats.admins, icon: Settings, color: 'text-orange-600 bg-orange-50' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-800">{s.value}</h4>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{s.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table Controls (Search & Filter) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center w-full sm:w-auto">
                    {[['all', 'Semua'], ['student', 'Student'], ['teacher', 'Teacher'], ['admin', 'Admin']].map(([val, label]) => (
                        <button key={val} onClick={() => setRoleFilter(val)}
                            className={`px-4 py-2 text-xs font-bold transition-all rounded-lg ${
                                roleFilter === val 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama, email, nim..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none transition-all" 
                    />
                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold tracking-wider text-gray-500 uppercase">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status & Details</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                                        <p className="text-sm font-semibold">Memuat data...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                        <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-semibold">Tidak ada pengguna ditemukan.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                        {/* User Name & Avatar */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border border-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {u.profilePicture ? (
                                                        <img src={u.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-black text-blue-600 uppercase">
                                                            {u.name ? u.name.charAt(0) : '?'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                                        ID: {u.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-700">{u.email}</p>
                                            {u.student_id && <p className="text-[11px] text-gray-500 uppercase mt-0.5">NIM: {u.student_id}</p>}
                                        </td>
                                        {/* Role Badge */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                                                ${u.role === 'admin' ? 'bg-orange-100 text-orange-700' : 
                                                  u.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : 
                                                  'bg-blue-100 text-blue-700'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        {/* Status & Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {u.student_class && (
                                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded w-max">
                                                        Class: {u.student_class}
                                                    </span>
                                                )}
                                                {!u.student_class && <span className="text-xs text-gray-400">-</span>}
                                            </div>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setUserModal({ open: true, data: u })}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 shadow-sm transition-all"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(u.id, u.name)}
                                                    disabled={deletingId === u.id}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-sm transition-all disabled:opacity-50"
                                                    title="Delete User"
                                                >
                                                    {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Injection */}
            {userModal.open && (
                <UserModal 
                    user={userModal.data} 
                    onClose={() => setUserModal({ open: false, data: null })}
                    onSuccess={(msg) => {
                        setUserModal({ open: false, data: null });
                        showToast('success', msg);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}
