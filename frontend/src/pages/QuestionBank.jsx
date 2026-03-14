import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Check, X, Eye, Loader2, Filter, ChevronRight, MessageSquare, Edit, Save, FileText } from 'lucide-react';
import api from '../services/api';

export default function QuestionBank() {
    const [activeTab, setActiveTab] = useState('PENDING');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Edit states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ question: '', correctAns: '' });

    // Filter states
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterWeek, setFilterWeek] = useState('ALL');
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchQuestions();
    }, [activeTab]);

    useEffect(() => {
        const fetchCoursesList = async () => {
            try {
                // Ambil week dari courses karena week sudah pindah ke Course
                const response = await api.get('/courses/');
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        fetchCoursesList();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/qbank/?status=${activeTab}`);
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status, feedback = '') => {
        try {
            await api.patch(`/admin/qbank/${id}/`, { status, admin_feedback: feedback });
            setIsModalOpen(false);
            setSelectedQuestion(null);
            // Refresh list
            fetchQuestions();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handlePreview = (q) => {
        setSelectedQuestion(q);
        setEditForm({ question: q.question, correctAns: q.correctAns || '' });
        setIsEditMode(false);
        setIsModalOpen(true);
        setShowFilterMenu(false);
    };

    const handleEdit = (q) => {
        setSelectedQuestion(q);
        setEditForm({ question: q.question, correctAns: q.correctAns || '' });
        setIsEditMode(true);
        setIsModalOpen(true);
        setShowFilterMenu(false);
    };

    const handleSaveEdit = async () => {
        try {
            await api.patch(`/admin/qbank/${selectedQuestion.id}/`, editForm);
            setIsEditMode(false);
            fetchQuestions(); // Refresh list after edit
        } catch (error) {
            console.error('Error updating question:', error);
        }
    };

    const resetFilters = () => {
        setFilterWeek('ALL');
        setFilterLevel('ALL');
        setSearchQuery('');
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesWeek = filterWeek === 'ALL' || q.week === parseInt(filterWeek);
        const matchesLevel = filterLevel === 'ALL' ||
            (filterLevel === 'EASY' && q.level <= 2) ||
            (filterLevel === 'MEDIUM' && q.level > 2 && q.level <= 4) ||
            (filterLevel === 'HARD' && q.level > 4);

        return matchesSearch && matchesWeek && matchesLevel;
    });

    const getLevelBadge = (level) => {
        const colors = {
            1: 'bg-[#22C55E]',
            2: 'bg-[#14B8A6]',
            3: 'bg-[#F59E0B]',
            4: 'bg-[#EA580C]',
            5: 'bg-[#EF4444]',
            6: 'bg-[#B91C1C]'
        };
        const color = colors[level] || 'bg-gray-500';
        return <span className={`px-5 py-1.5 ${color} text-white text-[11px] font-black rounded-full shadow-sm whitespace-nowrap`}>Level {level}</span>;
    };

    const getTopicLabel = (q) => {
        if (q.weight_abstraction > 0) return 'Abstraksi';
        if (q.weight_decomposition > 0) return 'Dekomposisi';
        if (q.weight_pattern > 0) return 'Pola';
        if (q.weight_algorithm > 0) return 'Algoritma';
        return 'General';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto p-8">

                {/* Tabs / Filter Row */}
                <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm mb-6 flex items-center gap-2 w-fit">
                    {[
                        { id: 'PENDING', label: `Pending Review (${questions.length && activeTab === 'PENDING' ? questions.length : '?'})`, color: 'bg-[#F97316]' },
                        { id: 'APPROVED', label: 'Approve', color: 'bg-green-500' },
                        { id: 'REJECTED', label: 'Rejected', color: 'bg-red-500' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.id
                                ? `${tab.color} text-white shadow-lg shadow-${tab.color.split('-')[1]}-200`
                                : 'text-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/30">
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center w-[45%]">Question</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Material</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Level</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold">Memuat Data...</p>
                                    </td>
                                </tr>
                            ) : filteredQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-400 font-medium">
                                        Tidak ada pertanyaan ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredQuestions.map((q) => (
                                    <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-medium text-gray-700 leading-relaxed line-clamp-3">
                                                {q.question}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md mb-1">
                                                    Week {q.week || '?'}
                                                </span>
                                                <span className="text-[11px] font-bold text-gray-500 max-w-[150px] truncate">
                                                    {q.course_title || 'General'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {getLevelBadge(q.level)}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handlePreview(q)}
                                                    className="w-10 h-8 bg-[#5B77B5] text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-[#4A64A0] transition-all active:scale-90"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(q)}
                                                    className="w-10 h-8 bg-[#8B5CF6] text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-[#7C3AED] transition-all active:scale-90"
                                                >
                                                    <Edit className="w-[18px] h-[18px]" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                {activeTab === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(q.id, 'REJECTED')}
                                                            className="w-10 h-8 bg-[#EF4444] text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-red-600 transition-all active:scale-90"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(q.id, 'APPROVED')}
                                                            className="w-10 h-8 bg-[#10B981] text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-green-600 transition-all active:scale-90"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className="italic text-[12px] font-semibold text-gray-800 tracking-wide font-serif">
                                                            {activeTab === 'APPROVED' ? 'Approved' : 'Rejected'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateStatus(q.id, 'PENDING')}
                                                            className="flex items-center gap-1.5 px-3 py-1 bg-[#4A64A0] hover:bg-[#344b80] text-white rounded text-[9px] font-black transition-all active:scale-95 shadow-sm"
                                                        >
                                                            <FileText className="w-3 h-3" /> Restore
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Preview Modal */}
            {isModalOpen && selectedQuestion && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all active:scale-90 z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-10">
                            {/* Level Badge */}
                            <div className="mb-6">
                                {getLevelBadge(selectedQuestion.level)}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                {/* Left Side: Question */}
                                <div className="lg:col-span-3">
                                    <div className="bg-white border border-gray-200 rounded-3xl p-8 h-full min-h-[300px] shadow-sm">
                                        {isEditMode ? (
                                            <textarea
                                                value={editForm.question}
                                                onChange={(e) => setEditForm({...editForm, question: e.target.value})}
                                                className="w-full text-gray-800 text-base leading-relaxed mb-6 font-medium p-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none"
                                                rows={6}
                                                placeholder="Enter question text..."
                                            />
                                        ) : (
                                            <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium">
                                                {selectedQuestion.question}
                                            </p>
                                        )}

                                        {selectedQuestion.image && (
                                            <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100">
                                                <img
                                                    src={selectedQuestion.image}
                                                    alt="Question Attachment"
                                                    className="max-w-full h-auto"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Correct Answer & Actions */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    <div className="bg-white border border-gray-200 rounded-3xl p-8 h-full shadow-sm flex flex-col">
                                        <h4 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">
                                            Correct Answer:
                                        </h4>
                                        <div className="bg-[#F97316] rounded-3xl p-6 flex-1 min-h-[200px] flex flex-col justify-between">
                                            <div>
                                                {isEditMode ? (
                                                    <textarea
                                                        value={editForm.correctAns}
                                                        onChange={(e) => setEditForm({...editForm, correctAns: e.target.value})}
                                                        className="w-full text-white text-sm leading-relaxed font-bold bg-white/20 p-4 rounded-2xl outline-none border border-white/30 placeholder-white/50 focus:bg-white/30 transition-all resize-none mb-4"
                                                        rows={4}
                                                        placeholder="Enter correct answer explanation..."
                                                    />
                                                ) : (
                                                    <p className="text-white text-sm leading-relaxed font-bold mb-4">
                                                        {selectedQuestion.correctAns || 'No answer provided.'}
                                                    </p>
                                                )}

                                                {/* Dummy visual for placeholder like in image */}
                                                {!isEditMode && selectedQuestion.option && selectedQuestion.option.length > 0 && (
                                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                                                        <p className="text-white text-[11px] font-black uppercase tracking-widest opacity-80 mb-2 underline decoration-white/30">Options:</p>
                                                        <ul className="list-disc list-inside text-white/90 text-xs font-bold space-y-1">
                                                            {selectedQuestion.option.map((opt, i) => (
                                                                <li key={i}>{opt}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions replacing previous Pending Approve/Reject */}
                                        <div className="mt-6 flex items-center justify-end gap-3">
                                            {!isEditMode ? (
                                                <button 
                                                    onClick={() => setIsEditMode(true)}
                                                    className="px-6 py-2.5 bg-[#8B5CF6] text-white text-[11px] font-black rounded-xl shadow-lg shadow-purple-100 flex items-center gap-2 hover:bg-[#7C3AED] transition-all active:scale-95"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => setIsEditMode(false)}
                                                        className="px-6 py-2.5 bg-white text-gray-700 text-[11px] font-black rounded-xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={handleSaveEdit}
                                                        className="px-6 py-2.5 bg-[#3B82F6] text-white text-[11px] font-black rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
                                                    >
                                                        <Save className="w-4 h-4" /> Save
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Filter Button & Menu */}
            <div className="fixed bottom-8 right-8 z-50">
                {/* Filter Menu Popover */}
                {showFilterMenu && (
                    <div className="absolute bottom-16 right-0 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 animate-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Filters</h3>
                            <button
                                onClick={resetFilters}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                            >
                                Reset All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Week Filter */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">By Week</label>
                                <select
                                    value={filterWeek}
                                    onChange={(e) => setFilterWeek(e.target.value)}
                                    className="w-full bg-gray-50 border border-transparent focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all"
                                >
                                    <option value="ALL">All Materials</option>
                                    {[...new Set(courses.map(c => c.week))].sort((a, b) => a - b).map(week => (
                                        <option key={week} value={week}>Week {week}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Level Filter */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">By Difficulty</label>
                                <select
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value)}
                                    className="w-full bg-gray-50 border border-transparent focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all"
                                >
                                    <option value="ALL">All Levels</option>
                                    <option value="EASY">Easy (lvl 1-2)</option>
                                    <option value="MEDIUM">Medium (lvl 3-4)</option>
                                    <option value="HARD">Hard (lvl 5+)</option>
                                </select>
                            </div>
                        </div>

                        {/* Stats mini info */}
                        <div className="mt-6 pt-4 border-t border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400">
                                Showing <span className="text-blue-600">{filteredQuestions.length}</span> questions
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`w-14 h-14 shadow-xl rounded-2xl flex items-center justify-center transition-all group active:scale-95 ${showFilterMenu || filterWeek !== 'ALL' || filterLevel !== 'ALL'
                        ? 'bg-[#5B77B5] text-white'
                        : 'bg-white border border-gray-100 text-gray-600 hover:text-blue-600'
                        }`}
                >
                    <Filter className={`w-6 h-6 group-hover:scale-110 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
}
