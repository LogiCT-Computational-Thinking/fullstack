import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ChevronDown, Calendar, CheckSquare, LayoutGrid,
    List, Clock, Layers, MoreHorizontal, Lock, Play,
    X, Brain, ChevronRight, FileText, Loader2, Download,
    Send, Bot, User, Sparkles, Lightbulb, RotateCcw, ArrowLeft
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
    { id: 'all', label: 'All', countKey: 'all' },
    { id: 'active', label: 'Active Materials', countKey: 'active' },
    { id: 'finished', label: 'Finished', countKey: 'finished' },
];

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
                className="relative rounded-[14px] overflow-hidden p-4 flex flex-col gap-3 flex-1"
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
                <h3 className="relative z-10 text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 h-[40px]">
                    {course.title}
                </h3>

                {/* Meta */}
                <div className="relative z-10 flex items-center gap-2 text-gray-600 text-xs font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />60 minutes</span>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course.modules} modules</span>
                </div>

                {/* Description */}
                <p className="relative z-10 text-xs text-gray-500 leading-relaxed line-clamp-2 h-[40px] text-justify">
                    {course.description || `Materi pembelajaran mandiri untuk ${course.title} pada Minggu ke-${course.week}.`}
                </p>

                {/* Progress bar */}
                <div className="relative z-10 mt-auto">
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
                    Status: <span className="font-bold text-gray-800">
                        {course.progress === 100 ? 'Finished' : 'On Progress'}
                    </span>
                </span>
                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all
                    ${course.progress === 100 ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}>
                    {course.progress === 100 ? (
                        <>
                            <CheckSquare className="w-3 h-3 text-white" />
                            Completed
                        </>
                    ) : (
                        <>
                            <Play className="w-3 h-3 fill-white" />
                            Continue
                        </>
                    )}
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
                className="relative rounded-[14px] overflow-hidden p-4 flex flex-col gap-3 flex-1"
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
                <h3 className="relative z-10 text-[15px] font-bold text-gray-700 leading-snug line-clamp-2 h-[40px]">
                    {course.title}
                </h3>

                {/* Meta */}
                <div className="relative z-10 flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />60 minutes</span>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course.modules} modules</span>
                </div>

                {/* Description */}
                <p className="relative z-10 text-xs text-gray-500 leading-relaxed line-clamp-2 h-[40px] text-justify">
                    {course.description || `Materi pembelajaran mandiri untuk ${course.title} pada Minggu ke-${course.week}.`}
                </p>

                {/* Prerequisite */}
                <div className="relative z-10 mt-auto">
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

// ─── Module Row (List View) ───────────────────────────────────────────────────

function ModuleRow({ course, onClick }) {
    const isLocked = course.status === 'locked';
    const isFinished = course.status === 'finished';

    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-6 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all w-full text-left"
        >
            {/* Week Badge */}
            <div className={`w-16 flex flex-col items-center justify-center p-2 rounded-xl flex-shrink-0 transition-colors
                ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Week</span>
                <span className="text-lg font-black leading-none">{course.week}</span>
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold leading-tight truncate mb-1
                    ${isLocked ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-700'}`}>
                    {course.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />60 mins</span>
                    <span className="text-gray-200">|</span>
                    <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{course.modules} modules</span>
                </div>
            </div>

            {/* Progress Bar (Only for active/finished) */}
            {!isLocked && (
                <div className="hidden md:block w-48 mx-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Progress</span>
                        <span className="text-[10px] font-black text-gray-800">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isFinished ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${course.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Status Badge */}
            <div className="flex-shrink-0">
                {isLocked ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold border border-gray-100">
                        <Lock className="w-3 h-3" /> Locked
                    </div>
                ) : isFinished ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[11px] font-bold border border-green-100">
                        <CheckSquare className="w-3 h-3" /> Completed
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-bold shadow-lg shadow-gray-200 group-hover:bg-blue-600 transition-colors">
                        <Play className="w-3 h-3 fill-white" /> Continue
                    </div>
                )}
            </div>

            <ChevronRight className={`w-5 h-5 ml-2 transition-transform group-hover:translate-x-1
                ${isLocked ? 'text-gray-200' : 'text-gray-300 group-hover:text-blue-400'}`}
            />
        </button>
    );
}


// ─── Asah Otak Chat Modal ──────────────────────────────────────────────────────

