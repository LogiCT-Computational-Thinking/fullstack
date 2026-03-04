import React, { useState, useEffect } from 'react';
import {
    UploadCloud, FileText, Loader2, ExternalLink, ChevronDown,
    ChevronUp, ToggleLeft, ToggleRight, Plus, X, CheckCircle2,
    AlertCircle, BookOpen, Layers, Lock, Unlock, Trash2, PlusCircle, Calendar
} from 'lucide-react';
import axios from 'axios';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// ─── Toggle Switch Component ───────────────────────────────────────────────────
function ActiveToggle({ courseId, isActive, onToggle, loading }) {
    return (
        <button
            onClick={() => onToggle(courseId)}
            disabled={loading}
            title={isActive ? 'Klik untuk Nonaktifkan' : 'Klik untuk Aktifkan'}
            className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border
                ${isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isActive ? (
                <ToggleRight className="w-4 h-4" />
            ) : (
                <ToggleLeft className="w-4 h-4" />
            )}
            {isActive ? 'Active' : 'Inactive'}
        </button>
    );
}

// ─── Add Course Modal ──────────────────────────────────────────────────────────
function AddCourseModal({ onClose, onSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [week, setWeek] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_URL}/admin/courses/`, { title, description, week }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onSuccess();
            onClose();
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | '));
            } else {
                setError('Gagal membuat course baru.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'scaleIn 0.2s ease-out' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="font-bold text-gray-900">Tambah Course Baru</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Isi data course yang akan dibuat</p>
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

                    {/* Week */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" /> Minggu ke- *
                        </label>
                        <input
                            type="number" min="1" max="20" required
                            value={week} onChange={e => setWeek(parseInt(e.target.value))}
                            className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Contoh: 8"
                        />
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Judul Course *
                        </label>
                        <input
                            required value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Contoh: Pengenalan Computational Thinking"
                            className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-600">Deskripsi</label>
                        <textarea
                            value={description} onChange={e => setDescription(e.target.value)}
                            rows="3" placeholder="Deskripsi singkat tentang course ini..."
                            className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        />
                    </div>

                    <div className="flex gap-2 mt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><PlusCircle className="w-4 h-4" /> Buat Course</>}
                        </button>
                    </div>
                </form>

                <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
            </div>
        </div>
    );
}

// ─── Upload Material Modal ─────────────────────────────────────────────────────
function UploadModal({ course, onClose, onSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fileType, setFileType] = useState('pdf');
    const [order, setOrder] = useState((course?.materials?.length || 0) + 1);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Pilih file terlebih dahulu'); return; }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file_type', fileType);
        formData.append('order', order);
        formData.append('file', file);

        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_URL}/admin/courses/${course.id}/materials/`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onSuccess();
            onClose();
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | '));
            } else {
                setError('Gagal mengupload material.');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'scaleIn 0.2s ease-out' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-gray-900">Upload Material</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            <span className="font-semibold text-blue-600">Week {course?.week}</span> · {course?.title}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600">Judul Material *</label>
                        <input required value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Contoh: Apa itu Computational Thinking?"
                            className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600">Deskripsi</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            rows="2" placeholder="Deskripsi singkat material ini..."
                            className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600">Urutan</label>
                            <input type="number" min="1" required value={order} onChange={e => setOrder(parseInt(e.target.value))}
                                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600">Tipe</label>
                            <select value={fileType} onChange={e => setFileType(e.target.value)}
                                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-colors cursor-pointer">
                                <option value="pdf">PDF</option>
                                <option value="ppt">PPT</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600">File (.pdf / .pptx) *</label>
                        <input id="modal-file-upload" type="file" required
                            onChange={e => setFile(e.target.files[0])}
                            accept=".pdf,.ppt,.pptx,.mp4,.webm"
                            className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-1" />
                    </div>

                    <button type="submit" disabled={uploading}
                        className="mt-1 w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</> : <><UploadCloud className="w-4 h-4" /> Upload ke Course Ini</>}
                    </button>
                </form>

                <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
            </div>
        </div>
    );
}

