import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    Loader2,
    X,
    Save,
    ChevronDown,
    Check,
    AlertCircle,
    CheckCircle2,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import api from '../services/api';

const AdminUserManagement = () => {
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCogDropdownOpen, setIsCogDropdownOpen] = useState(false);

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        student_id: '',
        student_class: '',
        cognitive_style: 'TAI',
        role: 'student',
        status: 'Active'
    });

    // Alert/Feedback Modal State
    const [statusModal, setStatusModal] = useState({
        show: false,
        type: 'success', // success, error, confirm
        title: '',
        message: '',
        confirmText: '',
        onConfirm: null
    });

    const cognitiveOptions = ['TAI', 'PAR', 'TAR', 'TGI', 'PAI', 'PGR', 'PGI', 'TGR'];

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const roleFilter = activeTab === 'user' ? 'student' : 'admin';
            const response = await api.get('/admin/users/', {
                params: {
                    role: roleFilter,
                    search: searchQuery,
                    page: currentPage
                }
            });
            
            if (Array.isArray(response.data)) {
                setUsers(response.data);
                setTotalUsers(response.data.length);
            } else if (response.data.results) {
                setUsers(response.data.results);
                setTotalUsers(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab, searchQuery, currentPage]);

    const showStatus = (type, title, message, onConfirm = null, confirmText = '') => {
        setStatusModal({
            show: true,
            type,
            title,
            message,
            onConfirm,
            confirmText
        });
    };

    const handleAddClick = () => {
        setIsEditMode(false);
        setSelectedUser(null);
        setUserForm({
            name: '',
            email: '',
            student_id: '',
            student_class: '',
            cognitive_style: 'TAI',
            role: activeTab === 'admin' ? 'admin' : 'student',
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setIsEditMode(true);
        setSelectedUser(user);
        setUserForm({
            name: user.name || '',
            email: user.email || '',
            student_id: user.student_id || '',
            student_class: user.student_class || '',
            cognitive_style: user.cognitive_style || 'TAI',
            role: user.role || 'student',
            status: user.is_active ? 'Active' : 'Inactive'
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (userId) => {
        showStatus(
            'confirm',
            'Delete User?',
            'Are you sure you want to delete this user? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/admin/users/${userId}/`);
                    setStatusModal({ show: false });
                    showStatus('success', 'User Successfully Deleted', 'The selected user has been removed from the system.');
                    fetchUsers();
                } catch (error) {
                    showStatus('error', 'Action Failed', 'Something went wrong. Please try again later.');
                }
            },
            'Delete User'
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...userForm,
                is_active: userForm.status === 'Active'
            };
            if (isEditMode) {
                await api.put(`/admin/users/${selectedUser.id}/`, payload);
                setIsModalOpen(false);
                showStatus('success', 'User Successfully Updated', 'The user information has been updated successfully.');
            } else {
                await api.post('/admin/users/', payload);
                setIsModalOpen(false);
                showStatus('success', 'User Successfully Added', 'The new user has been added successfully.');
            }
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            const title = isEditMode ? 'Failed to Update User' : 'Failed to Add User';
            const msg = error.response?.data ? Object.values(error.response.data)[0] : 'The changes could not be saved. Please try again.';
            showStatus('error', title, Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const getCognitiveColor = (style) => {
        const colors = {
            'TAI': 'bg-[#E3F9F1] text-[#2DCA8C] border-[#B2F0DA]',
            'PAR': 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]',
            'TAR': 'bg-[#F3E5F5] text-[#9C27B0] border-[#E1BEE7]',
            'TGI': 'bg-[#FFFDE7] text-[#FBC02D] border-[#FFF9C4]',
            'PAI': 'bg-[#FFF3E0] text-[#FB8C00] border-[#FFE0B2]',
            'PGR': 'bg-[#E0F2F1] text-[#009688] border-[#B2DFDB]',
        };
        return colors[style ? style.toUpperCase() : ''] || 'bg-gray-50 text-gray-400 border-gray-100';
    };

    return (
        <div className="flex flex-col gap-8 pb-12 font-['Outfit'] animate-in fade-in duration-500">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-gray-800">User Manager</h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-[#F1F3F9] w-fit p-1 rounded-[1.2rem] border border-gray-100 shadow-sm">
                <button 
                    onClick={() => { setActiveTab('user'); setCurrentPage(1); }}
                    className={`px-10 py-2 rounded-[1rem] text-sm font-bold transition-all duration-200 ${
                        activeTab === 'user' 
                        ? 'bg-white text-orange-500 shadow-md ring-1 ring-black/5' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    User
                </button>
                <button 
                    onClick={() => { setActiveTab('admin'); setCurrentPage(1); }}
                    className={`px-10 py-2 rounded-[1rem] text-sm font-bold transition-all duration-200 ${
                        activeTab === 'admin' 
                        ? 'bg-white text-orange-500 shadow-md ring-1 ring-black/5' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Admin
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                {/* Search & Actions Area */}
                <div className="p-8 pb-4 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors group-focus-within:text-blue-600 z-10">
                            <Search className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-400 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#3B1EB1] hover:bg-[#2F188E] text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-[#3B1EB1]/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>

                {/* Table Content */}
                <div className="flex-1 px-8">
                    <div className="w-full overflow-x-auto overflow-y-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F2F2F2] rounded-t-2xl overflow-hidden">
                                    <th className="px-6 py-5 first:rounded-tl-2xl text-[11px] font-black text-gray-900 uppercase tracking-widest text-center">NIM</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-gray-900 uppercase tracking-widest">NAME</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-gray-900 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-gray-900 uppercase tracking-widest text-center">Kelas</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-gray-900 uppercase tracking-widest text-center">Cognitive Style</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-gray-900 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 last:rounded-tr-2xl text-[11px] font-black text-gray-900 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center text-sm font-bold text-gray-400">Loading users...</td>
                                    </tr>
                                ) : users.map((user, i) => (
                                    <tr key={user.id || i} className={`group hover:bg-gray-50/50 relative transition-colors ${i !== users.length - 1 ? 'after:absolute after:bottom-0 after:left-8 after:right-8 after:border-b after:border-gray-200 after:content-[""]' : ''}`}>
                                        <td className="px-6 py-6 text-center text-sm font-medium text-gray-600 tabular-nums z-10">{user.student_id || '-'}</td>
                                        <td className="px-6 py-6 text-sm font-bold text-gray-800 z-10">{user.name}</td>
                                        <td className="px-6 py-6 text-sm font-medium text-gray-600 z-10">{user.email}</td>
                                        <td className="px-6 py-6 text-center text-sm font-medium text-gray-600 z-10">{user.student_class || '-'}</td>
                                        <td className="px-6 py-6 text-center z-10">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black border tracking-widest shadow-sm ${getCognitiveColor(user.cognitive_style)}`}>
                                                    {user.cognitive_style || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center z-10">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold border shadow-sm ${
                                                    user.is_active 
                                                    ? 'bg-[#E3F9F1] text-[#2DCA8C] border-[#B2F0DA]' 
                                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                                }`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 z-10">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleEditClick(user)} className="p-2.5 bg-white border border-blue-200 text-[#3B1EB1] hover:bg-blue-50 rounded-xl transition-all shadow-sm active:scale-90"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteClick(user.id)} className="p-2.5 bg-[#FF4D4D] text-white hover:bg-[#E64444] rounded-xl transition-all shadow-md active:scale-90"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-white border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total users: {totalUsers}</p>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft className="w-4 h-4" /> Prev</button>
                        <div className="flex items-center gap-1">
                            {[1].map(num => <button key={num} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-[#3B1EB1] text-white shadow-lg">1</button>)}
                        </div>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Next <ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* User Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        {/* Modal Header */}
                        <div className="px-10 pt-10 pb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'User Edit' : 'Add New User'}</h2>
                                <p className="text-sm text-gray-400 mt-1">Update user informatioan & status</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSave} className="px-10 pb-10">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-900 uppercase">NIM</label>
                                    <input type="text" value={userForm.student_id} onChange={(e) => setUserForm({...userForm, student_id: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all" placeholder="G6401221042" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-900 uppercase">NAME</label>
                                    <input required type="text" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all" placeholder="Rio Alvein Hasana" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-900 uppercase">EMAIL</label>
                                    <input required type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all" placeholder="alvrio12@gmail.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-900 uppercase">CLASS</label>
                                    <input type="text" value={userForm.student_class} onChange={(e) => setUserForm({...userForm, student_class: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all" placeholder="ST 25" />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-[13px] font-bold text-gray-900 uppercase">COGNITIVE STYLE</label>
                                    <div onClick={() => setIsCogDropdownOpen(!isCogDropdownOpen)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-all h-[46px]">
                                        <span>{userForm.cognitive_style}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isCogDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isCogDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 z-[110] bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-[200px] overflow-y-auto">
                                            {cognitiveOptions.map(opt => (
                                                <div key={opt} onClick={() => { setUserForm({...userForm, cognitive_style: opt}); setIsCogDropdownOpen(false); }} className={`px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer ${userForm.cognitive_style === opt ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}>{opt}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-gray-900 uppercase">STATUS</label>
                                    <div className="flex items-center gap-6 pt-2">
                                        {[
                                            { id: 'Active', label: 'Active', color: 'bg-emerald-500' },
                                            { id: 'Inactive', label: 'Inactive', color: 'bg-gray-200' }
                                        ].map((stat) => (
                                            <div 
                                                key={stat.id} 
                                                onClick={() => {
                                                    if (userForm.status !== stat.id) {
                                                        showStatus(
                                                            'confirm',
                                                            'Change User Status?',
                                                            'Are you sure you want to change this user\'s status?',
                                                            () => {
                                                                setUserForm({...userForm, status: stat.id});
                                                                setStatusModal({ show: false });
                                                            },
                                                            'Confirm'
                                                        );
                                                    }
                                                }} 
                                                className="flex items-center gap-2 cursor-pointer group"
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${userForm.status === stat.id ? 'border-emerald-500' : 'border-gray-200'}`}>
                                                    {userForm.status === stat.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                                </div>
                                                <span className={`text-[13px] font-medium ${userForm.status === stat.id ? 'text-gray-900' : 'text-gray-400'}`}>{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-12">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-[#0061FF] hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"><Save className="w-4 h-4" /> Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Modal (Success, Error, Confirm) */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-300">
                        {/* Close Button UI */}
                        <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="absolute top-6 right-6 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-4 h-4 text-gray-300" />
                        </button>

                        {/* Icon */}
                        <div className="mb-6">
                            {statusModal.type === 'success' && (
                                <div className="w-16 h-16 bg-[#E3F9F1] text-[#2DCA8C] rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                            )}
                            {statusModal.type === 'error' && (
                                <div className="w-16 h-16 bg-[#FFF1F1] text-[#FF4D4D] rounded-full flex items-center justify-center">
                                    <XCircle className="w-10 h-10" />
                                </div>
                            )}
                            {statusModal.type === 'confirm' && (
                                <div className="w-16 h-16 bg-[#FFF9E6] text-[#FFB000] rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-10 h-10" />
                                </div>
                            )}
                        </div>

                        {/* Title & Message */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{statusModal.title}</h3>
                        <p className="text-[13px] text-gray-400 font-medium leading-relaxed mb-8">
                            {statusModal.message}
                        </p>

                        {/* Buttons */}
                        {statusModal.type === 'confirm' ? (
                            <div className="flex w-full gap-3">
                                <button 
                                    onClick={() => setStatusModal({ ...statusModal, show: false })}
                                    className="flex-1 py-3 bg-[#D9D9D9] hover:bg-gray-300 text-white text-sm font-bold rounded-full transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={statusModal.onConfirm}
                                    className="flex-1 py-3 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-full transition-all"
                                >
                                    {statusModal.confirmText}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setStatusModal({ ...statusModal, show: false })}
                                className="w-full py-3 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-full transition-all"
                            >
                                {statusModal.type === 'success' ? 'Back to User List' : 'Try Again'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
