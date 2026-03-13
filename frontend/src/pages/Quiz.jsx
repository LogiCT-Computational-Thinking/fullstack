import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, X, Loader2 } from 'lucide-react';
import api from '../services/api';

// ─── Mock Questions ────────────────────────────────────────────────────────────

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: 'Apa yang dimaksud dengan Computational Thinking?',
    type: 'multiple_choice',
    option: [
      'Cara berpikir seperti komputer untuk memecahkan masalah secara sistematis',
      'Kemampuan memprogram menggunakan bahasa komputer',
      'Proses membuat komputer bekerja lebih cepat',
      'Teknik menghafal perintah-perintah dalam pemrograman',
    ],
  },
  {
    id: 2,
    question: 'Dekomposisi dalam Computational Thinking adalah proses...',
    type: 'multiple_choice',
    option: [
      'Memecah masalah kompleks menjadi bagian-bagian yang lebih kecil',
      'Membuat komputer bekerja lebih cepat',
      'Menulis kode program yang efisien',
      'Mencari pola dalam sekumpulan data',
    ],
  },
  {
    id: 3,
    question: 'Manakah yang BUKAN merupakan elemen utama Computational Thinking?',
    type: 'multiple_choice',
    option: [
      'Bahasa pemrograman',
      'Dekomposisi',
      'Abstraksi',
      'Pengenalan pola',
    ],
  },
  {
    id: 4,
    question: 'Abstraksi bertujuan untuk menyederhanakan masalah dengan mengabaikan detail yang tidak relevan.',
    type: 'true_false',
    option: ['TRUE', 'FALSE'],
  },
  {
    id: 5,
    question: 'Manakah dari contoh berikut yang merupakan penerapan Computational Thinking dalam kehidupan sehari-hari?',
    type: 'multi_select',
    option: [
      'Membuat daftar belanja berurutan',
      'Mencari rute terpendek ke sekolah',
      'Makan siang bersama teman',
      'Mengelompokkan pakaian berdasarkan warna sebelum dicuci',
    ],
  },
  {
    id: 6,
    question: 'Representasi visual dari algoritma yang menggunakan simbol dan panah disebut?',
    type: 'short_answer',
    option: [],
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Quiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // ── MOCK DATA (hapus blok ini saat connect ke backend) ──
    setQuestions(MOCK_QUESTIONS);
    setLoading(false);

    // ── AKTIFKAN saat connect ke backend ──
    // const fetchQuiz = async () => {
    //   try {
    //     const res = await api.get(`/courses/${courseId}/quiz/`);
    //     setQuestions(res.data.questions || []);
    //   } catch (err) {
    //     console.error('Failed to fetch quiz:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchQuiz();
  }, [courseId]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading Quiz...</p>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="bg-gray-50 p-10 rounded-[32px] shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Found</h2>
          <p className="text-gray-500 mb-8">This quiz doesn't have any questions yet.</p>
          <button
            onClick={() => navigate('/dashboard/modules')}
            className="px-8 py-3 bg-cyan-500 text-white rounded-full font-bold hover:bg-cyan-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIdx];
  const currentAnswer = selectedAnswers[currentQuestion.id];

  const handleSelect = (value) => {
    if (currentQuestion.type.includes('multi_select')) {
      const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (prev.includes(value)) {
        setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: prev.filter(v => v !== value) });
      } else {
        setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: [...prev, value] });
      }
    } else {
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: value });
    }
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSubmitting(true);
      try {
        // ── AKTIFKAN saat connect ke backend ──
        // const res = await api.post(`/courses/${courseId}/quiz-complete/`, { answers: selectedAnswers });
        // navigate(`/dashboard/quiz/${courseId}/result`, { state: { resultData: res.data } });

        // ── MOCK: langsung ke result page ──
        navigate(`/dashboard/quiz/${courseId}/result`);
      } catch (err) {
        console.error('Failed to submit quiz:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const isAnswered = currentAnswer && (!Array.isArray(currentAnswer) || currentAnswer.length > 0);

  return (
    /* ── PAGE: white background ── */
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#ffffff', fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── FIXED HEADER: Logo + Progress Bar ── */}
      <div
        className="fixed top-0 left-0 w-full z-50 flex flex-col items-center pt-6 pb-5"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 70%, transparent 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="w-full max-w-2xl px-6 flex flex-col items-center">
          {/* Logo — same as ProfilingQuiz */}
          <div className="mb-3 opacity-60">
            <img
              src="/images/logo-logict-3.png"
              alt="LogiCT"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                // fallback jika logo-logict-3 tidak ada
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback text logo */}
            <div
              className="hidden items-center gap-2"
              style={{ display: 'none' }}
            >
              <img src="/images/logo-logict.png" alt="LogiCT" className="w-7 h-7 rounded-lg opacity-60" />
              <span className="text-gray-500 font-bold text-lg tracking-tight">LogiCT</span>
            </div>
          </div>

          {/* Segmented Progress Bar — narrower, gaps between segments */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 flex gap-1.5">
              {Array.from({ length: questions.length }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-full transition-all duration-500"
                  style={{
                    background: i < currentIdx
                      ? '#06b6d4'   /* completed: cyan */
                      : i === currentIdx
                        ? '#06b6d4' /* current: cyan */
                        : '#e2e8f0', /* upcoming: gray */
                    opacity: i < currentIdx ? 1 : i === currentIdx ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-500 ml-2 min-w-[36px] text-right">
              {Math.round(((currentIdx) / questions.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA: centers card below the fixed header ── */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 130, // Controls the distance from the header
          paddingBottom: 40,
          paddingLeft: 20,
          paddingRight: 20,
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* Question + Answers card — gray-50 background */}
        <div
          className="w-full rounded-[32px] px-12 py-12 flex flex-col"
          style={{ background: '#f8fafc', maxWidth: 1200, minHeight: 560 }}
        >
          {/* Question info */}
          <p className="text-center text-gray-400 font-medium text-sm mb-4">
            Question {currentIdx + 1}/{questions.length}
          </p>

          {/* Question text */}
          <h2 className="text-center text-[22px] font-semibold text-gray-900 leading-relaxed mb-3 max-w-xl mx-auto">
            {currentQuestion.question}
          </h2>

          {/* Instruction hint */}
          <p className="text-center text-gray-400 text-[13px] font-medium italic mb-10">
            {currentQuestion.type === 'true_false'
              ? 'Choose the correct answer'
              : currentQuestion.type.includes('multi_select')
                ? 'Select two or more correct answers'
                : currentQuestion.type === 'short_answer'
                  ? 'Type your answer'
                  : 'Choose the correct answer'}
          </p>

          {/* Answer options */}
          <div className="flex flex-col gap-3">
            {renderOptions(currentQuestion, currentAnswer, handleSelect)}
          </div>

          {/* Next / Finish button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleNext}
              disabled={!isAnswered || submitting}
              className="flex items-center gap-2 font-bold text-white text-[15px] transition-all duration-200 active:scale-95"
              style={{
                padding: '12px 36px',
                borderRadius: 999,
                background: isAnswered ? '#06b6d4' : '#cbd5e1',
                cursor: isAnswered ? 'pointer' : 'not-allowed',
                boxShadow: isAnswered ? '0 4px 16px rgba(6,182,212,0.35)' : 'none',
              }}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {currentIdx === questions.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Render Options ────────────────────────────────────────────────────────────

function renderOptions(question, currentAnswer, onSelect) {
  /* ── Multiple Choice ── */
  if (question.type === 'multiple_choice' || question.type === 'multiple_choice_image') {
    return question.option.map((opt, i) => {
      const isSelected = currentAnswer === opt;
      return (
        <button
          key={i}
          onClick={() => onSelect(opt)}
          className="w-full text-left transition-all duration-150 active:scale-[0.99]"
          style={{
            padding: '14px 22px',
            borderRadius: 999,
            border: `1.5px solid ${isSelected ? '#06b6d4' : '#e2e8f0'}`,
            background: isSelected ? 'rgba(6,182,212,0.08)' : '#ffffff',
            fontWeight: isSelected ? 700 : 500,
            color: isSelected ? '#0e7490' : '#374151',
            fontSize: 15,
            fontFamily: "'Outfit', sans-serif",
            cursor: 'pointer',
          }}
        >
          {opt}
        </button>
      );
    });
  }

  /* ── Multi Select ── */
  if (question.type.includes('multi_select')) {
    const answers = Array.isArray(currentAnswer) ? currentAnswer : [];
    return question.option.map((opt, i) => {
      const isSelected = answers.includes(opt);
      return (
        <button
          key={i}
          onClick={() => onSelect(opt)}
          className="w-full text-left flex items-center justify-between transition-all duration-150 active:scale-[0.99]"
          style={{
            padding: '14px 22px',
            borderRadius: 999,
            border: `1.5px solid ${isSelected ? '#06b6d4' : '#e2e8f0'}`,
            background: isSelected ? 'rgba(6,182,212,0.08)' : '#ffffff',
            fontWeight: isSelected ? 700 : 500,
            color: isSelected ? '#0e7490' : '#374151',
            fontSize: 15,
            fontFamily: "'Outfit', sans-serif",
            cursor: 'pointer',
          }}
        >
          <span>{opt}</span>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            border: `2px solid ${isSelected ? '#06b6d4' : '#cbd5e1'}`,
            background: isSelected ? '#06b6d4' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {isSelected && <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />}
          </div>
        </button>
      );
    });
  }

  /* ── True / False ── */
  if (question.type === 'true_false') {
    const isTrue = currentAnswer === 'TRUE';
    const isFalse = currentAnswer === 'FALSE';
    return (
      <div style={{ maxWidth: 480, margin: '8px auto 0', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* TRUE button */}
        <button
          onClick={() => onSelect('TRUE')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: 0,
            borderRadius: 18,
            border: `2px solid ${isTrue ? '#86efac' : '#e2e8f0'}`,
            background: isTrue ? '#f0fdf4' : '#ffffff',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.15s',
            boxShadow: isTrue ? '0 4px 12px rgba(34,197,94,0.15)' : 'none',
          }}
        >
          <div style={{
            width: '100%', padding: '28px 0',
            background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Check style={{ width: 44, height: 44, color: '#16a34a', strokeWidth: 2.5 }} />
          </div>
          <div style={{
            padding: '14px 0',
            fontSize: 15, fontWeight: 800, color: '#111827',
            letterSpacing: 1.5, fontFamily: "'Outfit', sans-serif",
          }}>
            TRUE
          </div>
        </button>

        {/* FALSE button */}
        <button
          onClick={() => onSelect('FALSE')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: 0,
            borderRadius: 18,
            border: `2px solid ${isFalse ? '#fca5a5' : '#fecaca'}`,
            background: isFalse ? '#fee2e2' : '#fff5f5',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.15s',
            boxShadow: isFalse ? '0 4px 12px rgba(239,68,68,0.15)' : 'none',
          }}
        >
          <div style={{
            width: '100%', padding: '28px 0',
            background: '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X style={{ width: 44, height: 44, color: '#dc2626', strokeWidth: 2.5 }} />
          </div>
          <div style={{
            padding: '14px 0',
            fontSize: 15, fontWeight: 800, color: '#111827',
            letterSpacing: 1.5, fontFamily: "'Outfit', sans-serif",
          }}>
            FALSE
          </div>
        </button>

      </div>
      </div>
    );
  }

  /* ── Short Answer ── */
  if (question.type === 'short_answer') {
    return (
      <input
        type="text"
        value={currentAnswer || ''}
        onChange={(e) => onSelect(e.target.value)}
        placeholder="Type your answer here..."
        style={{
          width: '100%', padding: '18px 28px',
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: 999,
          textAlign: 'center',
          fontSize: 16, fontWeight: 700, color: '#111827',
          outline: 'none',
          fontFamily: "'Outfit', sans-serif",
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#06b6d4'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    );
  }

  return null;
}
