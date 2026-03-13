import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, Minus, Check, X, FileText, Bot } from 'lucide-react';

// ─── Mock result data ─────────────────────────────────────────────────────────

const MOCK_RESULT = {
    courseTitle: 'Dasar-Dasar Computational Thinking',
    courseWeek: 9,
    finishedAt: new Date().toISOString(),
    totalQuestions: 6,
    correctCount: 3,
    wrongCount: 2,
    skippedCount: 1,
    accuracyScore: 60,
    timeSpent: '28m 37s',
    questions: [
        {
            id: 1,
            text: 'Apa yang dimaksud dengan Computational Thinking?',
            type: 'multiple_choice',
            timeSpent: '4m 12s',
            status: 'correct',
            correctAnswer: 'Cara berpikir seperti komputer untuk memecahkan masalah secara sistematis',
            userAnswer: 'Cara berpikir seperti komputer untuk memecahkan masalah secara sistematis',
            aiFeedback: 'Bagus! Jawabanmu benar. Computational Thinking adalah cara berpikir sistematis yang melibatkan dekomposisi, pengenalan pola, abstraksi, dan algoritma untuk memecahkan masalah secara efektif.',
        },
        {
            id: 2,
            text: 'Dekomposisi dalam Computational Thinking adalah proses...',
            type: 'multiple_choice',
            timeSpent: '3m 40s',
            status: 'correct',
            correctAnswer: 'Memecah masalah kompleks menjadi bagian-bagian yang lebih kecil',
            userAnswer: 'Memecah masalah kompleks menjadi bagian-bagian yang lebih kecil',
            aiFeedback: 'Tepat sekali! Dekomposisi adalah kemampuan untuk memecah masalah atau sistem yang kompleks menjadi bagian-bagian yang lebih kecil dan lebih mudah dikelola sehingga lebih mudah dipahami dan diselesaikan.',
        },
        {
            id: 3,
            text: 'Manakah yang BUKAN merupakan elemen utama Computational Thinking?',
            type: 'multiple_choice',
            timeSpent: '5m 20s',
            status: 'wrong',
            correctAnswer: 'Bahasa pemrograman',
            userAnswer: 'Abstraksi',
            aiFeedback: 'Jawaban belum tepat. Elemen utama Computational Thinking adalah dekomposisi, pengenalan pola, abstraksi, dan algoritma. Bahasa pemrograman adalah alat, bukan elemen inti dari CT. Abstraksi sendiri merupakan salah satu elemen utama CT.',
        },
        {
            id: 4,
            text: 'Abstraksi bertujuan untuk menyederhanakan masalah dengan mengabaikan detail yang tidak relevan.',
            type: 'true_false',
            timeSpent: '2m 05s',
            status: 'wrong',
            correctAnswer: 'TRUE',
            userAnswer: 'FALSE',
            aiFeedback: 'Jawaban kurang tepat. Pernyataan tersebut benar. Abstraksi dalam Computational Thinking memang bertujuan untuk menyederhanakan masalah dengan berfokus pada informasi penting dan mengabaikan detail yang tidak relevan, sehingga masalah menjadi lebih mudah dipahami.',
        },
        {
            id: 5,
            text: 'Manakah dari contoh berikut yang merupakan penerapan Computational Thinking dalam kehidupan sehari-hari?',
            type: 'multi_select',
            timeSpent: '—',
            status: 'skipped',
            correctAnswer: ['Membuat daftar belanja berurutan', 'Mencari rute terpendek ke sekolah', 'Mengelompokkan pakaian berdasarkan warna sebelum dicuci'],
            userAnswer: null,
            aiFeedback: 'Soal ini tidak dijawab. Penerapan CT dalam kehidupan sehari-hari meliputi: membuat daftar belanja terurut (algoritma), mencari rute terpendek (optimasi), dan mengelompokkan pakaian berdasarkan warna (klasifikasi/pengenalan pola).',
        },
        {
            id: 6,
            text: 'Representasi visual dari algoritma yang menggunakan simbol dan panah disebut?',
            type: 'short_answer',
            timeSpent: '6m 18s',
            status: 'correct',
            correctAnswer: 'Flowchart',
            userAnswer: 'Flowchart',
            aiFeedback: 'Jawaban benar! Flowchart adalah representasi visual dari sebuah algoritma menggunakan berbagai simbol dan panah untuk menunjukkan alur proses, keputusan, dan arah eksekusi dari suatu program atau prosedur.',
        },
    ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL = {
    multiple_choice: 'Multiple Choice',
    multi_select: 'Multiple Answer',
    true_false: 'Benar / Salah',
    short_answer: 'Isian Singkat',
};

const STATUS_COLOR = {
    correct: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'Correct' },
    wrong:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Wrong'   },
    skipped: { bg: '#f8fafc', border: '#e2e8f0', text: '#6b7280', label: 'Skipped' },
};

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        + ' • ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ─── Circular Accuracy ────────────────────────────────────────────────────────

function CircularAcc({ pct }) {
    const S = 54, W = 6, r = (S - W * 2) / 2;
    const circ = 2 * Math.PI * r, dash = circ - (pct / 100) * circ;
    return (
        <div style={{ position: 'relative', width: S, height: S, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={S} height={S} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={S / 2} cy={S / 2} r={r} stroke="#e5e7eb" strokeWidth={W} fill="none" />
                <circle cx={S / 2} cy={S / 2} r={r} stroke="#22c55e" strokeWidth={W} fill="none"
                    strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" />
            </svg>
            <span style={{ position: 'absolute', fontSize: 12, fontWeight: 800, color: '#15803d' }}>{pct}%</span>
        </div>
    );
}

// ─── Answer Pill ──────────────────────────────────────────────────────────────

function AnswerPill({ text, variant }) {
    // variant: 'correct' | 'wrong' | 'skipped'
    const colors = {
        correct: { bg: '#dcfce7', border: '#86efac', color: '#15803d', icon: <Check style={{ width: 13, height: 13, strokeWidth: 3 }} /> },
        wrong:   { bg: '#fee2e2', border: '#fca5a5', color: '#dc2626', icon: <X   style={{ width: 13, height: 13, strokeWidth: 3 }} /> },
        skipped: { bg: '#f1f5f9', border: '#cbd5e1', color: '#94a3b8', icon: <Minus style={{ width: 13, height: 13 }} /> },
    };
    const c = colors[variant] || colors.correct;
    const displayText = Array.isArray(text) ? text.join(', ') : (text ?? '—');
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: c.bg, border: `1.5px solid ${c.border}`, color: c.color,
            borderRadius: 999, padding: '4px 12px 4px 10px',
            fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
        }}>
            {c.icon}
            {displayText || '—'}
        </span>
    );
}

