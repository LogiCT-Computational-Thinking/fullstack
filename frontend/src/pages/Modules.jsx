import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ChevronDown, Calendar, CheckSquare, LayoutGrid,
    List, Clock, Layers, MoreHorizontal, Lock, Play,
    X, Brain, ChevronRight, FileText, Loader2, Download
} from 'lucide-react';
import api from '../services/api';

// ─── Theme Config (sangat light, sesuai desain) ──────────────────────────────

const CARD_THEMES = [
    { cardBg: '#f0f7ff', quarterColor: '#c7dff7', badgeBg: '#e1effe', badgeText: '#1e40af' },  // biru muda
    { cardBg: '#f0fdf4', quarterColor: '#bbf7d0', badgeBg: '#dcfce7', badgeText: '#166534' },  // hijau muda
    { cardBg: '#fffbeb', quarterColor: '#fde68a', badgeBg: '#fef3c7', badgeText: '#92400e' },  // kuning muda
    { cardBg: '#fdf4ff', quarterColor: '#e9d5ff', badgeBg: '#f3e8ff', badgeText: '#6b21a8' },  // ungu muda
    { cardBg: '#f0f9ff', quarterColor: '#bae6fd', badgeBg: '#e0f2fe', badgeText: '#075985' },  // biru langit
    { cardBg: '#f0fdf4', quarterColor: '#a7f3d0', badgeBg: '#d1fae5', badgeText: '#065f46' },  // teal muda
    { cardBg: '#fff7ed', quarterColor: '#fed7aa', badgeBg: '#ffedd5', badgeText: '#9a3412' },  // oranye muda
    { cardBg: '#fef2f2', quarterColor: '#fecaca', badgeBg: '#fee2e2', badgeText: '#991b1b' },  // merah muda
];

const TABS = [
    { id: 'active', label: 'Active Materials', countKey: 'active' },
    { id: 'finished', label: 'Finished', countKey: 'finished' },
    { id: 'locked', label: 'Locked', countKey: 'locked' },
    { id: 'archived', label: 'Archived', countKey: 'archived' },
];

// Helper: ambil week dari material pertama
function getWeek(course) {
    if (course.materials && course.materials.length > 0) return course.materials[0].week;
    return '?';
}

// ─── Active Card ──────────────────────────────────────────────────────────────

