import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Brain, Clock, Play } from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Rusydi Balfas', nim: 'ST-28', score: 13408 },
    { rank: 2, name: 'Zaky Ghoetty', nim: 'ST-29', score: 9398 },
    { rank: 3, name: 'Fadhil Mumtaz', nim: 'ST-25', score: 9160 },
    { rank: 4, name: 'Rio Alvein', nim: 'ST-26', score: 8237, isMe: true },
    { rank: 5, name: 'Agal Lulanika', nim: 'ST-28', score: 7246 },
    { rank: 6, name: 'Raihan Zhafran', nim: 'ST-27', score: 6384 },
];

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
            fontFamily: "'Outfit', sans-serif",
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

function SemiGauge({ size = 140 }) {
    const W = 18, r = (size - W * 2) / 2;
    const cx = size / 2, cy = r + W / 2;
    const toP = (deg) => {
        const rad = (deg * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const s = toP(180), e = toP(0);
    const arcD = `M ${s.x},${s.y} A ${r},${r} 0 0 1 ${e.x},${e.y}`;
    const svgH = cy + W / 2 + 4;
    return (
        <div style={{ position: 'relative', width: size, height: svgH, display: 'flex', justifyContent: 'center' }}>
            <svg width={size} height={svgH} style={{ overflow: 'visible', display: 'block' }}>
                <path d={arcD} stroke="#d1d5db" strokeWidth={W} fill="none" strokeLinecap="round" />
            </svg>
            <span style={{
                position: 'absolute',
                top: cy - 5, // move into the hollow part
                fontSize: 22,
                fontWeight: 900,
                color: 'black',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1
            }}>0%</span>
        </div>
    );
}

// ─── Time Remaining ───────────────────────────────────────────────────────────

function useTimeRemaining() {
    const calc = () => {
        const now = new Date();
        const end = new Date(now);
        const dayOfWeek = now.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
        end.setDate(now.getDate() + daysUntilSunday);
        end.setHours(23, 59, 59, 999);
        const diff = end - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${d} hari ${h} jam ${m} menit`;
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const t = setInterval(() => setTime(calc()), 60000);
        return () => clearInterval(t);
    }, []);
    return time;
}

// ─── Helper: format score ─────────────────────────────────────────────────────

const fmtScore = (n) => n.toLocaleString('id-ID');

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuizIntro() {
    const { courseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const timeLeft = useTimeRemaining();

    const courseTitle = location.state?.courseTitle || 'Dasar-Dasar Computational Thinking';
    const courseWeek = location.state?.courseWeek || courseId;
    const totalQ = 5;

    const INSTRUCTIONS = [
        `Kuis terdiri dari ${totalQ} pertanyaan`,
        'Waktu yang diberikan untuk mengerjakan kuis adalah 30 menit',
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
        navigate(`/quiz/${courseId}`, { state: { courseTitle, courseWeek } });
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
                    }}>
                        {/* ── GRADIENT HERO SECTION ── */}
                        <div style={{
                            background: 'transparent',
                            padding: '24px 24px 0 24px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', top: -120, right: -80,
                                width: 330, height: 330, borderRadius: '50%',
                                padding: 60, // balanced thickness
                                background: 'linear-gradient(to bottom, #FFFFFF 0%, #A6FFE6 100%)',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude',
                                pointerEvents: 'none',
                                zIndex: 0,
                            }} />

                            {/* Brain icon + text */}
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
                                    <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: 'black', lineHeight: 1.2 }}>
                                        Kuis {courseTitle}
                                    </h1>
                                </div>
                            </div>

                            {/* ── TIME REMAINING BADGE (Right Aligned) ── */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginBottom: 20,
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

                            {/* ── PROGRESS BOX (white, inside gradient card) ── */}
                            <div style={{
                                position: 'relative',
                                zIndex: 1,
                                background: '#ffffff',
                                borderRadius: 14,
                                padding: '10px 22px 14px',
                                border: '2px solid #E4E4E7',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    {/* Left: Gauge */}
                                    <div style={{ flexShrink: 0 }}>
                                        <SemiGauge size={140} />
                                    </div>

                                    {/* Right: Info Column */}
                                    <div style={{ flex: 1 }}>
                                        {/* Label row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: 13.5, color: 'black', fontWeight: 500 }}>
                                                Progress Anda: 0 dari {totalQ} Pertanyaan Dijawab
                                            </span>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: 'black' }}>0/{totalQ}</span>
                                        </div>

                                        {/* Bars row */}
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            {Array.from({ length: totalQ }).map((_, i) => (
                                                <div key={i} style={{
                                                    flex: 1, height: 18, borderRadius: 9,
                                                    background: '#e5e7eb',
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── INSTRUCTIONS + RULES (white) ── */}
                        <div style={{
                            background: 'transparent',
                            padding: '20px 32px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5px 1fr',
                            gap: 32,
                        }}>
                            {/* Instructions */}
                            <div>
                                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: 'black' }}>
                                    Instructions:
                                </h3>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {INSTRUCTIONS.map((item, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'black', lineHeight: 1.55 }}>
                                            <span style={{ marginTop: 7, width: 4, height: 4, borderRadius: '50%', background: 'black', flexShrink: 0, display: 'block' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Vertical Divider */}
                            <div style={{ background: '#E4E4E7', width: '100%', height: '100%' }} />

                            {/* Rules */}
                            <div>
                                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: 'black' }}>
                                    Rules
                                </h3>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    {RULES.map((item, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'black', lineHeight: 1.55 }}>
                                            <span style={{ marginTop: 7, width: 4, height: 4, borderRadius: '50%', background: 'black', flexShrink: 0, display: 'block' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* ── START QUIZ BUTTON ── */}
                        <div style={{ background: 'transparent', padding: '8px 24px 28px', display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={handleStart}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '12px 40px',
                                    background: 'linear-gradient(to right, #143467, #0399A0)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 15,
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
                                Start Quiz
                            </button>
                        </div>
                    </div>
                </div>

                {/* ════ RIGHT COLUMN ════ */}
                <div style={{ width: 420, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* ── LAST WEEK QUIZ ── */}
                    <div style={{
                        background: '#fff',
                        borderRadius: 18,
                        padding: '18px 18px 16px',
                        border: '1px solid #e8ecf0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.055)',
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            {/* Trophy badge icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L8 8H2L7 13L5 19L12 15L19 19L17 13L22 8H16L12 2Z" fill="#3b82f6" />
                            </svg>
                            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'black' }}>Last Week Quiz</span>
                        </div>
                        <p style={{ margin: '0 0 14px', fontSize: 12, color: 'black', fontWeight: 400 }}>
                            {MOCK_LAST_WEEK.title}
                        </p>

                        {/* Circle score */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                            <CircularScore score={MOCK_LAST_WEEK.score} max={MOCK_LAST_WEEK.maxScore} />
                        </div>

                        {/* Stats */}
                        <div style={{ textAlign: 'center', marginBottom: 14 }}>
                            <p style={{ margin: '0 0 3px', fontSize: 11.5, color: 'black' }}>
                                Pertanyaan Benar: <strong style={{ color: 'black' }}>{MOCK_LAST_WEEK.correctAnswers}/{MOCK_LAST_WEEK.totalQuestions}</strong>
                            </p>
                            <p style={{ margin: 0, fontSize: 11.5, color: 'black' }}>
                                Waktu Pengerjaan: <strong style={{ color: 'black' }}>{MOCK_LAST_WEEK.timeTaken}</strong>
                            </p>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: '#f0f2f5', marginBottom: 12 }} />

                        {/* See Result */}
                        <button style={{
                            width: '100%', padding: '9px 0',
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
                            {MOCK_LEADERBOARD.map((p) => (
                                <div key={p.rank} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 10px', borderRadius: 12,
                                    background: p.isMe ? 'linear-gradient(to right, #FDFFD7, #FFD980)' : 'transparent',
                                }}>
                                    {/* Rank number */}
                                    <span style={{
                                        width: 18, textAlign: 'center', flexShrink: 0,
                                        fontSize: 13.5, fontWeight: 700,
                                        color: p.isMe ? 'black' : (
                                            p.rank === 1 ? '#ca8a04' :
                                                p.rank === 2 ? '#9ca3af' :
                                                    p.rank === 3 ? '#a16207' : '#6b7280'
                                        ),
                                    }}>
                                        {p.rank}
                                    </span>

                                    {/* Avatar */}
                                    <Avatar name={p.name} size={34} />

                                    {/* Name + NIM */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: 0, fontSize: 13, fontWeight: 700,
                                            color: 'black',
                                            lineHeight: 1.25,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {p.name}
                                        </p>
                                        <p style={{
                                            margin: 0, fontSize: 10.5, fontWeight: 500,
                                            color: 'black',
                                            lineHeight: 1.3,
                                        }}>
                                            {p.nim}
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <span style={{
                                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                                        color: 'black',
                                    }}>
                                        {fmtScore(p.score)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
