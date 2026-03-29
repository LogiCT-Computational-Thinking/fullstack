import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, BookOpen, Loader2,
    CheckCircle2, AlertCircle, X, FileText,
    Upload, Trash2, Eye, EyeOff, FilePlus2, Settings2,
    AlertTriangle
} from 'lucide-react';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────
// Reusable Result / Confirmation Modal
// type: 'success' | 'error' | 'warning'
// ─────────────────────────────────────────────────────────────
function FeedbackModal({ type, title, subtitle, primaryLabel, secondaryLabel, onPrimary, onSecondary, onClose }) {
    const icons = {
        success: (
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
        ),
        error: (
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-5">
                <X className="w-9 h-9 text-white" strokeWidth={3} />
            </div>
        ),
        warning: (
            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
        ),
    };

    return (
        <div className="fixed inset-0 z-[700] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[1.75rem] shadow-2xl w-full max-w-sm p-8 relative animate-in fade-in zoom-in-95 duration-200 text-center">
                <button onClick={onClose || onSecondary} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="w-4 h-4" />
                </button>

                {icons[type]}

                <h3 className="text-[18px] font-black text-gray-900 mb-2">{title}</h3>
                {subtitle && <p className="text-[12.5px] text-gray-400 font-semibold leading-relaxed mb-7">{subtitle}</p>}

                <div className={`flex gap-3 mt-6 ${secondaryLabel ? 'justify-between' : 'justify-center'}`}>
                    {secondaryLabel && (
                        <button
                            onClick={onSecondary}
                            className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-500 text-[13px] font-black hover:bg-gray-200 transition-all"
                        >
                            {secondaryLabel}
                        </button>
                    )}
                    <button
                        onClick={onPrimary}
                        className={`${secondaryLabel ? 'flex-1' : 'px-10'} py-2.5 rounded-full bg-black text-white text-[13px] font-black hover:bg-gray-800 active:scale-95 transition-all`}
                    >
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function AdminMaterials() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [showAddCourse, setShowAddCourse] = useState(false);

    // Edit flow modals
    const [editTarget, setEditTarget] = useState(null);
    const [editStep, setEditStep] = useState(null); // 'choose' | 'add' | 'manage'
    const [materials, setMaterials] = useState([]);
    const [matLoading, setMatLoading] = useState(false);
    const [matSearch, setMatSearch] = useState('');
    const [visibility, setVisibility] = useState(true);

    // Add Content form state
    const [addForm, setAddForm] = useState({ title: '', description: '', order: 1 });
    const [addFile, setAddFile] = useState(null);
    const [addSaving, setAddSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Feedback / Confirmation modal state
    const [feedback, setFeedback] = useState(null);
    // { type, title, subtitle, primaryLabel, secondaryLabel, onPrimary, onSecondary }

    // Pending actions (for confirmations)
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/courses/');
            setCourses(res.data);
        } catch {
            showToast('error', 'Gagal memuat data course.');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const closeFeedback = () => setFeedback(null);

    // ── Delete entire course — ask for confirmation ───────────────────────────
    const confirmDeleteCourse = (course) => {
        setFeedback({
            type: 'warning',
            title: 'Delete Entire Course?',
            subtitle: `Are you sure you want to delete "${course.title}" and all its materials?\nThis action cannot be undone.`,
            primaryLabel: 'Delete',
            secondaryLabel: 'Cancel',
            onPrimary: () => { closeFeedback(); executeDeleteCourse(course.id); },
            onSecondary: closeFeedback,
        });
    };

    const executeDeleteCourse = async (courseId) => {
        try {
            await api.delete(`/admin/courses/${courseId}/delete/`);
            fetchCourses();
            setFeedback({
                type: 'success',
                title: 'Course Deleted',
                subtitle: 'The course has been successfully removed.',
                primaryLabel: 'Back',
                onPrimary: closeFeedback,
            });
        } catch {
            showToast('error', 'Gagal menghapus course.');
        }
    };

    // ── Open edit action chooser ──────────────────────────────────────────────
    const openEdit = (course) => {
        setEditTarget(course);
        setEditStep('choose');
        setMatSearch('');
        setAddForm({ title: '', description: '', order: 1 });
        setAddFile(null);
    };

    const closeEdit = () => {
        setEditTarget(null);
        setEditStep(null);
        setMaterials([]);
        setAddFile(null);
        setAddForm({ title: '', description: '', order: 1 });
    };

    // ── Cancel Add Content — ask if unsaved changes exist ────────────────────
    const handleCancelAdd = () => {
        const hasChanges = addForm.title || addForm.description || addFile;
        if (hasChanges) {
            setFeedback({
                type: 'warning',
                title: 'Discard Changes?',
                subtitle: 'All unsaved changes will be lost.\nAre you sure you want to cancel?',
                primaryLabel: 'Discard',
                secondaryLabel: 'Cancel',
                onPrimary: () => { closeFeedback(); setEditStep('choose'); },
                onSecondary: closeFeedback,
            });
        } else {
            setEditStep('choose');
        }
    };

    // ── Load materials for Manage modal ───────────────────────────────────────
    const openManage = async () => {
        setEditStep('manage');
        setMatLoading(true);
        try {
            const res = await api.get(`/admin/courses/${editTarget.id}/materials/`);
            setMaterials(res.data);
            setVisibility(editTarget.is_active);
        } catch {
            showToast('error', 'Gagal memuat materi.');
        } finally {
            setMatLoading(false);
        }
    };

    // ── Delete material — ask for confirmation first ───────────────────────────
    const confirmDeleteMaterial = (matId) => {
        setPendingDeleteId(matId);
        setFeedback({
            type: 'warning',
            title: 'Delete Content?',
            subtitle: 'Are you sure you want to delete this material?\nThis action cannot be undone.',
            primaryLabel: 'Delete',
            secondaryLabel: 'Cancel',
            onPrimary: () => { closeFeedback(); executDeleteMaterial(matId); },
            onSecondary: () => { closeFeedback(); setPendingDeleteId(null); },
        });
    };

    const executDeleteMaterial = async (matId) => {
        try {
            await api.delete(`/admin/materials/${matId}/`);
            setMaterials(prev => prev.filter(m => m.id !== matId));
            fetchCourses();
            setFeedback({
                type: 'success',
                title: 'Content Deleted',
                subtitle: 'The material has been successfully removed.',
                primaryLabel: 'Back',
                onPrimary: closeFeedback,
            });
        } catch {
            setFeedback({
                type: 'error',
                title: 'Failed to Delete',
                subtitle: 'The material could not be deleted. Please try again.',
                primaryLabel: 'Try Again',
                secondaryLabel: 'Back',
                onPrimary: () => { closeFeedback(); executDeleteMaterial(matId); },
                onSecondary: closeFeedback,
            });
        }
    };

    // ── Toggle material visibility — ask for confirmation ───────────────────────
    const confirmToggleMaterialVisibility = (material) => {
        setFeedback({
            type: 'warning',
            title: 'Change Material Visibility?',
            subtitle: material.is_active
                ? `"${material.title}" will be hidden from students.`
                : `"${material.title}" will be visible to students.`,
            primaryLabel: 'Confirm',
            secondaryLabel: 'Cancel',
            onPrimary: () => { closeFeedback(); executeToggleMaterialVisibility(material); },
            onSecondary: closeFeedback,
        });
    };

    const executeToggleMaterialVisibility = async (material) => {
        try {
            await api.patch(`/admin/materials/${material.id}/`, {
                is_active: !material.is_active
            });
            // Update local state
            setMaterials(prev => prev.map(m =>
                m.id === material.id ? { ...m, is_active: !m.is_active } : m
            ));
            showToast('success', 'Visibilitas materi diperbarui.');
        } catch {
            showToast('error', 'Gagal mengubah visibilitas materi.');
        }
    };

    // ── Toggle course visibility — ask for confirmation ──────────────────────────────
    const confirmToggleVisibility = () => {
        setFeedback({
            type: 'warning',
            title: 'Change Course Visibility?',
            subtitle: visibility
                ? 'This course will be hidden from students.'
                : 'This course will be visible to students.',
            primaryLabel: 'Confirm',
            secondaryLabel: 'Cancel',
            onPrimary: () => { closeFeedback(); executeToggleVisibility(); },
            onSecondary: closeFeedback,
        });
    };

    const executeToggleVisibility = async () => {
        try {
            await api.patch(`/admin/courses/${editTarget.id}/toggle/`);
            setVisibility(v => !v);
            fetchCourses();
        } catch {
            showToast('error', 'Gagal mengubah visibilitas.');
        }
    };

    // ── Add Content ──────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        const allowedExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
        const ext = f.name.split('.').pop().toLowerCase();
        if (!allowedExt.includes(ext)) {
            setFeedback({
                type: 'error',
                title: 'Invalid File Format',
                subtitle: 'Only PDF, PPT, and DOCX files are supported.',
                primaryLabel: 'Back',
                onPrimary: closeFeedback,
            });
            return;
        }

        setAddFile(f);
        if (!addForm.title) setAddForm(prev => ({ ...prev, title: f.name.replace(/\.[^.]+$/, '') }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) {
            const allowedExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
            const ext = f.name.split('.').pop().toLowerCase();
            if (!allowedExt.includes(ext)) {
                setFeedback({
                    type: 'error',
                    title: 'Invalid File Format',
                    subtitle: 'Only PDF, PPT, and DOCX files are supported.',
                    primaryLabel: 'Back',
                    onPrimary: closeFeedback,
                });
                return;
            }
            setAddFile(f);
            if (!addForm.title) setAddForm(prev => ({ ...prev, title: f.name.replace(/\.[^.]+$/, '') }));
        }
    };

    const submitAddContent = async () => {
        if (!addFile) return showToast('error', 'Pilih file terlebih dahulu.');
        if (!addForm.title.trim()) return showToast('error', 'Judul materi harus diisi.');
        setAddSaving(true);
        try {
            const fd = new FormData();
            fd.append('title', addForm.title);
            fd.append('description', addForm.description);
            fd.append('order', addForm.order);
            fd.append('file', addFile);
            const ext = addFile.name.split('.').pop().toLowerCase();
            fd.append('file_type', ext === 'pdf' ? 'pdf' : (ext === 'ppt' || ext === 'pptx') ? 'ppt' : 'other');
            await api.post(`/admin/courses/${editTarget.id}/materials/`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchCourses();
            setFeedback({
                type: 'success',
                title: 'Content Successfully Added',
                subtitle: 'The learning material has been added successfully to this course.',
                primaryLabel: 'Back to Course',
                onPrimary: () => { closeFeedback(); closeEdit(); },
            });
        } catch {
            setFeedback({
                type: 'error',
                title: 'Failed to Upload Content',
                subtitle: 'The file could not be uploaded. Please try again.',
                primaryLabel: 'Try Again',
                secondaryLabel: 'Back',
                onPrimary: () => { closeFeedback(); submitAddContent(); },
                onSecondary: closeFeedback,
            });
        } finally {
            setAddSaving(false);
        }
    };

    // ─────────────────────────────────────────────────────────────
    const cardStyles = [
        { bg: 'bg-[#FFF0F7]', border: 'border-pink-100', badge: 'bg-[#FFD6E8] text-pink-700', accent: 'text-pink-300' },
        { bg: 'bg-[#F0F7FF]', border: 'border-blue-100', badge: 'bg-[#D6E8FF] text-blue-700', accent: 'text-blue-300' },
        { bg: 'bg-[#FFF7F0]', border: 'border-orange-100', badge: 'bg-[#FFE8D6] text-orange-700', accent: 'text-orange-300' },
        { bg: 'bg-[#F0FFF7]', border: 'border-green-100', badge: 'bg-[#D6FFE8] text-green-700', accent: 'text-green-300' }
    ];

    let filtered = courses;
    if (filterStatus === 'active') filtered = filtered.filter(c => c.is_active);
    if (filterStatus === 'inactive') filtered = filtered.filter(c => !c.is_active);
    if (search) filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    const filteredMats = materials.filter(m => m.title.toLowerCase().includes(matSearch.toLowerCase()));
    const getFileIcon = (ft) => ft === 'pdf' ? '📄' : ft === 'ppt' ? '📊' : '📁';
    const getFileLabel = (ft) => ft?.toUpperCase() || 'FILE';

    return (
        <div className="max-w-[1600px] mx-auto font-['Outfit'] pb-20">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold
                    ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {toast.msg}
                </div>
            )}

            {/* ── Feedback / Confirmation Modal ── */}
            {feedback && (
                <FeedbackModal
                    {...feedback}
                    onClose={feedback.onSecondary || feedback.onPrimary}
                />
            )}

            {/* ── EDIT FLOW BACKDROP ── */}
            {editStep && (
                <div
                    className="fixed inset-0 z-[500] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
                >
                    {/* STEP 1: Choose Action */}
                    {editStep === 'choose' && (
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
                            <button onClick={closeEdit} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-black text-gray-900 mb-1">{editTarget?.title}</h2>
                            <p className="text-[13px] text-gray-400 font-semibold mb-8">Choose an action to manage course content</p>

                            <div className="flex flex-col gap-3 mb-8">
                                <button
                                    onClick={() => setEditStep('add')}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <FilePlus2 className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-gray-900 text-[14px]">Add Content</div>
                                        <div className="text-[12px] text-gray-400 font-semibold">Add new learning materials</div>
                                    </div>
                                </button>

                                <button
                                    onClick={openManage}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition-all group"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                                        <Settings2 className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-gray-900 text-[14px]">Manage Content</div>
                                        <div className="text-[12px] text-gray-400 font-semibold">Edit existing materials</div>
                                    </div>
                                </button>
                            </div>

                            <button onClick={closeEdit} className="w-full py-3.5 bg-gray-100 text-gray-500 font-black text-[13px] rounded-2xl hover:bg-gray-200 transition-all">
                                Batalkan
                            </button>
                        </div>
                    )}

                    {/* STEP 2a: Add Content */}
                    {editStep === 'add' && (
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                        <FilePlus2 className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">Add Content</h2>
                                        <p className="text-[13px] text-gray-400 font-semibold">Create and organize learning materials for this course</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col gap-6">
                                {/* Material Details */}
                                <div>
                                    <div className="flex items-center gap-2 text-blue-600 text-[13px] font-black mb-4">
                                        <FileText className="w-4 h-4" /> Material Details
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <label className="block text-[12.5px] font-black text-gray-700 mb-1.5">Material Title</label>
                                            <input type="text" placeholder="Type here..." value={addForm.title}
                                                onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                                        </div>
                                        <div>
                                            <label className="block text-[12.5px] font-black text-gray-700 mb-1.5">Description</label>
                                            <textarea placeholder="Type here..." value={addForm.description} rows={3}
                                                onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[12.5px] font-black text-gray-700 mb-1.5">Content Order</label>
                                            <input type="number" min={1} value={addForm.order}
                                                onChange={e => setAddForm(p => ({ ...p, order: parseInt(e.target.value) || 1 }))}
                                                className="w-24 px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Upload File */}
                                <div>
                                    <div className="flex items-center gap-2 text-blue-600 text-[13px] font-black mb-4">
                                        <Upload className="w-4 h-4" /> Upload File
                                    </div>
                                    <div
                                        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={handleDrop}
                                    >
                                        {addFile ? (
                                            <>
                                                <div className="text-3xl">{getFileIcon(addFile.name.split('.').pop())}</div>
                                                <p className="font-black text-gray-700 text-[13px]">{addFile.name}</p>
                                                <p className="text-[11px] text-gray-400">{(addFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-gray-300" />
                                                <p className="font-black text-gray-500 text-[13px]">Upload File*</p>
                                                <p className="text-[11px] text-gray-300">Supported formats: PDF, PPT, DOCX</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx"
                                        className="hidden" onChange={handleFileChange} />
                                    {addFile && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <input type="text" value={addFile.name} readOnly
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[12.5px] text-gray-500 bg-gray-50 font-semibold" />
                                            <button onClick={() => setAddFile(null)}
                                                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-[12px] text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all font-bold">
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                            <button onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[12px] font-black hover:bg-blue-700 transition-all">
                                                <Upload className="w-3.5 h-3.5" /> Choose file...
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button onClick={handleCancelAdd}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-[13px] font-black text-gray-500 hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button onClick={submitAddContent} disabled={addSaving}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-black hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
                                    {addSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2b: Manage Content */}
                    {editStep === 'manage' && (
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Manage Content</h2>
                                    <p className="text-[12.5px] text-gray-400 font-semibold">Edit, remove, or manage course materials</p>
                                </div>
                                <button onClick={closeEdit} className="text-gray-300 hover:text-gray-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input type="text" placeholder="Search" value={matSearch} onChange={e => setMatSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300" />
                                </div>

                                <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
                                    {matLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                        </div>
                                    ) : filteredMats.length === 0 ? (
                                        <div className="text-center py-8 text-gray-300 font-bold text-[13px]">Belum ada materi</div>
                                    ) : filteredMats.map(mat => (
                                        <div key={mat.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-lg">
                                                {getFileIcon(mat.file_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-black text-gray-800 text-[13px] truncate">{mat.title}</div>
                                                <div className="text-[11px] text-gray-400 font-semibold">{getFileLabel(mat.file_type)}</div>
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <button
                                                    onClick={() => confirmToggleMaterialVisibility(mat)}
                                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${mat.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                                                    title={mat.is_active ? 'Visible' : 'Hidden'}
                                                >
                                                    {mat.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => confirmDeleteMaterial(mat.id)}
                                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Visibility Toggle */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-[13px] font-black text-gray-600 flex items-center gap-2">
                                        {visibility ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                                        Course Visibility
                                    </span>
                                    <button onClick={confirmToggleVisibility}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${visibility ? 'bg-green-400' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${visibility ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100">
                                <button onClick={closeEdit} className="w-full py-3 bg-gray-100 text-gray-500 font-black text-[13px] rounded-2xl hover:bg-gray-200 transition-all">
                                    Batalkan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── ADD COURSE MODAL ── */}
            {showAddCourse && (
                <AddCourseModal
                    onClose={() => setShowAddCourse(false)}
                    onSaved={() => { fetchCourses(); setShowAddCourse(false); showToast('success', 'Course berhasil ditambahkan!'); }}
                />
            )}

            <div className="mb-10">
                <h1 className="text-[32px] font-black text-gray-900 tracking-tight">Course Manager</h1>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center p-1.5 bg-gray-100/80 rounded-full w-fit">
                    {[{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'inactive', label: 'Inactive' }].map(tab => (
                        <button key={tab.id} onClick={() => setFilterStatus(tab.id)}
                            className={`px-8 py-2.5 rounded-full text-[13px] font-black tracking-tight transition-all ${filterStatus === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => setShowAddCourse(true)}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#5D21D0] text-white rounded-2xl font-black text-[14px] hover:bg-[#4B19B0] active:scale-95 transition-all shadow-lg shadow-purple-200">
                        <Plus className="w-5 h-5" /> Add Course
                    </button>
                    <div className="relative flex-1 md:w-[350px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-[14px] font-bold focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-100 transition-all placeholder:text-gray-300" />
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-40">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-gray-300">
                    <BookOpen className="w-20 h-20 mb-4 opacity-20" />
                    <p className="text-xl font-bold">No courses found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filtered.map((course, idx) => {
                        const style = cardStyles[idx % cardStyles.length];
                        return (
                            <div key={course.id}
                                className={`relative group px-10 py-5 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${style.bg} ${style.border}`}>
                                {/* Triangle Background */}
                                <div className="absolute top-0 right-0 bottom-0 w-[35%] pointer-events-none">
                                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                                        <defs>
                                            <radialGradient id={`rg-${idx}`} cx="80" cy="50" r="90" gradientUnits="userSpaceOnUse">
                                                <stop offset="13%" stopColor={idx % 4 === 0 ? '#FFD1F7' : idx % 4 === 1 ? '#D1E8FF' : idx % 4 === 2 ? '#FFE8D1' : '#D1FFE8'} stopOpacity="1" />
                                                <stop offset="100%" stopColor={idx % 4 === 0 ? '#FF4ADF' : idx % 4 === 1 ? '#4AAEFF' : idx % 4 === 2 ? '#FF8C4A' : '#4ADF8C'} stopOpacity="1" />
                                            </radialGradient>
                                        </defs>
                                        {[...Array(4)].map((_, i) => (
                                            <path key={i}
                                                d="M 300 -250 L 6 44 Q 0 50 6 56 L 300 350 Z"
                                                fill={i === 3 ? `url(#rg-${idx})` : 'currentColor'}
                                                className={i < 3 ? style.accent : ''}
                                                style={{ opacity: i === 3 ? 0.55 : 0.1 + (i * 0.12), transform: `translateX(${i * 7}%)` }}
                                            />
                                        ))}
                                    </svg>
                                </div>

                                <div className="relative z-10 flex flex-col h-full min-h-[110px]">
                                    <div className={`w-fit px-5 py-1.5 rounded-full text-[11px] font-black tracking-widest mb-3 ${style.badge}`}>
                                        WEEK {course.week || '1'}
                                    </div>
                                    <h3 className="text-[19px] font-black text-gray-900 leading-tight mb-2 pr-10">{course.title}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[12.5px] mb-auto">
                                        <BookOpen className="w-4 h-4" strokeWidth={3} />
                                        <span>{course.materials?.length || 0} Modules</span>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between">
                                        <button onClick={() => openEdit(course)}
                                            className="px-9 py-2.5 bg-black text-white text-[12.5px] font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-md">
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); confirmDeleteCourse(course); }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Add Course Modal ──────────────────────────────────────────────────────────
function AddCourseModal({ onClose, onSaved }) {
    const [form, setForm] = useState({ title: '', description: '', week: 1 });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const save = async () => {
        if (!form.title.trim()) return setErr('Judul course harus diisi.');
        setSaving(true);
        try {
            await api.post('/admin/courses/', form);
            onSaved();
        } catch {
            setErr('Gagal menyimpan course.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[600] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-black text-gray-900 mb-1">Add Course</h2>
                <p className="text-[13px] text-gray-400 font-semibold mb-6">Create a new course in the system</p>
                {err && <p className="text-red-500 text-[12px] font-bold mb-4">{err}</p>}
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-[12.5px] font-black text-gray-700 mb-1.5">Title</label>
                        <input type="text" placeholder="Course title..." value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300" />
                    </div>
                    <div>
                        <label className="block text-[12.5px] font-black text-gray-700 mb-1.5">Description</label>
                        <textarea placeholder="Course description..." value={form.description} rows={3}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 resize-none" />
                    </div>
                    <div>
                        <label className="block text-[12.5px] font-black text-gray-700 mb-1.5">Week</label>
                        <input type="number" min={1} value={form.week}
                            onChange={e => setForm(p => ({ ...p, week: parseInt(e.target.value) || 1 }))}
                            className="w-24 px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300" />
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-500 font-black text-[13px] rounded-2xl hover:bg-gray-200 transition-all">Cancel</button>
                    <button onClick={save} disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#5D21D0] text-white font-black text-[13px] rounded-2xl hover:bg-[#4B19B0] transition-all disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                    </button>
                </div>
            </div>
        </div>
    );
}