// ─── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ course, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
                style={{ animation: 'scaleIn 0.2s ease-out' }}>
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Hapus Course?</h3>
                <p className="text-sm text-gray-500 mb-1">
                    Course <span className="font-semibold text-gray-700">"{course?.title}"</span> dan semua materialnya akan dihapus permanen.
                </p>
                <p className="text-xs text-red-400 font-semibold mb-5">Tindakan ini tidak bisa dibatalkan!</p>
                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                        Batal
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onToggle, onUpload, onDelete, togglingId, onRefresh }) {
    const [expanded, setExpanded] = useState(false);
    const [inlineUpload, setInlineUpload] = useState(null);
    const [inlineFile, setInlineFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [inlineError, setInlineError] = useState('');
    const materials = course.materials || [];

    const handleInlineUpload = async (mat) => {
        if (!inlineFile) { setInlineError('Pilih file terlebih dahulu'); return; }
        setUploading(true);
        setInlineError('');
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('file', inlineFile);
            formData.append('title', mat.title);
            formData.append('file_type', mat.file_type || 'pdf');
            formData.append('order', mat.order || 1);
            await axios.patch(`${API_URL}/admin/materials/${mat.id}/`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setInlineUpload(null);
            setInlineFile(null);
            onRefresh();
        } catch (err) {
            setInlineError('Gagal upload. Coba lagi.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${course.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50'}`}>
            {/* Card Header */}
            <div className="flex items-center gap-3 p-4">
                {/* Week badge */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black
                    ${course.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    W{course.week ?? '?'}
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm leading-snug truncate ${course.is_active ? 'text-gray-800' : 'text-gray-400'}`}>
                        {course.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        {materials.length} material{materials.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <ActiveToggle
                        courseId={course.id}
                        isActive={course.is_active}
                        onToggle={onToggle}
                        loading={togglingId === course.id}
                    />
                    {/* Tambah material */}
                    <button
                        onClick={() => onUpload(course)}
                        title="Upload Material ke Course ini"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    {/* Hapus course */}
                    <button
                        onClick={() => onDelete(course)}
                        title="Hapus Course"
                        className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Materials list (expanded) */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 flex flex-col gap-2">
                    {materials.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-400 mb-2">Belum ada material</p>
                            <button onClick={() => onUpload(course)}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mx-auto">
                                <Plus className="w-3 h-3" /> Klik untuk upload material
                            </button>
                        </div>
                    ) : (
                        materials.map((mat, idx) => (
                            <div key={mat.id} className="flex flex-col gap-2 bg-white rounded-xl p-3 border border-gray-100">
                                {/* Row utama */}
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        {mat.file_type === 'ppt' ? <Layers className="w-3.5 h-3.5 text-orange-500" /> : <FileText className="w-3.5 h-3.5 text-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate">{idx + 1}. {mat.title}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {mat.file_type?.toUpperCase()} · Urutan {mat.order} ·{mat.file_url
                                                ? <span className="text-emerald-500"> ✅ Ada file</span>
                                                : <span className="text-amber-500"> ⚠️ Belum ada file</span>
                                            }
                                        </p>
                                    </div>
                                    {/* Action kanan */}
                                    {mat.file_url ? (
                                        <a href={mat.file_url} target="_blank" rel="noreferrer"
                                            className="flex-shrink-0 p-1.5 text-blue-400 hover:text-blue-600 transition-colors">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setInlineUpload(inlineUpload === mat.id ? null : mat.id);
                                                setInlineFile(null);
                                                setInlineError('');
                                            }}
                                            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 text-[10px] font-bold border border-amber-200 transition-all active:scale-95"
                                        >
                                            <UploadCloud className="w-3 h-3" />
                                            Upload File
                                        </button>
                                    )}
                                </div>

                                {/* Inline upload form */}
                                {inlineUpload === mat.id && !mat.file_url && (
                                    <div className="flex flex-col gap-2 pt-1 border-t border-gray-100 mt-1">
                                        {inlineError && (
                                            <p className="text-[10px] text-red-500 font-semibold">{inlineError}</p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept=".pdf,.ppt,.pptx"
                                                onChange={e => setInlineFile(e.target.files[0])}
                                                className="flex-1 text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-gray-50 border border-gray-200 rounded-lg p-1"
                                            />
                                            <button
                                                onClick={() => handleInlineUpload(mat)}
                                                disabled={uploading || !inlineFile}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                            >
                                                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                            <button
                                                onClick={() => { setInlineUpload(null); setInlineFile(null); setInlineError(''); }}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminMaterials() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [uploadTarget, setUploadTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [toast, setToast] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/courses/');
            setCourses(res.data);
        } catch (err) {
            showToast('error', 'Gagal memuat data course.');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleToggle = async (courseId) => {
        setTogglingId(courseId);
        try {
            const res = await api.patch(`/admin/courses/${courseId}/toggle/`);
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_active: res.data.is_active } : c));
            showToast('success', res.data.message);
        } catch {
            showToast('error', 'Gagal mengubah status course.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`${API_URL}/admin/courses/${deleteTarget.id}/delete/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showToast('success', `Course "${deleteTarget.title}" berhasil dihapus.`);
            setDeleteTarget(null);
            fetchCourses();
        } catch {
            showToast('error', 'Gagal menghapus course.');
        } finally {
            setDeleting(false);
        }
    };

    // Stats
    const activeCount = courses.filter(c => c.is_active).length;
    const inactiveCount = courses.filter(c => !c.is_active).length;
    const totalMaterials = courses.reduce((sum, c) => sum + (c.materials?.length || 0), 0);
    const missingFiles = courses.reduce((sum, c) => sum + (c.materials?.filter(m => !m.file_url).length || 0), 0);

    // Filter + search
    let filtered = courses;
    if (filterStatus === 'active') filtered = filtered.filter(c => c.is_active);
    if (filterStatus === 'inactive') filtered = filtered.filter(c => !c.is_active);
    if (search) filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-6xl mx-auto font-['Outfit']">

            {/* ── Toast ── */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[500] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-top-4
                    ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Manager</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Kelola course, status aktif, dan upload material per course</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchCourses} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600">
                        <Loader2 className="w-4 h-4" />
                        Refresh
                    </button>
                    {/* ➕ Tambah Course */}
                    <button
                        onClick={() => setShowAddCourse(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Tambah Course
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Course', value: courses.length, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Active', value: activeCount, icon: Unlock, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Inactive', value: inactiveCount, icon: Lock, color: 'text-gray-500 bg-gray-100' },
                    { label: 'File Belum Upload', value: missingFiles, icon: AlertCircle, color: 'text-orange-500 bg-orange-50' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                                <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Filter & Search ── */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
                    {[['all', 'Semua'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilterStatus(val)}
                            className={`px-4 py-2 text-xs font-bold transition-colors ${filterStatus === val ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                            {label}
                        </button>
                    ))}
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama course..."
                    className="flex-1 min-w-[180px] px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-400 transition-colors" />
                <span className="text-xs text-gray-400 font-medium">{filtered.length} course</span>
            </div>

            {/* ── Course List ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-400" />
                    <p className="text-sm font-semibold">Memuat data course...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-semibold text-sm">Tidak ada course ditemukan</p>
                    <button
                        onClick={() => setShowAddCourse(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all">
                        <PlusCircle className="w-4 h-4" /> Tambah Course Baru
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onToggle={handleToggle}
                            onUpload={setUploadTarget}
                            onDelete={setDeleteTarget}
                            togglingId={togglingId}
                            onRefresh={fetchCourses}
                        />
                    ))}
                </div>
            )}

            {/* ── Add Course Modal ── */}
            {showAddCourse && (
                <AddCourseModal
                    onClose={() => setShowAddCourse(false)}
                    onSuccess={() => {
                        fetchCourses();
                        showToast('success', 'Course baru berhasil dibuat!');
                    }}
                />
            )}

            {/* ── Upload Material Modal ── */}
            {uploadTarget && (
                <UploadModal
                    course={uploadTarget}
                    onClose={() => setUploadTarget(null)}
                    onSuccess={() => {
                        fetchCourses();
                        showToast('success', 'Material berhasil diupload!');
                    }}
                />
            )}

            {/* ── Confirm Delete Modal ── */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    course={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    loading={deleting}
                />
            )}
        </div>
    );
}
