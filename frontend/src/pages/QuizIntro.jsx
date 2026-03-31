import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Brain, Clock, Play } from 'lucide-react';
import api from '../services/api';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_LAST_WEEK = {
    title: 'Pengenalan Computational Thinking',
    score: 80,
    maxScore: 100,
    correctAnswers: 4,
    totalQuestions: 5,
    timeTaken: '18m 37s',
};

// ─── Avatar Initials ──────────────────────────────────────────────────────────

function Avatar({ name, size = 34 }) {
    const COLORS = ['#5b87f5', '#34c98a', '#a78bfa', '#f59e0b', '#f87171', '#22d3ee', '#f472b6', '#4ade80'];
    const initials = (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const color = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.36),
            fontFamily: font,
        }}>
            {initials}
        </div>
    );
}

// ─── Circular Score Progress ──────────────────────────────────────────────────

function CircularScore({ score, max = 100 }) {
    const S = 120, W = 11;
    const r = (S - W * 2) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(100, (score / max) * 100);
    const dash = circ - (pct / 100) * circ;
    const cx = S / 2, cy = S / 2;
    return (
        <div style={{ position: 'relative', width: S, height: S, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={S} height={S} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cy} r={r} stroke="#e9ecef" strokeWidth={W} fill="none" />
                <circle
                    cx={cx} cy={cy} r={r}
                    stroke="#22c55e"
                    strokeWidth={W}
                    fill="none"
                    strokeDasharray={circ}
                    strokeDashoffset={dash}
                    strokeLinecap="round"
                />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center', lineHeight: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'black' }}>{score}</div>
                <div style={{ fontSize: 10.5, color: 'black', fontWeight: 500, marginTop: 2 }}>Skor: /{max}</div>
            </div>
        </div>
    );
}

// ─── Semi-Circle 0% Gauge ─────────────────────────────────────────────────────

function SemiGauge({ size = 140, percentage = 0 }) {
    const W = 18, r = (size - W * 2) / 2;
    const cx = size / 2, cy = r + W / 2;
    const toP = (deg) => {
        const rad = (deg * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const s = toP(180), e = toP(0);
    const arcD = `M ${s.x},${s.y} A ${r},${r} 0 0 1 ${e.x},${e.y}`;
    const circ = Math.PI * r;
    const offset = circ - (percentage / 100) * circ;
    const svgH = cy + W / 2 + 4;
    return (
        <div style={{ position: 'relative', width: size, height: svgH, display: 'flex', justifyContent: 'center' }}>
            <svg width={size} height={svgH} style={{ overflow: 'visible', display: 'block' }}>
                <path d={arcD} stroke="#e5e7eb" strokeWidth={W} fill="none" strokeLinecap="round" />
                <path 
                    d={arcD} 
                    stroke="#22c55e" 
                    strokeWidth={W} 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
            </svg>
            <span style={{
                position: 'absolute',
                top: cy - 5,
                fontSize: 22,
                fontWeight: 900,
                color: 'black',
                fontFamily: font,
                lineHeight: 1
            }}>{Math.round(percentage)}%</span>
        </div>
    );
}

// ─── Time Remaining ───────────────────────────────────────────────────────────

function useTimeRemaining(targetDate) {
    const calc = () => {
        const now = new Date();
        let end;
        
        if (targetDate) {
            end = new Date(targetDate);
        } else {
            end = new Date(now);
            const dayOfWeek = now.getDay();
            const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
            end.setDate(now.getDate() + daysUntilSunday);
            end.setHours(23, 59, 59, 999);
        }

        const diff = end - now;
        if (diff <= 0) return "Selesai / Deadline Lewat";

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        
        let res = "";
        if (d > 0) res += `${d} hari `;
        if (h > 0 || d > 0) res += `${h} jam `;
        res += `${m} menit`;
        return res;
    };

    const [time, setTime] = useState(calc());

    useEffect(() => {
        // Update immediately when targetDate changes
        setTime(calc());
        
        const t = setInterval(() => setTime(calc()), 60000);
        return () => clearInterval(t);
    }, [targetDate]);

    return time;
}

// ─── Helper: format score ─────────────────────────────────────────────────────

const fmtScore = (n) => n.toLocaleString('id-ID');

const font = "'Outfit', sans-serif";

export default function QuizIntro() {
    const { courseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [currentCourse, setCurrentCourse] = useState(location.state || null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [lastWeekData, setLastWeekData] = useState(null);
    const [loadingLastWeek, setLoadingLastWeek] = useState(true);
    const [currentResult, setCurrentResult] = useState(null);
    const [quizMeta, setQuizMeta] = useState(null);

    const timeLeft = useTimeRemaining(quizMeta?.deadline);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingLeaderboard(true);
            setLoadingLastWeek(true);
            try {
                // Fetch Leaderboard
                const lbRes = await api.get(`/courses/${courseId}/leaderboard/`);
                setLeaderboard(lbRes.data.leaderboard || []);

                // Fetch Current Result
                try {
                    const currentRes = await api.get(`/courses/${courseId}/quiz-result/`);
                    setCurrentResult(currentRes.data);
                } catch (err) {
                    setCurrentResult(null);
                }

                // Fetch Quiz Meta (Deadline, etc)
                try {
                    const quizRes = await api.get(`/courses/${courseId}/quiz/`);
                    setQuizMeta(quizRes.data);
                } catch (err) {
                    console.log('No quiz meta found.');
                }

                // Fetch Courses to find week and last week
                const coursesRes = await api.get('/courses/');
                const allCourses = coursesRes.data;
                
                let activeWeek = parseInt(currentCourse?.courseWeek);
                let activeTitle = currentCourse?.courseTitle;

                if (!activeWeek) {
                    const c = allCourses.find(item => item.id == courseId);
                    if (c) {
                        activeWeek = c.week;
                        activeTitle = c.title;
                        setCurrentCourse({ courseWeek: c.week, courseTitle: c.title });
                    }
                }

                if (activeWeek) {
                    const prevCourse = allCourses.find(c => c.week === activeWeek - 1);
                    if (prevCourse) {
                        try {
                            const resultRes = await api.get(`/courses/${prevCourse.id}/quiz-result/`);
                            setLastWeekData(resultRes.data);
                        } catch (err) {
                            console.log('No result found for previous week course.');
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoadingLeaderboard(false);
                setLoadingLastWeek(false);
            }
        };
        fetchData();
    }, [courseId]);

    const courseTitle = currentCourse?.courseTitle || 'Tantangan';
    const courseWeek = currentCourse?.courseWeek || '...';
    const totalQ = 5;

    const INSTRUCTIONS = [
        `Kuis terdiri dari ${totalQ} pertanyaan`,
        `Waktu yang diberikan untuk mengerjakan kuis adalah ${quizMeta?.time_limit ? Math.floor(quizMeta.time_limit / 60) : 30} menit`,
        'Tipe soal yang digunakan meliputi pilihan ganda, multiple answer, benar/salah, dan isian singkat',
        'Hasil kuis akan ditampilkan setelah semua soal selesai dikerjakan',
    ];
    const RULES = [
        'Pilih atau isi jawaban sesuai dengan instruksi pada setiap soal',
        'Setiap jawaban benar akan mendapatkan 1 poin',
        'Tidak ada pengurangan nilai untuk jawaban yang salah',
        'Setelah kuis dikirimkan, jawaban tidak dapat diubah kembali',
    ];

    const handleStart = () => {
        if (currentResult) {
            navigate(`/dashboard/quiz/${courseId}/result`);
        } else {
            navigate(`/quiz/${courseId}`, { state: { courseTitle, courseWeek } });
        }
    };

    // Shared font
    const font = "'Outfit', sans-serif";

    return (
        <div style={{ fontFamily: font }}>
            {/* Page Title */}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'black', margin: '0 0 20px' }}>
                Weekly Challenge
            </h2>

            {/* Two-column layout */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

                {/* ════ LEFT COLUMN — main card ════ */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/*
                      Single unified card:
                      gradient hero on top → white progress → white instructions → button
                    */}
                    <div style={{
                        borderRadius: 20,
                        overflow: 'hidden',
                        background: 'linear-gradient(to bottom, #74EBE6 0%, #D0EEEE 20%, #ffffff 60%)',
                        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                        border: '1px solid #e8ecf0',
                        minHeight: 680, // Increased minHeight to fill screen more as requested
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* ── GRADIENT HERO SECTION ── */}
                        <div style={{
                            background: 'transparent',
                            padding: '28px 28px 6px 28px', // Slightly more top/horizontal padding
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* ... (brain icon etc remains same) */}
                            <div style={{
                                position: 'absolute', top: -120, right: -80,
                                width: 330, height: 330, borderRadius: '50%',
                                padding: 60, 
                                background: 'linear-gradient(to bottom, #FFFFFF 0%, #A6FFE6 100%)',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude',
                                pointerEvents: 'none',
                                zIndex: 0,
                            }} />

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: 'linear-gradient(to bottom, #FFFFFF 0%, #A6FFE6 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                    border: '1.5px solid rgba(255,255,255,0.8)',
                                    boxShadow: '0 4px 12px rgba(8,142,140,0.12)',
                                }}>
                                    <img src="/images/Vector (1).png" alt="Brain Icon" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'black' }}>
                                        Tantangan Minggu ke-{courseWeek}
                                    </p>
                                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: 'black', lineHeight: 1.2 }}>
                                        Kuis {courseTitle}
                                    </h1>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginBottom: 24,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: '#ccfbf1',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Clock style={{ width: 16, height: 16, color: '#0d9488' }} />
                                    </div>
                                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'black' }}>
                                        Waktu tersisa dalam minggu ini: {timeLeft}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                position: 'relative',
                                zIndex: 1,
                                background: '#ffffff',
                                borderRadius: 14,
                                padding: '14px 28px 18px',
                                border: '2px solid #E4E4E7',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <SemiGauge size={140} percentage={currentResult ? 100 : 0} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: 13.5, color: 'black', fontWeight: 500 }}>
                                                Progress Anda: {currentResult ? (currentResult.totalQuestions || totalQ) : 0} dari {currentResult?.totalQuestions || totalQ} Pertanyaan Dijawab
                                            </span>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: 'black' }}>
                                                {currentResult ? (currentResult.totalQuestions || totalQ) : 0}/{currentResult?.totalQuestions || totalQ}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            {Array.from({ length: currentResult?.totalQuestions || totalQ }).map((_, i) => (
                                                <div key={i} style={{
                                                    flex: 1, height: 18, borderRadius: 9,
                                                    background: currentResult ? '#22c55e' : '#e5e7eb',
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'transparent',
                            padding: '36px 32px 20px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5px 1fr',
                            gap: 32,
                            flex: 1
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: 'black' }}>
                                    Instructions:
                                </h3>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {INSTRUCTIONS.map((item, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'black', lineHeight: 1.55 }}>
                                            <span style={{ marginTop: 7, width: 4, height: 4, borderRadius: '50%', background: 'black', flexShrink: 0, display: 'block' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ background: '#E4E4E7', width: '100%', height: '100%' }} />

                            <div>
                                <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: 'black' }}>
                                    Rules
                                </h3>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                                    {RULES.map((item, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'black', lineHeight: 1.55 }}>
                                            <span style={{ marginTop: 7, width: 4, height: 4, borderRadius: '50%', background: 'black', flexShrink: 0, display: 'block' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div style={{ background: 'transparent', padding: '16px 24px 36px', display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={handleStart}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '14px 48px',
                                    background: 'linear-gradient(to right, #143467, #0399A0)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    border: 'none',
                                    borderRadius: 50,
                                    cursor: 'pointer',
                                    fontFamily: font,
                                    letterSpacing: 0.5,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(20, 52, 103, 0.3)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.opacity = '0.9';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(20, 52, 103, 0.4)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 52, 103, 0.3)';
                                }}
                            >
                                {currentResult ? 'See My Result' : 'Start Quiz'}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ width: 420, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 18,
                        padding: '18px 18px 16px',
                        border: '1px solid #e8ecf0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.055)',
                        minHeight: 320,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L8 8H2L7 13L5 19L12 15L19 19L17 13L22 8H16L12 2Z" fill="#3b82f6" />
                            </svg>
                            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'black' }}>Last Week Quiz</span>
                        </div>

                        {loadingLastWeek ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ fontSize: 13, color: 'gray' }}>Loading last week's result...</p>
                            </div>
                        ) : lastWeekData ? (
                            <>
                                <p style={{ margin: '0 0 14px', fontSize: 12, color: 'black', fontWeight: 400 }}>
                                    {lastWeekData.courseTitle}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                                    <CircularScore score={Math.round(lastWeekData.accuracyScore)} max={100} />
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                                    <p style={{ margin: '0 0 3px', fontSize: 11.5, color: 'black' }}>
                                        Pertanyaan Benar: <strong style={{ color: 'black' }}>{lastWeekData.correctCount}/{lastWeekData.totalQuestions}</strong>
                                    </p>
                                    <p style={{ margin: 0, fontSize: 11.5, color: 'black' }}>
                                        Waktu Pengerjaan: <strong style={{ color: 'black' }}>{lastWeekData.timeSpent}</strong>
                                    </p>
                                </div>

                                <div style={{ height: 1, background: '#f0f2f5', marginBottom: 12 }} />

                                <button 
                                    onClick={() => navigate(`/dashboard/quiz/${lastWeekData.id}/result`, { state: { resultData: lastWeekData } })}
                                    style={{
                                        width: '100%', padding: '10px 0',
                                        borderRadius: 10,
                                        border: '1.5px solid #e5e7eb',
                                        background: '#fff',
                                        fontSize: 13, fontWeight: 600, color: 'black',
                                        cursor: 'pointer', fontFamily: font,
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                    See Result
                                </button>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
                                <div style={{ padding: 12, borderRadius: '50%', background: '#f8fafc', marginBottom: 12 }}>
                                    <Brain style={{ width: 24, height: 24, color: '#94a3b8' }} />
                                </div>
                                <p style={{ fontSize: 13, color: '#64748b', fontWeight: 600, margin: 0 }}>No Result Yet</p>
                                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                    You didn't complete last week's quiz challenge.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── CURRENT LEADERBOARD ── */}
                    <div style={{
                        background: '#fff',
                        borderRadius: 18,
                        padding: '18px 18px',
                        border: '1px solid #e8ecf0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.055)',
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                            {/* Ranking icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="2" y="10" width="5" height="10" rx="1.5" fill="#3b82f6" />
                                <rect x="9.5" y="6" width="5" height="14" rx="1.5" fill="#3b82f6" />
                                <rect x="17" y="13" width="5" height="7" rx="1.5" fill="#3b82f6" />
                            </svg>
                            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'black' }}>Current Leaderboard</span>
                        </div>

                        {/* Rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {loadingLeaderboard ? (
                                <p style={{ fontSize: 13, color: 'gray', textAlign: 'center', py: 10 }}>Loading leaderboard...</p>
                            ) : leaderboard.length === 0 ? (
                                <p style={{ fontSize: 13, color: 'gray', textAlign: 'center', py: 10 }}>No rankings yet. Be the first!</p>
                            ) : (
                                leaderboard.map((p, i) => {
                                    const rank = i + 1;
                                    return (
                                        <div key={p.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '8px 10px', borderRadius: 12,
                                            background: 'transparent',
                                        }}>
                                            {/* Rank number */}
                                            <span style={{
                                                width: 18, textAlign: 'center', flexShrink: 0,
                                                fontSize: 13.5, fontWeight: 700,
                                                color: (
                                                    rank === 1 ? '#ca8a04' :
                                                        rank === 2 ? '#9ca3af' :
                                                            rank === 3 ? '#a16207' : '#6b7280'
                                                ),
                                            }}>
                                                {rank}
                                            </span>

                                            {/* Avatar */}
                                            <Avatar name={p.user_name} size={34} />

                                            {/* Name + points */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    margin: 0, fontSize: 13, fontWeight: 700,
                                                    color: 'black',
                                                    lineHeight: 1.25,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {p.user_name}
                                                </p>
                                                <p style={{
                                                    margin: 0, fontSize: 10.5, fontWeight: 500,
                                                    color: 'black',
                                                    lineHeight: 1.3,
                                                }}>
                                                    {p.time_spent || (p.time_taken + 's')}
                                                </p>
                                            </div>

                                            {/* Score */}
                                            <span style={{
                                                fontSize: 13, fontWeight: 700, flexShrink: 0,
                                                color: 'black',
                                            }}>
                                                {fmtScore(p.points || 0)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
