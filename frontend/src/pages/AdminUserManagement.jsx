import React, { useState } from 'react';
import { Users, Search, PlusCircle, Filter, Download, MoreHorizontal, Mail, Shield, UserCheck, Trash2, Edit2 } from 'lucide-react';

const AdminUserManagement = () => {
    // Mock user data
    const [users, setUsers] = useState([
        { id: 'ST-28', name: 'Rusydi Balfas', email: 'rusydi@example.com', role: 'Student', class: 'SS-01', status: 'Active' },
        { id: 'ST-29', name: 'Zaky Ghoetty', email: 'zaky@example.com', role: 'Student', class: 'SS-02', status: 'Active' },
        { id: 'ST-25', name: 'Fadhil Mumtaz', email: 'fadhil@example.com', role: 'Student', class: 'SS-01', status: 'Inactive' },
        { id: 'ST-26', name: 'Rio Alvein', email: 'rio@example.com', role: 'Student', class: 'SS-03', status: 'Active' },
        { id: 'ST-28', name: 'Agal Lulanika', email: 'agal@example.com', role: 'Teacher', class: '-', status: 'Active' },
        { id: 'ST-27', name: 'Raihan Zhafran', email: 'raihan@example.com', role: 'Admin', class: '-', status: 'Active' },
    ]);

    return (
        <div className="flex flex-col gap-8 pb-12 font-['Outfit']">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Manager</h1>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-black text-[10px]">Manage students, teachers, and admins</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold transition-all active:scale-95">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <PlusCircle className="w-4 h-4" /> Add New User
                    </button>
                </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-blue-100 transition-all group">
                    <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                    <input 
                        type="text" 
                        placeholder="Search name, ID, or email..." 
                        className="bg-transparent text-sm font-medium outline-none w-64 text-gray-700 placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 hover:border-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all active:scale-95">
                        <Filter className="w-3.5 h-3.5" /> All Roles
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 hover:border-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all active:scale-95">
                        <Filter className="w-3.5 h-3.5" /> All Status
                    </button>
                </div>
            </div>

            {/* User Table (Simplified placeholder design) */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Class</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user, i) => (
                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-black text-sm uppercase ring-2 ring-white shadow-sm ring-inset">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">{user.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.id} · {user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        {user.role === 'Admin' ? (
                                            <Shield className="w-3.5 h-3.5 text-orange-500" />
                                        ) : user.role === 'Teacher' ? (
                                            <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                                        )}
                                        <span className={`text-[11px] font-black uppercase tracking-tighter
                                            ${user.role === 'Admin' ? 'text-orange-600' : 
                                              user.role === 'Teacher' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="text-xs font-black text-gray-500 tabular-nums">{user.class}</span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                        ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-600 transition-colors shadow-sm border border-transparent hover:border-blue-100">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-600 transition-colors shadow-sm border border-transparent hover:border-red-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 transition-colors shadow-sm border border-transparent">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing 6 users of 1,280 total</p>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase hover:text-gray-900 transition-colors">Prev</button>
                        <button className="px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black text-white uppercase shadow-md shadow-blue-200">Next</button>
                    </div>
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-xs font-bold text-gray-400 italic">Desain lengkap menyusul sesuai instruksi.</p>
            </div>
        </div>
    );
};

export default AdminUserManagement;
