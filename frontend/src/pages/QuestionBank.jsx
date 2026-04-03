import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Check, X, Eye, Loader2, RefreshCcw, Filter, ChevronRight, MessageSquare, Edit, Save, FileText, HelpCircle, UploadCloud, GripVertical, Trash2, CheckSquare, ChevronDown, Image as ImageIcon, Sparkles } from 'lucide-react';
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
    const [editForm, setEditForm] = useState({ 
        type: 'multiple_choice',
        question: '', 
        correctAns: '',
        option: [],
        solution: ''
    });

    // Generation states
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [targetWeek, setTargetWeek] = useState(1);
    const [genTopic, setGenTopic] = useState('');
    const [genDescription, setGenDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Filter states
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterWeek, setFilterWeek] = useState('ALL');
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [isSolutionDropdownOpen, setIsSolutionDropdownOpen] = useState(false);
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

    // Update generation fields when week changes
    useEffect(() => {
        if (courses.length > 0) {
            const course = courses.find(c => c.week === targetWeek);
            if (course) {
                setGenTopic(course.title || '');
                setGenDescription(course.description || '');
            } else {
                setGenTopic(`Materi Minggu ${targetWeek}`);
                setGenDescription('');
            }
        }
    }, [targetWeek, courses]);

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
        setEditForm({ 
            type: q.type,
            question: q.question, 
            correctAns: q.correctAns || '',
            option: q.type === 'true_false' 
                ? [(q.option?.[0] || ''), (q.option?.[1] || '')]
                : (q.option || []),
            solution: q.solution || ''
        });
        setIsEditMode(false);
        setIsModalOpen(true);
        setIsSolutionDropdownOpen(false);
        setShowFilterMenu(false);
    };

    const handleEdit = (q) => {
        setSelectedQuestion(q);
        setEditForm({ 
            type: q.type,
            question: q.question, 
            correctAns: q.correctAns || '',
            option: q.type === 'true_false' 
                ? [(q.option?.[0] || ''), (q.option?.[1] || '')]
                : (q.option || []),
            solution: q.solution || ''
        });
        setIsEditMode(true);
        setIsModalOpen(true);
        setIsSolutionDropdownOpen(false);
        setShowFilterMenu(false);
    };

    const handleGenerateQuestions = async () => {
        if (!genTopic.trim() || !genDescription.trim()) {
            alert('Topik dan Deskripsi materi harus diisi untuk generate soal.');
            return;
        }

        setIsGenerating(true);
        try {
            await api.post('/admin/qbank/generate/', { 
                week: targetWeek,
                topic_name: genTopic,
                topic_text: genDescription,
                week_id: targetWeek.toString()
            });
            setIsGenerateModalOpen(false);
            fetchQuestions();
        } catch (error) {
            console.error('Error generating questions:', error);
            alert('Gagal men-generate soal. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSyncQuestions = async () => {
        setIsSyncing(true);
        try {
            const response = await api.post('/admin/qbank/sync/');
            alert(response.data.message);
            fetchQuestions();
        } catch (error) {
            console.error('Error syncing questions:', error);
            alert('Gagal sinkronisasi soal.');
        } finally {
            setIsSyncing(false);
        }
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
        const colors = [
            '#059669', // Level 1
            '#078C3C', // Level 2
            '#D97706', // Level 3
            '#EE5800', // Level 4
            '#D20319'  // Level 5
        ];
        // Use mod logic for level higher than 5
        const color = colors[(level - 1) % colors.length];
        
        return (
            <span 
                className="px-6 py-1.5 text-[10px] font-black rounded-full border-[1.5px] whitespace-nowrap uppercase tracking-widest"
                style={{ 
                    color: color, 
                    borderColor: color,
                    backgroundColor: `${color}10` // 10% opacity for bg
                }}
            >
                Level {level}
            </span>
        );
    };

    const getMaterialBadge = (week) => {
        const colors = [
            '#2653DF', // Blue
            '#8910D9', // Purple
            '#8E0057', // Magenta
            '#00668F', // Teal
            '#EE5800'  // Orange
        ];
        const color = colors[(week - 1) % colors.length] || colors[0];
        
        return (
            <span 
                className="px-6 py-1.5 text-[10px] font-black rounded-full border-[1.5px] whitespace-nowrap uppercase tracking-widest"
                style={{ 
                    color: color, 
                    borderColor: color,
                    backgroundColor: `${color}10` // 10% opacity for bg
                }}
            >
                Week {week}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-8 pb-12 font-['Outfit']">
            {/* Main Content */}
            <div className="pb-8">
                
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleSyncQuestions}
                            disabled={isSyncing}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                isSyncing 
                                ? 'bg-gray-100 border-gray-100 text-gray-400' 
                                : 'bg-white border-blue-600/10 text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync with AI'}
                        </button>
                        <button 
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate Questions
                        </button>
                    </div>
                </div>

                {/* Tabs / Filter Row */}
                <div className="bg-[#E9ECF3] rounded-2xl p-1.5 mb-8 flex items-center gap-1 w-fit shadow-inner">
                    {[
                        { id: 'PENDING', label: 'Pending Review', count: activeTab === 'PENDING' ? questions.length : null },
                        { id: 'APPROVED', label: 'Approve', count: activeTab === 'APPROVED' ? questions.length : null },
                        { id: 'REJECTED', label: 'Rejected', count: activeTab === 'REJECTED' ? questions.length : null }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {typeof tab.count === 'number' && (
                                <span className="bg-[#EE5800] text-white text-[9px] px-1.5 py-0.5 rounded flex items-center justify-center font-black">
                                    {(tab.count || 0).toString().padStart(2, '0')}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F1F7FA]">
                                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-widest text-center w-[40%]">Question</th>
                                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-widest text-center">Material</th>
                                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-widest text-center">Level</th>
                                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-widest text-center">Action</th>
                                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold text-[13px]">Memuat Data...</p>
                                    </td>
                                </tr>
                            ) : filteredQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-400 font-bold text-sm">
                                        Tidak ada pertanyaan ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredQuestions.map((q, index) => (
                                    <tr key={q.id} className={`hover:bg-gray-50/50 relative group transition-all duration-200 ${index !== filteredQuestions.length - 1 ? 'after:absolute after:bottom-0 after:left-10 after:right-10 after:border-b after:border-gray-200 after:content-[""]' : ''}`}>
                                        <td className="px-8 py-8 first:pl-10 last:pr-10">
                                            <p className="text-sm font-medium text-gray-700 leading-relaxed line-clamp-4">
                                                {q.question}
                                            </p>
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            {getMaterialBadge(q.week || 1)}
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            {getLevelBadge(q.level)}
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handlePreview(q)}
                                                    className="w-11 h-8 rounded-lg border-2 border-[#374151] flex items-center justify-center text-[#374151] hover:bg-gray-50 transition-all active:scale-95"
                                                    title="View Detail"
                                                >
                                                    <Eye className="w-4 h-4 stroke-[2.5]" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(q)}
                                                    className="w-11 h-8 rounded-lg border-2 border-[#3B1EB1] flex items-center justify-center text-[#3B1EB1] hover:bg-white transition-all active:scale-95"
                                                    title="Edit Question"
                                                >
                                                    <Edit className="w-4 h-4 stroke-[2.5]" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-center last:pr-10">
                                            <div className="flex items-center justify-center gap-3">
                                                {q.status === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(q.id, 'REJECTED')}
                                                            className="w-9 h-9 rounded-full border-2 border-[#A9AAAB] flex items-center justify-center text-[#A9AAAB] hover:bg-gray-50 transition-all active:scale-90"
                                                            title="Reject"
                                                        >
                                                            <X className="w-5 h-5 stroke-[2.5]" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(q.id, 'APPROVED')}
                                                            className="w-9 h-9 rounded-full bg-[#2653DF] flex items-center justify-center text-white shadow-md hover:scale-105 transition-all active:scale-90"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-5 h-5 stroke-[2.5]" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${q.status === 'APPROVED' ? 'text-blue-600' : 'text-gray-400'}`}>
                                                            {q.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateStatus(q.id, 'PENDING')}
                                                            className="text-[10px] font-bold text-gray-400 hover:underline tracking-widest uppercase"
                                                        >
                                                            Restore
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
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 scrollbar-hide">
                        <div className="p-10 font-['Outfit']">
                            {/* Badges Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <span className="px-5 py-2 text-[12px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm capitalize">
                                    {(editForm.type || '').replace(/_/g, ' ')}
                                </span>
                                <span className="px-5 py-2 text-[12px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm">
                                    Week {selectedQuestion.week || 1}
                                </span>
                                <span className="px-5 py-2 text-[12px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm">
                                    Level {selectedQuestion.level}
                                </span>
                            </div>

                            <hr className="border-gray-100 mb-8" />

                            <div className="space-y-8">
                                {/* Question Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                                        <HelpCircle className="w-4 h-4 text-gray-400" /> Question
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                        <div className="lg:col-span-8">
                                            <div className="bg-white border border-gray-200 rounded-2xl p-6 min-h-[160px] shadow-sm">
                                                {isEditMode ? (
                                                    <textarea
                                                        value={editForm.question}
                                                        onChange={(e) => setEditForm({...editForm, question: e.target.value})}
                                                        className="w-full text-sm text-gray-700 leading-relaxed font-medium outline-none border-none resize-none bg-transparent focus:ring-0"
                                                        rows={5}
                                                        placeholder="Enter question text..."
                                                    />
                                                ) : (
                                                    <div className="space-y-4">
                                                        <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                                            {selectedQuestion.question}
                                                        </p>
                                                        {selectedQuestion.challenge && (
                                                            <div>
                                                                <p className="text-xs font-black text-gray-900 mb-1">Challenge:</p>
                                                                <p className="text-sm font-medium text-gray-700">{selectedQuestion.challenge}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="lg:col-span-4">
                                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl h-full min-h-[160px] flex flex-col items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                                                    <UploadCloud className="w-8 h-8" />
                                                </div>
                                                <p className="text-[11px] font-black uppercase tracking-widest text-center px-4">
                                                    Upload picture <br/> <span className="opacity-50">(optional)</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Choices Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                                            Choices <span className="text-red-500">*</span>
                                        </h3>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Multiple Select</span>
                                                <div 
                                                    onClick={() => {
                                                        if (!isEditMode) return;
                                                        const isMulti = editForm.type.includes('multi_select');
                                                        const isImage = editForm.type.includes('_image');
                                                        let newType = isMulti ? 'multiple_choice' : 'multi_select';
                                                        if (isImage) newType += '_image';
                                                        setEditForm({...editForm, type: newType, correctAns: ''});
                                                    }}
                                                    className={`w-10 h-5 rounded-full relative transition-all duration-200 ${isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${(editForm.type || '').includes('multi_select') ? 'bg-green-500' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${(editForm.type || '').includes('multi_select') ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Answer with image</span>
                                                <div 
                                                    onClick={() => {
                                                        if (!isEditMode) return;
                                                        const isImage = editForm.type.includes('_image');
                                                        let newType = editForm.type.replace('_image', '');
                                                        if (!isImage) newType += '_image';
                                                        setEditForm({...editForm, type: newType});
                                                    }}
                                                    className={`w-10 h-5 rounded-full relative transition-all duration-200 ${isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${(editForm.type || '').includes('_image') ? 'bg-green-500' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${(editForm.type || '').includes('_image') ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`grid gap-6 ${ (editForm.type || '').includes('_image') ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1' }`}>
                                        {(isEditMode ? editForm.option : (selectedQuestion.option || [])).slice(0, editForm.type === 'true_false' ? 2 : (editForm.type === 'short_answer' ? 1 : undefined)).map((opt, idx) => {
                                            const isImage = (editForm.type || '').includes('_image');
                                            const optText = typeof opt === 'object' ? opt.text : opt;
                                            const optImg = typeof opt === 'object' ? opt.image : null;

                                            return (
                                                <div key={idx} className="space-y-2">
                                                    {editForm.type === 'true_false' && (
                                                        <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest ml-1">
                                                            {idx === 0 ? 'True' : 'False'}
                                                        </h4>
                                                    )}
                                                    <div className="flex items-center gap-3 group">
                                                        <div className={`flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-blue-400 transition-all flex items-center p-1 ${ isImage ? 'gap-0' : 'gap-3 p-3' }`}>
                                                            {isImage && (
                                                                <div className="relative w-16 h-16 bg-gray-50 border-r border-gray-100 rounded-l-2xl flex items-center justify-center text-gray-300 hover:bg-gray-100 transition-colors cursor-pointer group/img mr-3 overflow-hidden">
                                                                    {optImg ? (
                                                                        <img src={optImg} className="w-full h-full object-cover" alt={`Choice ${idx}`} />
                                                                    ) : <ImageIcon className="w-6 h-6" />}
                                                                    
                                                                    {isEditMode && (
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <input 
                                                                                type="file" 
                                                                                accept="image/jpeg,image/png,image/jpg"
                                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                                onChange={async (e) => {
                                                                                    const file = e.target.files[0];
                                                                                    if (file) {
                                                                                        try {
                                                                                            const formData = new FormData();
                                                                                            formData.append('image', file);
                                                                                            
                                                                                            // Directly call upload API
                                                                                            const res = await api.post('/admin/qbank/upload-image/', formData, {
                                                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                                                            });
                                                                                            
                                                                                            if (res.data.url) {
                                                                                                const newOpts = [...editForm.option];
                                                                                                newOpts[idx] = { text: optText, image: res.data.url };
                                                                                                setEditForm({...editForm, option: newOpts});
                                                                                            }
                                                                                        } catch (err) {
                                                                                            console.error("Upload failed:", err);
                                                                                            alert("Failed to upload image. Please try again.");
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <UploadCloud className="w-5 h-5 text-white" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {editForm.type !== 'true_false' && !isImage && (
                                                                <span className="text-xs font-black text-gray-400 min-w-[20px] uppercase">
                                                                    {String.fromCharCode(65 + idx)}.
                                                                </span>
                                                            )}

                                                            <div className="flex-1 py-2 pr-3">
                                                                {isImage && (
                                                                    <p className="text-[9px] italic text-gray-400 font-bold mb-0.5">Tambahkan teks (opsional)</p>
                                                                )}
                                                                {isEditMode ? (
                                                                    <input 
                                                                        type="text"
                                                                        value={optText}
                                                                        onChange={(e) => {
                                                                            const newOpts = [...editForm.option];
                                                                            if (isImage) {
                                                                                newOpts[idx] = { text: e.target.value, image: optImg };
                                                                            } else {
                                                                                newOpts[idx] = e.target.value;
                                                                            }
                                                                            setEditForm({...editForm, option: newOpts});
                                                                        }}
                                                                        className="w-full bg-transparent outline-none text-[13px] font-medium text-gray-700 placeholder-gray-300"
                                                                        placeholder={isImage ? `${String.fromCharCode(idx + 65)}. Enter option text...` : "Enter text..."}
                                                                    />
                                                                ) : (
                                                                    <span className="text-[13px] font-medium text-gray-700">
                                                                        {isImage ? `${String.fromCharCode(idx + 65)}. ${optText}` : optText}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button className="px-2 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                                                <GripVertical className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    if (!isEditMode) return;
                                                                    const newOpts = editForm.option.filter((_, i) => i !== idx);
                                                                    setEditForm({...editForm, option: newOpts});
                                                                }}
                                                                className="px-2 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Solution Section */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                                            <CheckSquare className="w-4 h-4 text-gray-400" /> Solution
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[13px] font-medium text-gray-500">Correct answer:</span>
                                            <div className="relative w-full max-w-md">
                                                {editForm.type === 'short_answer' ? (
                                                    <input 
                                                        type="text"
                                                        value={isEditMode ? editForm.correctAns : selectedQuestion.correctAns}
                                                        onChange={(e) => setEditForm({...editForm, correctAns: e.target.value})}
                                                        disabled={!isEditMode}
                                                        placeholder="Enter answer keyword..."
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 shadow-sm disabled:cursor-default disabled:bg-gray-50/50"
                                                    />
                                                ) : (editForm.type === 'multi_select' || editForm.type === 'multi_select_image' || editForm.type === 'true_false') && isEditMode ? (
                                                    <div className="relative">
                                                        <div 
                                                            onClick={() => setIsSolutionDropdownOpen(!isSolutionDropdownOpen)}
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 shadow-sm flex items-center justify-between cursor-pointer min-h-[42px]"
                                                        >
                                                            <span className={editForm.correctAns ? 'text-gray-700' : 'text-gray-400 font-normal'}>
                                                                {editForm.type.includes('multi_select')
                                                                    ? (editForm.correctAns ? editForm.correctAns.split(',').length + ' items selected' : 'Select answers...')
                                                                    : (editForm.correctAns || 'Select correct statement...')}
                                                            </span>
                                                            <div className="text-gray-400">
                                                                <ChevronDown className={`w-4 h-4 transition-transform ${isSolutionDropdownOpen ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>

                                                        {isSolutionDropdownOpen && (
                                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                                {editForm.type.includes('multi_select') ? (
                                                                    <>
                                                                        <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                                                            <button onClick={() => setEditForm({...editForm, correctAns: editForm.option.join(',')})} className="text-blue-600 text-[11px] font-bold hover:underline">Select All</button>
                                                                            <button onClick={() => setEditForm({...editForm, correctAns: ''})} className="text-gray-500 text-[11px] font-bold hover:underline">Clear All</button>
                                                                        </div>
                                                                        <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                                                                            {editForm.option.map((opt, i) => {
                                                                                const optText = typeof opt === 'object' ? opt.text : opt;
                                                                                const isSelected = editForm.correctAns.split(',').includes(optText);
                                                                                return (
                                                                                    <div 
                                                                                        key={i}
                                                                                        onClick={() => {
                                                                                            const current = editForm.correctAns ? editForm.correctAns.split(',') : [];
                                                                                            const newVal = isSelected ? current.filter(v => v !== optText) : [...current, optText];
                                                                                            setEditForm({...editForm, correctAns: newVal.join(',')});
                                                                                        }}
                                                                                        className="px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 cursor-pointer group"
                                                                                    >
                                                                                        <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                                                        </div>
                                                                                        <span className={`text-[13px] font-medium transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                                                                            {String.fromCharCode(65 + i)}. {optText}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                                                                        {editForm.option.slice(0, 2).map((opt, i) => {
                                                                            const optText = typeof opt === 'object' ? opt.text : opt;
                                                                            return (
                                                                                <div 
                                                                                    key={i}
                                                                                    onClick={() => {
                                                                                        setEditForm({...editForm, correctAns: optText});
                                                                                        setIsSolutionDropdownOpen(false);
                                                                                    }}
                                                                                    className={`px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 ${editForm.correctAns === optText ? 'bg-blue-50/50' : ''}`}
                                                                                >
                                                                                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-1">
                                                                                        {i === 0 ? 'True' : 'False'}
                                                                                    </p>
                                                                                    <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                                                                                        {optText}
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <select
                                                            value={isEditMode ? editForm.correctAns : selectedQuestion.correctAns}
                                                            onChange={(e) => setEditForm({...editForm, correctAns: e.target.value})}
                                                            disabled={!isEditMode}
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 appearance-none shadow-sm disabled:cursor-default"
                                                        >
                                                            {editForm.type.includes('multi_select') || editForm.type === 'true_false' ? (
                                                                <option value={isEditMode ? editForm.correctAns : selectedQuestion.correctAns}>
                                                                    {isEditMode ? (editForm.type.includes('multi_select') ? editForm.correctAns.split(',').length + ' Selected' : editForm.correctAns) : selectedQuestion.correctAns}
                                                                </option>
                                                            ) : (
                                                                (isEditMode ? editForm.option : (selectedQuestion.option || [])).map((opt, i) => {
                                                                    const optVal = typeof opt === 'object' ? opt.text : opt;
                                                                    return (
                                                                        <option key={i} value={optVal}>
                                                                            {String.fromCharCode(65 + i)}. {optVal}
                                                                        </option>
                                                                    );
                                                                })
                                                            )}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                            <ChevronDown className="w-4 h-4" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                                            <FileText className="w-4 h-4 text-gray-400" /> Solution Explanation
                                        </h3>
                                        <div className="bg-white border border-gray-200 rounded-2xl p-6 min-h-[120px] shadow-sm">
                                            {isEditMode ? (
                                                <textarea
                                                    value={editForm.solution || ''}
                                                    onChange={(e) => setEditForm({...editForm, solution: e.target.value})}
                                                    className="w-full text-sm text-gray-500 leading-relaxed font-medium outline-none border-none resize-none bg-transparent focus:ring-0"
                                                    rows={4}
                                                    placeholder="Explain the logic behind the correct answer..."
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-gray-500 leading-relaxed italic opacity-80">
                                                    {selectedQuestion.solution || 'No explanation provided yet.'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-end gap-5">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-3.5 bg-white text-gray-700 border-2 border-gray-200 text-[16px] font-bold rounded-[1.25rem] hover:bg-gray-50 transition-all active:scale-95 shadow-sm min-w-[140px]"
                                >
                                    Cancel
                                </button>
                                {!isEditMode ? (
                                    <button 
                                        onClick={() => setIsEditMode(true)}
                                        className="px-10 py-3.5 bg-[#3B1EB1] text-white text-[16px] font-bold rounded-[1.25rem] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 min-w-[140px]"
                                    >
                                        <Edit className="w-5 h-5" /> Edit
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleSaveEdit}
                                        className="px-10 py-3.5 bg-[#3B1EB1] text-white text-[16px] font-bold rounded-[1.25rem] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 min-w-[140px]"
                                    >
                                        <Save className="w-5 h-5" /> Save Changes
                                    </button>
                                )}
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

            {/* AI Generator Modal */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !isGenerating && setIsGenerateModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 scrollbar-hide">
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Auto Generate Questions</h3>
                            <button 
                                onClick={() => setIsGenerateModalOpen(false)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 pt-2">
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                AI akan secara otomatis membuat 10 soal baru (6 MCQ + 4 Open Question) untuk materi di minggu yang Anda pilih.
                            </p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">1. Pilih Minggu (Week)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[...Array(14)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setTargetWeek(i + 1)}
                                                className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                                    targetWeek === i + 1 
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">2. Topik Materi</label>
                                    <input 
                                        type="text"
                                        value={genTopic}
                                        onChange={(e) => setGenTopic(e.target.value)}
                                        placeholder="Contoh: Abstraksi dalam Berpikir"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">3. Deskripsi / Materi Detail</label>
                                    <textarea 
                                        value={genDescription}
                                        onChange={(e) => setGenDescription(e.target.value)}
                                        placeholder="Masukkan penjelasan detail materi minggu ini..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none"
                                        rows={4}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Minimal 50 karakter untuk hasil yang optimal.</p>
                                </div>

                                <button
                                    onClick={handleGenerateQuestions}
                                    disabled={isGenerating}
                                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 mt-4 ${
                                        isGenerating 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 active:scale-[0.98]'
                                    }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sedang Men-generate...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate This Week's Questions
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