function AsahOtakModal({ course, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Pesan pembuka otomatis
    useEffect(() => {
        const welcome = {
            id: 1,
            role: 'assistant',
            content: `Halo! 👋 Aku siap bantu kamu memahami materi **${course.title}** (Week ${course.week}).\n\nTanya konsep, minta contoh nyata, atau minta soal latihan — semua bisa! Mau mulai dari mana? 🚀`,
            time: now(),
        };
        setMessages([welcome]);
        setTimeout(() => inputRef.current?.focus(), 300);

        // AUTO-MARK QUIZ COMPLETE
        const markQuiz = async () => {
            try {
                await api.post(`/courses/${course.id}/quiz-complete/`);
                if (window.refreshCourses) window.refreshCourses();
            } catch (err) {
                console.error("Failed to mark quiz as complete:", err);
            }
        };
        markQuiz();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const simulateReply = (userMsg) => {
        // Placeholder — ganti dengan LLM API call saat backend siap
        setIsTyping(true);
        const tid = Date.now() + 1;
        setMessages(prev => [...prev, { id: tid, role: 'assistant', typing: true, time: '' }]);
        setTimeout(() => {
            const replies = [
                `Pertanyaan bagus! 🎯 Dalam konteks "${course.title}", konsep ini sangat fundamental.\n\n_(Jawaban AI akan muncul setelah integrasi LLM backend)_`,
                `Tentu! Mari kita bahas step by step.\n\nDalam materi Week ${course.week} ini...\n\n_(Mode demo — LLM belum terkoneksi)_`,
                `Pertanyaanmu tepat! 💡 Untuk memahami ini lebih dalam...\n\n_(LLM integration coming soon)_`,
            ];
            setMessages(prev => prev
                .filter(m => m.id !== tid)
                .concat({ id: tid, role: 'assistant', content: replies[Math.floor(Math.random() * replies.length)], time: now() })
            );
            setIsTyping(false);
        }, 1800);
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text || isTyping) return;
        setInput('');
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text, time: now() }]);
        simulateReply(text);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const SUGGESTIONS = [
        '💡 Jelaskan konsep utama materi ini',
        '🧩 Berikan contoh nyata',
        '📝 Buatkan soal latihan',
    ];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div
                className="relative bg-white w-full max-w-[520px] flex flex-col rounded-[28px] shadow-2xl overflow-hidden"
                style={{ height: 'min(88vh, 680px)', animation: 'scaleIn 0.2s ease-out' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-purple-50 to-violet-50">
                    <button onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-white/80 text-gray-400 transition-colors flex-shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                        <Brain className="w-4.5 h-4.5 text-white w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-none">Quiz Asah Otak</p>
                        <p className="text-[11px] text-violet-500 mt-0.5 truncate font-medium">
                            <Sparkles className="w-3 h-3 inline mr-0.5" />
                            Week {course.week} · {course.title}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/80 text-gray-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
                    style={{ background: 'linear-gradient(180deg,#faf8ff 0%,#f5f3ff 100%)', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>

                    {messages.map(msg => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={msg.id} className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                                style={{ animation: 'fadeInMsg 0.2s ease-out' }}>
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm
                                    ${isUser ? 'bg-gray-900' : 'bg-gradient-to-br from-violet-500 to-purple-600'}`}>
                                    {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className={`max-w-[75%] flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2.5 rounded-[16px] text-sm leading-relaxed shadow-sm
                                        ${isUser
                                            ? 'bg-gray-900 text-white rounded-br-sm'
                                            : 'bg-white border border-purple-100 text-gray-800 rounded-bl-sm'}`}>
                                        {msg.typing ? (
                                            <div className="flex items-center gap-1 py-0.5">
                                                {[0, 1, 2].map(i => (
                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                                                        style={{ animation: `typingB 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                                        )}
                                    </div>
                                    {!msg.typing && <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Quick suggestions (hanya di awal sesi) */}
                {messages.length <= 1 && (
                    <div className="px-5 py-2.5 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-purple-50"
                        style={{ scrollbarWidth: 'none' }}>
                        {SUGGESTIONS.map((s, i) => (
                            <button key={i} onClick={() => { setInput(s.replace(/^[^a-zA-Z]+/, '')); inputRef.current?.focus(); }}
                                className="flex-shrink-0 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-100 hover:border-purple-300 transition-all active:scale-95 whitespace-nowrap">
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="flex-shrink-0 px-5 py-4 bg-white border-t border-gray-100">
                    <div className="flex items-end gap-2.5 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2.5
                        focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-md focus-within:shadow-violet-500/10 transition-all">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Tanya sesuatu tentang materi ini..."
                            disabled={isTyping}
                            rows={1}
                            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none leading-relaxed disabled:opacity-50"
                            style={{ maxHeight: 100 }}
                            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                        />
                        <button onClick={handleSend} disabled={!input.trim() || isTyping}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-[12px] bg-gray-900 text-white hover:bg-violet-600 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Enter kirim · Shift+Enter baris baru
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes typingB { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-3px);opacity:1} }
                @keyframes fadeInMsg { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
            `}</style>
        </div>
    );
}

// ─── Course Detail Modal ───────────────────────────────────────────────────────

function CourseModal({ course, onClose }) {
    if (!course) return null;
    const navigate = useNavigate();
    const [showAsahOtak, setShowAsahOtak] = useState(false);

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

                                const handleClick = async () => {
                                    if (isLocked || !fileUrl) return;

                                    // Auto-mark as complete
                                    try {
                                        await api.post(`/materials/${mat.id}/complete/`);
                                        // Update local data atau fetch ulang bisa dilakukan di sini.
                                        // Untuk ux paling simpel, kita fetch ulang daftar course agar progress bar update.
                                        if (window.refreshCourses) window.refreshCourses();
                                    } catch (err) {
                                        console.error("Failed to mark material as complete:", err);
                                    }

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
                        onClick={() => !isLocked && setShowAsahOtak(true)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 w-full
                            ${isLocked
                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                : 'border-purple-100 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 cursor-pointer active:scale-[.99]'
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
                            <p className="text-xs text-gray-400 mt-0.5">Diskusi & latihan soal bersama AI Tutor</p>
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

            {/* Asah Otak modal (z-index lebih tinggi dari course modal) */}
            {showAsahOtak && (
                <AsahOtakModal course={course} onClose={() => setShowAsahOtak(false)} />
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Modules() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [filterWeek, setFilterWeek] = useState('ALL');
    const [showWeekDropdown, setShowWeekDropdown] = useState(false);

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
                // Status: locked jika is_active false, finished jika progress 100, else active
                status: !course.is_active ? 'locked' : (course.progress === 100 ? 'finished' : 'active'),
                // progress sekarang real dari backend
                progress: course.progress || 0,
                modules: course.materials_count ?? course.materials?.length ?? 0,
            }));
            setCourses(enriched);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoading(false);
        }
    };

    // Ekspos fetchCourses ke window agar bisa dipanggil dari child component/modal jika perlu
    useEffect(() => {
        window.refreshCourses = fetchCourses;
        return () => { delete window.refreshCourses; };
    }, []);


    const tabCounts = {
        all: courses.length,
        active: courses.filter(c => c.status === 'active').length,
        finished: courses.filter(c => c.status === 'finished').length,
    };

    let displayed = activeTab === 'all' ? courses : courses.filter(c => c.status === activeTab);

    // Applying filters
    if (filterWeek !== 'ALL') {
        displayed = displayed.filter(c => c.week === parseInt(filterWeek));
    }

    if (searchQuery) {
        displayed = displayed.filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Unique weeks for dropdown
    const availableWeeks = [...new Set(courses.map(c => c.week))].sort((a, b) => a - b);

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

                    {/* Week Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowWeekDropdown(!showWeekDropdown)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-full transition-colors active:scale-95
                                ${filterWeek !== 'ALL'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Calendar className={`w-4 h-4 ${filterWeek !== 'ALL' ? 'text-white' : 'text-gray-400'}`} />
                            <span>{filterWeek === 'ALL' ? 'Weeks' : `Week ${filterWeek}`}</span>
                            <ChevronDown className={`w-3.5 h-3.5 ${filterWeek !== 'ALL' ? 'text-white' : 'text-gray-400'} transition-transform ${showWeekDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showWeekDropdown && (
                            <div className="absolute top-11 left-0 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { setFilterWeek('ALL'); setShowWeekDropdown(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 transition-colors ${filterWeek === 'ALL' ? 'text-blue-600' : 'text-gray-600'}`}
                                >
                                    All Weeks
                                </button>
                                {availableWeeks.map(week => (
                                    <button
                                        key={week}
                                        onClick={() => { setFilterWeek(week.toString()); setShowWeekDropdown(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 transition-colors ${filterWeek === week.toString() ? 'text-blue-600' : 'text-gray-600'}`}
                                    >
                                        Week {week}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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

            {/* ── Grid/List Display ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-400" />
                    <p className="font-semibold text-sm">Memuat materi...</p>
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Layers className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-semibold">Tidak ada course ditemukan</p>
                    {filterWeek !== 'ALL' && (
                        <button
                            onClick={() => setFilterWeek('ALL')}
                            className="text-xs text-blue-600 font-bold mt-2 hover:underline"
                        >
                            Reset Filter Week
                        </button>
                    )}
                </div>
            ) : (
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 w-full'}`}>
                    {displayed.map(course => {
                        if (viewMode === 'list') {
                            return <ModuleRow key={course.id} course={course} onClick={() => setSelectedCourse(course)} />;
                        }

                        // Grid Mode
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
