import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ChevronDown, ChevronUp, Calendar, CheckSquare, LayoutGrid,
    List, Clock, Layers, MoreHorizontal, Lock, Play, Pin,
    X, Brain, ChevronRight, FileText, Loader2, Download,
    Send, Bot, User, Sparkles, Lightbulb, RotateCcw, ArrowLeft, CheckCircle2
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

function ActiveCard({ course, themeIndex, onClick, onClickPin }) {
    const t = CARD_THEMES[themeIndex % CARD_THEMES.length];

    return (
        <div
            onClick={onClick}
            className="text-left rounded-[22px] bg-white flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full cursor-pointer border border-gray-100 p-3 gap-3"
        >
            {/* ── Inner card berwarna ── */}
            <div
                className="relative rounded-[14px] overflow-hidden p-4 flex flex-col gap-3 flex-1"
                style={{ background: t.cardBg }}
            >
                {/* Donat ring yang lebih subtle (Match List View) */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: 280,
                        height: 280,
                        borderRadius: '50%',
                        border: `60px solid ${t.quarterColor}`,
                        background: 'transparent',
                        top: -120,
                        right: -120,
                        opacity: 0.35,
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
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            if (onClickPin) onClickPin(course.id);
                        }}
                        className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all cursor-pointer"
                        title={course.is_pinned ? "Unpin this course" : "Pin this course"}
                    >
                        <Pin 
                            className={`w-3.5 h-3.5 transition-all
                                ${course.is_pinned 
                                    ? 'text-black fill-black' 
                                    : 'text-gray-400 opacity-60'}`} 
                        />
                    </button>
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

                {/* Industrial Progress bar (Match List View) */}
                <div className="relative z-10 mt-auto">
                    <div className="flex justify-between items-center mb-1.5 px-0.5">
                        <span className="text-[11px] text-gray-400 font-medium">Progress</span>
                        <span className="text-[11px] font-bold text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="w-full h-[6px] rounded-full bg-black/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-black transition-all duration-700 shadow-sm"
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
                
                {course.progress < 100 && (
                    <div className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black bg-black text-white transition-all shadow-md hover:scale-105 active:scale-95">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Continue
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Locked Card ──────────────────────────────────────────────────────────────

function LockedCard({ course, onClick }) {
    return (
        <div
            onClick={onClick}
            className="text-left rounded-[22px] bg-white flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full cursor-pointer border border-gray-100 p-3 gap-3"
        >
            {/* ── Inner card abu-abu ── */}
            <div
                className="relative rounded-[14px] overflow-hidden p-4 flex flex-col gap-3 flex-1"
                style={{ background: '#efefef' }}
            >
                {/* Donat ring abu (Match List View) */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: 280,
                        height: 280,
                        borderRadius: '50%',
                        border: '60px solid #c8c8c8',
                        background: 'transparent',
                        top: -120,
                        right: -120,
                        opacity: 0.35,
                    }}
                />

                {/* Week badge + menu */}
                <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-500">
                        Week {course.week}
                    </span>
                    <div 
                        className="p-1.5 rounded-lg border border-gray-100 bg-gray-50 opacity-40 flex items-center justify-center cursor-not-allowed"
                        title="Materi masih terkunci"
                    >
                        <Pin className="w-3 h-3 text-gray-400/70" />
                    </div>
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
        </div>
    );
}

// ─── Module Row (List View) ───────────────────────────────────────────────────

function ModuleRow({ course, themeIndex, onClick, onClickPin }) {
    const t = CARD_THEMES[(themeIndex || 0) % CARD_THEMES.length];

    const isLocked = course.status === 'locked';
    const isFinished = course.status === 'finished';

    // Grid View colors for Locked: bg #efefef, ring #c8c8c8
    // Grid View colors for Active: t.cardBg, ring t.quarterColor
    const cardBg = isLocked ? '#efefef' : t.cardBg;
    const ringColor = isLocked ? '#c8c8c8' : t.quarterColor;
    const badgeBg = isLocked ? '#e5e7eb' : t.badgeBg;
    const badgeText = isLocked ? '#6b7280' : t.badgeText;
    
    return (
        <div 
            onClick={onClick}
            className="group bg-white border border-gray-100/80 rounded-[28px] p-2 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all w-full text-left flex cursor-pointer mb-2"
        >
            <div 
                className="relative rounded-[20px] overflow-hidden p-6 w-full flex flex-col md:flex-row items-center gap-6"
                style={{ backgroundColor: cardBg }}
            >
                {/* Background Ornaments */}
                <div className="absolute right-0 top-0 h-full w-full pointer-events-none overflow-hidden">
                     {/* Donut Shape */}
                     <div 
                         className="absolute right-[120px] md:right-[220px] -top-[260px] w-[400px] h-[400px] rounded-full opacity-[0.35]"
                         style={{ border: `80px solid ${ringColor}` }}
                     />
                     
                     {/* Completion Watermark (Seal/Badge Icon) */}
                     {isFinished && (
                         <svg className="absolute right-4 -bottom-8 w-28 h-28 opacity-[0.2]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M59.7406 12.2958C54.9969 7.54318 52.6206 5.17578 49.6747 5.17578C46.7288 5.17578 44.3525 7.54763 39.6089 12.2958C36.7609 15.1438 33.9396 16.461 29.8812 16.461C26.339 16.461 21.2927 15.7757 18.5248 18.5658C15.7747 21.3382 16.46 26.3622 16.46 29.8821C16.46 33.9405 15.1383 36.7618 12.2903 39.6098C7.54665 44.3535 5.1748 46.7298 5.1748 49.6757C5.1748 52.6216 7.54665 54.9979 12.2948 59.7416C15.481 62.9322 16.46 64.9926 16.46 69.4693C16.46 73.0115 15.7747 78.0578 18.5648 80.8257C21.3372 83.5713 26.3612 82.8905 29.8812 82.8905C34.2021 82.8905 36.2892 83.736 39.373 86.8198C41.9985 89.4453 45.5184 94.1757 49.6747 94.1757C53.831 94.1757 57.351 89.4453 59.9765 86.8198C63.0648 83.736 65.1474 82.8905 69.4683 82.8905C72.9883 82.8905 78.0123 83.5758 80.7846 80.8257M80.7846 80.8257C83.5748 78.0578 82.8895 73.0115 82.8895 69.4693C82.8895 64.9926 83.8685 62.9322 87.0547 59.7416C91.8028 54.9979 94.1747 52.6216 94.1747 49.6757C94.1747 46.7298 91.8028 44.3535 87.0591 39.6098M80.7846 80.8257H80.8247" stroke={t.badgeText} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                             <path d="M31.874 42.1463C31.874 42.1463 41.8865 40.7757 49.674 58.5757C49.674 58.5757 72.1865 14.0758 94.1739 5.17578" stroke={t.badgeText} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                     )}
                </div>

                {/* Pin Icon with white background box (Top Right) */}
                <div className="absolute right-4 top-4 md:right-6 md:top-6 z-50 pointer-events-auto">
                    <button 
                        type="button"
                        disabled={isLocked}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            if (!isLocked && onClickPin) onClickPin(course.id);
                        }}
                        className={`p-2 rounded-lg border shadow-sm flex items-center justify-center transition-all
                            ${isLocked 
                                ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-50'
                                : 'bg-white border-gray-100 hover:bg-gray-50 active:scale-90 cursor-pointer'}`}
                        title={isLocked ? "Materi masih terkunci" : (course.is_pinned ? "Unpin this course" : "Pin this course")}
                    >
                        <Pin 
                            className={`w-3.5 h-3.5 transition-all
                                ${course.is_pinned 
                                    ? 'text-black fill-black' 
                                    : (isLocked ? 'text-gray-400/30' : 'text-gray-400/80')}`} 
                        />
                    </button>
                </div>

                <div className="relative z-10 flex w-full items-center gap-6">
                    <div className="flex flex-1 flex-col">
                        <div className="flex justify-between items-start w-full relative">
                            <div className="flex-1 pr-4 md:pr-12">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className={`text-[19px] font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900'} leading-snug`}>
                                        {course.title}
                                    </h3>
                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: badgeBg, color: badgeText }}>
                                        Week {course.week}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium mb-4">
                                    <Clock className="w-3.5 h-3.5" /> {course.duration || '60'} minutes
                                    <span className="text-gray-300">|</span>
                                    <Layers className="w-3.5 h-3.5" /> {course.modules} modules
                                </div>
                            </div>
    
                            {/* Percentage Value */}
                            <div className="flex flex-col items-end self-stretch justify-end">
                                 <div className="text-[32px] font-light text-gray-900 leading-none mb-1">
                                    {isFinished ? '100' : (course.progress || 0)}%
                                 </div>
                            </div>
                        </div>
    
                        {/* Industrial Style Progress Bar */}
                        <div className="w-full bg-black/5 rounded-full h-[6px] relative z-20 overflow-hidden mt-3">
                            <div 
                                className="h-full rounded-full transition-all duration-700 bg-black"
                                style={{ width: `${isFinished ? '100' : (course.progress || 0)}%` }} 
                            />
                        </div>
                    </div>
    
                    {/* Action Area (Consistent width for bar alignment) */}
                    <div className="flex-shrink-0 ml-0 md:ml-4 self-end">
                        {!isFinished ? (
                            <button className="px-10 py-2.5 rounded-full text-[13px] font-black bg-black text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/15 mb-[1px] w-full md:w-auto">
                                Continue
                            </button>
                        ) : (
                            <div className="w-[148px] hidden md:block" /> /* Placeholder width matching the button area */
                        )}
                    </div>
                </div>
            </div>
        </div>
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
                        disabled={isLocked || (course.quiz_is_active === false)}
                        onClick={() => !(isLocked || (course.quiz_is_active === false)) && navigate(`/dashboard/quiz/${course.id}`, { state: { courseTitle: course.title, courseWeek: course.week } })}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 w-full
                            ${(isLocked || (course.quiz_is_active === false))
                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                : 'border-purple-100 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50 cursor-pointer active:scale-[.99]'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                            ${(isLocked || (course.quiz_is_active === false)) ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-500 group-hover:bg-purple-500 group-hover:text-white'}`}>
                            <Brain className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${(isLocked || (course.quiz_is_active === false)) ? 'text-gray-400' : 'text-gray-800 group-hover:text-purple-800'}`}>
                                Quiz Asah Otak
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Diskusi & latihan soal bersama AI Tutor</p>
                        </div>
                        {(isLocked || (course.quiz_is_active === false))
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
    const [collapsed, setCollapsed] = useState({
        active: false,
        locked: false,
        finished: false
    });

    const toggleSection = (key) => {
        setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePinToggle = (courseId) => {
        setCourses(prev => prev.map(c => 
            c.id === courseId ? { ...c, is_pinned: !c.is_pinned } : c
        ));
    };

    // Filter states
    const [filterWeek, setFilterWeek] = useState('ALL');
    const [showWeekDropdown, setShowWeekDropdown] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/courses/');
            // Filter out inactive courses completely
            const activeCourses = res.data.filter(course => course.is_active);
            
            const enriched = activeCourses.map((course) => ({
                ...course,
                status: course.progress === 100 ? 'finished' : 'active',
                modules: course.materials_count ?? course.materials?.length ?? 0,
                duration: 60,
                is_pinned: false,
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

    // Sort by Status Group (Active -> Locked -> Finished) and then Pin priority
    const statusWeight = { 'active': 0, 'locked': 1, 'finished': 2 };
    displayed = [...displayed].sort((a, b) => {
        if (a.status !== b.status) {
            return statusWeight[a.status] - statusWeight[b.status];
        }
        return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
    });

    // Unique weeks for dropdown
    const availableWeeks = [...new Set(courses.map(c => c.week))].sort((a, b) => a - b);

    let activeCardIdx = 0;

    return (
        <div className="w-full pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>

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

            {/* ── Tabs (Grid Only) ── */}
            {viewMode === 'grid' && (
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
            )}

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
                </div>
            ) : viewMode === 'list' ? (
                <div className="flex flex-col gap-8 w-full">
                    {/* Section: Continue Learning */}
                    {courses.filter(c => c.status === 'active').length > 0 && (
                        <div className="flex flex-col gap-4">
                            <div 
                                className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2 cursor-pointer group"
                                onClick={() => toggleSection('active')}
                            >
                                <h2 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-blue-600">Continue Learning</h2>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${collapsed.active ? '-rotate-90' : ''}`} />
                            </div>
                            {!collapsed.active && (
                                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {courses
                                        .filter(c => c.status === 'active')
                                        .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                                        .map((course, i) => (
                                            <ModuleRow key={course.id} course={course} themeIndex={i} onClick={() => setSelectedCourse(course)} onClickPin={handlePinToggle} />
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section: Locked Materials */}
                    {courses.filter(c => c.status === 'locked').length > 0 && (
                        <div className="flex flex-col gap-4">
                            <div 
                                className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2 cursor-pointer group"
                                onClick={() => toggleSection('locked')}
                            >
                                <h2 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-blue-600">Locked Materials</h2>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${collapsed.locked ? '-rotate-90' : ''}`} />
                            </div>
                            {!collapsed.locked && (
                                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {courses
                                        .filter(c => c.status === 'locked')
                                        .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                                        .map((course, i) => (
                                            <ModuleRow key={course.id} course={course} themeIndex={i} onClick={() => setSelectedCourse(course)} onClickPin={handlePinToggle} />
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section: Completed Materials */}
                    {courses.filter(c => c.status === 'finished').length > 0 && (
                        <div className="flex flex-col gap-4">
                            <div 
                                className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2 cursor-pointer group"
                                onClick={() => toggleSection('finished')}
                            >
                                <h2 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-blue-600">Completed Materials</h2>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${collapsed.finished ? '-rotate-90' : ''}`} />
                            </div>
                            {!collapsed.finished && (
                                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {courses
                                        .filter(c => c.status === 'finished')
                                        .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                                        .map((course, i) => (
                                            <ModuleRow key={course.id} course={course} themeIndex={i} onClick={() => setSelectedCourse(course)} onClickPin={handlePinToggle} />
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                    {displayed.map(course => {
                        const isUnlocked = course.status !== 'locked';
                        const tIdx = isUnlocked ? activeCardIdx++ : 0;
                        if (isUnlocked) {
                            return (
                                <ActiveCard key={course.id} course={course} themeIndex={tIdx} onClick={() => setSelectedCourse(course)} onClickPin={handlePinToggle} />
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