function ActiveCard({ course, themeIndex, onClick }) {
    const t = CARD_THEMES[themeIndex % CARD_THEMES.length];

    return (
        <button
            onClick={onClick}
            className="text-left rounded-[22px] bg-white flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full cursor-pointer border border-gray-100 p-3 gap-3"
        >
            {/* ── Inner card berwarna ── */}
            <div
                className="relative rounded-[14px] overflow-hidden p-4 flex flex-col gap-3"
                style={{ background: t.cardBg }}
            >
                {/* Donat ring pojok kanan atas */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        border: `34px solid ${t.quarterColor}`,
                        background: 'transparent',
                        top: -90,
                        right: -90,
                        opacity: 0.9,
                    }}
                />

                {/* Week badge + menu */}
                <div className="relative z-10 flex items-center justify-between">
                    <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: t.badgeBg, color: t.badgeText }}
                    >
                        Week {course.week}
                    </span>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>

                {/* Title */}
                <h3 className="relative z-10 text-[15px] font-bold text-gray-900 leading-snug">
                    {course.title}
                </h3>

                {/* Meta */}
                <div className="relative z-10 flex items-center gap-2 text-gray-600 text-xs font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />60 minutes</span>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course.modules} modules</span>
                </div>

                {/* Description */}
                <p className="relative z-10 text-xs text-gray-500 leading-relaxed line-clamp-2 text-justify">
                    {course.description || `Materi pembelajaran mandiri untuk ${course.title} pada Minggu ke-${course.week}.`}
                </p>

                {/* Progress bar */}
                <div className="relative z-10 mt-1">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] text-gray-500">Progress</span>
                        <span className="text-[11px] font-bold text-gray-800">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/10">
                        <div
                            className="h-full rounded-full bg-gray-900 transition-all duration-700"
                            style={{ width: `${course.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Footer — bagian putih luar ── */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-500">
                    Status: <span className="font-bold text-gray-800">On Progress</span>
                </span>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold">
                    <Play className="w-3 h-3 fill-white" />
                    Continue
                </div>
            </div>
        </button>
    );
}

// ─── Locked Card ──────────────────────────────────────────────────────────────

function LockedCard({ course, onClick }) {
    return (
        <button
            onClick={onClick}
            className="text-left rounded-[22px] bg-white flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full cursor-pointer border border-gray-100 p-3 gap-3"
        >
            {/* ── Inner card abu-abu ── */}
            <div
                className="relative rounded-[14px] overflow-hidden p-4 flex flex-col gap-3"
                style={{ background: '#efefef' }}
            >
                {/* Donat ring abu */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        border: '34px solid #c8c8c8',
                        background: 'transparent',
                        top: -90,
                        right: -90,
                        opacity: 0.75,
                    }}
                />

                {/* Week badge + menu */}
                <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-500">
                        Week {course.week}
                    </span>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>

                {/* Title */}
                <h3 className="relative z-10 text-[15px] font-bold text-gray-700 leading-snug">
                    {course.title}
                </h3>

                {/* Meta */}
                <div className="relative z-10 flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />60 minutes</span>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course.modules} modules</span>
                </div>

                {/* Description */}
                <p className="relative z-10 text-xs text-gray-500 leading-relaxed line-clamp-2 text-justify">
                    {course.description || `Materi pembelajaran mandiri untuk ${course.title} pada Minggu ke-${course.week}.`}
                </p>

                {/* Prerequisite */}
                <div className="relative z-10 mt-1">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Selesaikan{' '}
                        <span className="font-bold text-gray-700">
                            "{course.prerequisite || 'Course sebelumnya'}"
                        </span>
                        {' '}Untuk Membuka Materials.
                    </p>
                </div>
            </div>

            {/* ── Footer — bagian putih luar ── */}
            <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-500">
                    Status: <span className="font-bold text-gray-600">Locked</span>
                </span>
                <div className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400">
                    <Lock className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
}


// ─── Course Detail Modal ───────────────────────────────────────────────────────

function CourseModal({ course, onClose }) {
    if (!course) return null;
    const navigate = useNavigate();

    const handleOpenMaterial = (material) => {
        const url = material.file_url
            || (material.file
                ? (material.file.startsWith('http') ? material.file : `http://127.0.0.1:8000${material.file}`)
                : null);
        if (!url) return;

        const fileType = (material.file_type || material.type || 'pdf').toLowerCase();
        const params = new URLSearchParams({
            url: url,
            title: material.title || 'Materi',
            type: fileType,
        });
        navigate(`/dashboard/material?${params.toString()}`);
        onClose();
    };


    const isLocked = course.status === 'locked';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-white w-full max-w-[480px] rounded-[28px] shadow-2xl flex flex-col"
                style={{ animation: 'scaleIn 0.2s ease-out', maxHeight: 'min(90vh, 700px)' }}
            >

                {/* Header */}
                <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <span className="text-xs font-semibold text-gray-400 mb-1 block">Week {course.week}</span>
                            <h2 className="text-lg font-bold text-gray-900 leading-snug">{course.title}</h2>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration} minutes</span>
                                <span>|</span>
                                <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course.modules} modules</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-7 py-5 flex flex-col gap-4"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>

                    {/* Materials List */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Materi Pembelajaran</h4>
                        <div className="flex flex-col gap-2">
                            {course.materials.map((mat, idx) => {
                                const fileType = (mat.file_type || mat.type || 'pdf').toLowerCase();
                                const isPPT = fileType === 'ppt' || fileType === 'pptx';
                                const fileUrl = mat.file_url
                                    || (mat.file
                                        ? (mat.file.startsWith('http') ? mat.file : `http://127.0.0.1:8000${mat.file}`)
                                        : null);

                                const handleClick = () => {
                                    if (isLocked || !fileUrl) return;
                                    if (isPPT) {
                                        // PPT → langsung download
                                        const a = document.createElement('a');
                                        a.href = fileUrl;
                                        a.download = mat.title || 'materi';
                                        a.target = '_blank';
                                        a.rel = 'noopener noreferrer';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    } else {
                                        // PDF → buka di iframe viewer
                                        handleOpenMaterial(mat);
                                    }
                                };

                                return (
                                    <button
                                        key={mat.id}
                                        onClick={handleClick}
                                        disabled={isLocked}
                                        className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 w-full
                                            ${isLocked
                                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                                : isPPT
                                                    ? 'border-gray-100 bg-white hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer'
                                                    : 'border-gray-100 bg-white hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
                                            }`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                                            ${isLocked
                                                ? 'bg-gray-100 text-gray-400'
                                                : isPPT
                                                    ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                                                    : 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'
                                            }`}>
                                            {isPPT
                                                ? <Layers className="w-5 h-5" />
                                                : <FileText className="w-5 h-5" />
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold leading-snug truncate
                                                ${isLocked ? 'text-gray-400'
                                                    : isPPT ? 'text-gray-800 group-hover:text-orange-700'
                                                        : 'text-gray-800 group-hover:text-blue-700'}`}>
                                                {idx + 1}. {mat.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <span>{fileType.toUpperCase()}</span>
                                                {fileUrl
                                                    ? isPPT
                                                        ? <span className="text-orange-400 font-medium">· Klik untuk unduh</span>
                                                        : <span className="text-blue-400 font-medium">· Ada file</span>
                                                    : <span>· Belum ada file</span>
                                                }
                                            </p>
                                        </div>

                                        {/* Trailing icon */}
                                        {isLocked
                                            ? <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                            : isPPT
                                                ? <Download className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
                                                : <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                                        }
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quiz section header */}
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Quiz</h4>

                    {/* Quiz button */}
                    <button
                        disabled={isLocked}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 w-full
                            ${isLocked
                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                : 'border-purple-100 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                            ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-500 group-hover:bg-purple-500 group-hover:text-white'}`}>
                            <Brain className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${isLocked ? 'text-gray-400' : 'text-gray-800 group-hover:text-purple-800'}`}>
                                Quiz Asah Otak
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Uji pemahamanmu lewat kuis interaktif</p>
                        </div>
                        {isLocked
                            ? <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            : <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                        }
                    </button>
                </div>

                {/* Sticky footer */}
                <div className="px-7 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-sm font-semibold text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                        Tutup
                    </button>
                </div>

            </div>

            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);   }
                }
            `}</style>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Modules() {
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // Ambil SEMUA course (active + inactive) karena frontend perlu keduanya untuk tabs
            // Endpoint /courses/ hanya return active, jadi kita pakai /admin/courses/
            // Tapi untuk student, kita tetap pakai /courses/ dan tampilkan is_active dari response
            const res = await api.get('/courses/');
            const enriched = res.data.map((course) => ({
                ...course,
                // Status langsung dari field is_active di database
                status: course.is_active ? 'active' : 'locked',
                progress: course.is_active ? 50 : 0,   // placeholder — bisa diganti enrollment progress nanti
                week: getWeek(course),
                modules: course.materials_count ?? course.materials?.length ?? 0,
            }));
            setCourses(enriched);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoading(false);
        }
    };


    const tabCounts = {
        active: courses.filter(c => c.status === 'active').length,
        finished: courses.filter(c => c.status === 'finished').length,
        locked: courses.filter(c => c.status === 'locked').length,
        archived: courses.filter(c => c.status === 'archived').length,
    };

    let displayed = courses.filter(c => c.status === activeTab);
    if (searchQuery) {
        displayed = displayed.filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    let activeCardIdx = 0;

    return (
        <div className="max-w-[1400px] mx-auto pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">Lesson Materials</h1>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Materials..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-48 text-gray-600 placeholder-gray-400"
                        />
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-colors">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Weeks</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-colors">
                        <CheckSquare className="w-4 h-4 text-gray-400" />
                        <span>Status</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <div className="flex items-center border border-gray-200 rounded-full bg-white overflow-hidden">
                        <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-1 mb-6 flex-wrap">
                {TABS.map(tab => {
                    const count = tabCounts[tab.countKey] ?? 0;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150
                                ${isActive ? 'bg-white border-2 border-gray-200 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-100 border-2 border-transparent'}`}
                        >
                            <span className={isActive && tab.id === 'active' ? 'text-orange-500' : ''}>{tab.label}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive && tab.id === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Grid ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-400" />
                    <p className="font-semibold text-sm">Memuat materi...</p>
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Layers className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-semibold">Tidak ada course ditemukan</p>
                </div>
            ) : (
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 max-w-2xl'}`}>
                    {displayed.map(course => {
                        if (course.status === 'active') {
                            const idx = activeCardIdx++;
                            return (
                                <ActiveCard key={course.id} course={course} themeIndex={idx} onClick={() => setSelectedCourse(course)} />
                            );
                        }
                        return (
                            <LockedCard key={course.id} course={course} onClick={() => setSelectedCourse(course)} />
                        );
                    })}
                </div>
            )}

            {/* ── Course Detail Modal ── */}
            {selectedCourse && (
                <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
            )}
        </div>
    );
}