// ─── Nav Dot ─────────────────────────────────────────────────────────────────

function NavDot({ num, status, onClick }) {
    const color = status === 'correct' ? '#10b981' : status === 'wrong' ? '#ef4444' : '#9ca3af';
    const Icon  = status === 'correct' ? Check : status === 'wrong' ? X : Minus;

    return (
        <button
            onClick={onClick}
            style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 50, height: 44,
                borderRadius: 8,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                padding: 0
            }}
        >
            <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{num}</span>
            <div style={{
                position: 'absolute',
                top: -1, right: -1,
                background: color,
                width: 16, height: 16,
                borderRadius: '0 8px 0 4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon style={{ width: 10, height: 10, color: '#fff', strokeWidth: 4 }} />
            </div>
        </button>
    );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ q, index }) {
    const st = STATUS_COLOR[q.status];
    
    // Derived styles for status
    const statusColor = q.status === 'correct' ? '#10b981' : q.status === 'wrong' ? '#ef4444' : '#9ca3af';
    const statusLabel = q.status === 'correct' ? 'Correct' : q.status === 'wrong' ? 'Wrong' : 'Skipped';
    const StatusIcon = q.status === 'correct' ? Check : q.status === 'wrong' ? X : Minus;

    const answerColor = q.status === 'correct' ? '#10b981' : q.status === 'wrong' ? '#ef4444' : '#9ca3af';
    const answerBg = q.status === 'correct' ? '#ecfdf5' : q.status === 'wrong' ? '#fef2f2' : '#f8fafc';
    const answerBorder = q.status === 'correct' ? '#6ee7b7' : q.status === 'wrong' ? '#fca5a5' : '#e2e8f0';

    return (
        <div
            id={`q-${index + 1}`}
            style={{
                background: '#fff', borderRadius: 12,
                border: `1px solid #e8ecf0`,
                marginBottom: 16, overflow: 'hidden', padding: '16px 20px'
            }}
        >
            {/* Card Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Q icon */}
                    <img 
                        src="/images/Group 12961.png" 
                        alt="Q"
                        style={{ width: 22, height: 22, objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Question {index + 1}</span>
                    
                    <span style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 1 }}>•</span>
                    
                    {/* Category Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px' }}>
                        <FileText style={{ width: 12, height: 12, color: '#475569' }} />
                        <span style={{ fontSize: 11.5, color: '#475569', fontWeight: 700 }}>{TYPE_LABEL[q.type] || q.type}</span>
                    </div>

                    {/* Time Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px' }}>
                        <Clock style={{ width: 12, height: 12, color: '#475569' }} />
                        <span style={{ fontSize: 11.5, color: '#475569', fontWeight: 700 }}>{q.timeSpent}</span>
                    </div>
                </div>
                {/* Status badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StatusIcon style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3.5 }} />
                    </div>
                    <span style={{
                        fontSize: 13, fontWeight: 700, color: '#475569',
                    }}>
                        {statusLabel}
                    </span>
                </div>
            </div>

            {/* Question text */}
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                {q.text}
            </p>

            {/* Correct Answer / Your Answer */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Correct Answer</span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#a7f3d0', border: `1.2px solid #34d399`, color: '#0f172a',
                        borderRadius: 999, padding: '4px 10px 4px 14px',
                        fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                    }}>
                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : (q.correctAnswer ?? '—')}
                        <Check style={{ width: 15, height: 15, color: '#059669', strokeWidth: 3 }} />
                    </span>
                </div>
                {q.status !== 'correct' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Your Answer</span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: answerBg, border: `1.2px solid ${answerBorder}`, color: '#0f172a',
                            borderRadius: 999, padding: '4px 10px 4px 14px',
                            fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                        }}>
                            {Array.isArray(q.userAnswer) ? q.userAnswer.join(', ') : (q.userAnswer ?? '—')}
                            <StatusIcon style={{ width: 15, height: 15, color: answerColor, strokeWidth: 3 }} />
                        </span>
                    </div>
                )}
            </div>

            {/* AI Feedback */}
            <div style={{
                padding: '16px 20px',
                background: '#f1f5f9', borderRadius: 12,
                display: 'flex', gap: 14, alignItems: 'center',
            }}>
                <div style={{ flexShrink: 0 }}>
                    <img 
                        src="/images/Group.png" 
                        alt="AI"
                        style={{ width: 24, height: 24, objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>AI Feedback: </span>
                    {q.aiFeedback}
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuizResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { courseId } = useParams();

    const data = location.state?.resultData || MOCK_RESULT;
    const font = "'Outfit', sans-serif";

    const scrollToQ = (idx) => {
        document.getElementById(`q-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div style={{ fontFamily: font }}>

            {/* ── PAGE HEADER ── */}
            <div style={{
                marginBottom: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 16,
            }}>
                {/* Left: title info */}
                <div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                        Tantangan Minggu ke-{data.courseWeek}
                    </p>
                    <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#111827' }}>
                        Kuis {data.courseTitle}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar style={{ width: 14, height: 14, color: '#94a3b8' }} />
                        <span style={{ fontSize: 13, color: '#64748b' }}>
                            Finished: {formatDate(data.finishedAt)} &nbsp;•&nbsp; {data.totalQuestions} Questions
                        </span>
                    </div>
                </div>

                {/* Right: stat cards */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {/* Accuracy */}
                    <div style={{
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}>
                        <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>Accuracy Score</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ position: 'relative', width: 28, height: 28 }}>
                                <svg width={28} height={28} style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx={14} cy={14} r={11.5} stroke="#e2e8f0" strokeWidth={3.5} fill="none" />
                                    <circle cx={14} cy={14} r={11.5} stroke="#10b981" strokeWidth={3.5} fill="none"
                                        strokeDasharray={2 * Math.PI * 11.5}
                                        strokeDashoffset={(2 * Math.PI * 11.5) * (1 - data.accuracyScore / 100)}
                                        strokeLinecap="round" />
                                </svg>
                                <Check strokeWidth={3.5} style={{ position: 'absolute', top: 7, left: 7, width: 14, height: 14, color: '#10b981' }} />
                            </div>
                            <span style={{ fontSize: 26, fontWeight: 800, color: '#334155' }}>{data.accuracyScore}%</span>
                        </div>
                    </div>

                    {/* Time */}
                    <div style={{
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}>
                        <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>Time Spent</span>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 4 }}>
                            <circle cx="12" cy="13" r="8" />
                            <path d="M10 2h4" />
                            <path d="M8 13h1.5l1.5-2 2 4.5 1.5-2.5H16" />
                        </svg>
                        <span style={{ fontSize: 22, fontWeight: 800, color: '#334155', marginTop: 0 }}>{data.timeSpent}</span>
                    </div>

                    {/* Questions answered */}
                    <div style={{
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}>
                        <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>Question Answered</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                            <span style={{ fontSize: 26, fontWeight: 800, color: '#334155' }}>{data.totalQuestions - data.skippedCount}</span>
                            <span style={{ fontSize: 20, color: '#94a3b8', fontWeight: 500 }}>/{data.totalQuestions}</span>
                        </div>
                        <div style={{ width: '85%', height: 4.5, background: '#e2e8f0', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', background: '#10b981', borderRadius: 4,
                                width: `${((data.totalQuestions - data.skippedCount) / data.totalQuestions) * 100}%`
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── QUESTION NAV BAR ── */}
            <div style={{
                background: '#fff', borderRadius: 16, padding: '20px',
                marginBottom: 20, border: '1px solid #e8ecf0',
                display: 'flex', flexDirection: 'column', gap: 20,
            }}>
                {/* Dots row */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {data.questions.map((q, i) => (
                        <NavDot key={q.id} num={i + 1} status={q.status} onClick={() => scrollToQ(i + 1)} />
                    ))}
                </div>

                {/* Legend row */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Correct */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, background: '#10b981', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 4 }} />
                        </div>
                        <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                            Correct <strong style={{ color: '#0f172a', fontWeight: 800 }}>{data.correctCount}</strong>
                        </span>
                    </div>

                    <span style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 1 }}>•</span>

                    {/* Wrong */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, background: '#ef4444', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X style={{ width: 10, height: 10, color: '#fff', strokeWidth: 4 }} />
                        </div>
                        <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                            Wrong <strong style={{ color: '#0f172a', fontWeight: 800 }}>{data.wrongCount}</strong>
                        </span>
                    </div>

                    <span style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 1 }}>•</span>

                    {/* Skipped */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, background: '#9ca3af', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus style={{ width: 10, height: 10, color: '#fff', strokeWidth: 4 }} />
                        </div>
                        <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                            Skipped <strong style={{ color: '#0f172a', fontWeight: 800 }}>{data.skippedCount}</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* ── QUESTION CARDS ── */}
            {data.questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i} />
            ))}

            {/* ── BACK BUTTON ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button
                    onClick={() => navigate('/dashboard/modules')}
                    style={{
                        padding: '12px 36px', borderRadius: 999,
                        background: '#1e293b', color: '#fff',
                        fontWeight: 700, fontSize: 14, border: 'none',
                        cursor: 'pointer', fontFamily: font,
                        boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
                >
                    Kembali ke Material
                </button>
            </div>
        </div>
    );
}
