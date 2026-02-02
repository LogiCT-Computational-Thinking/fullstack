import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Data soal kuis (contoh)
const quizData = [
  {
    id: 1,
    question: "Apa kepanjangan dari SCM dalam logistik?",
    options: [
      "Supply Chain Management",
      "System Control Management",
      "Service Customer Management",
      "Storage Container Management",
      "Shipping Cargo Management"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Apa fungsi utama dari warehouse dalam supply chain?",
    options: [
      "Tempat produksi barang",
      "Penyimpanan dan distribusi barang",
      "Tempat penjualan langsung",
      "Kantor administrasi",
      "Tempat pembuangan barang rusak"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Metode pengiriman tercepat untuk barang internasional adalah?",
    options: [
      "Sea Freight",
      "Land Transport",
      "Air Freight",
      "Rail Transport",
      "Pipeline"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "Apa yang dimaksud dengan Last Mile Delivery?",
    options: [
      "Pengiriman pertama dari pabrik",
      "Pengiriman terakhir ke konsumen akhir",
      "Pengiriman antar gudang",
      "Pengiriman ke pelabuhan",
      "Pengiriman internasional"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "Sistem tracking barang menggunakan teknologi apa?",
    options: [
      "Bluetooth",
      "Wi-Fi",
      "RFID dan GPS",
      "NFC",
      "Infrared"
    ],
    correctAnswer: 2
  }
];

export default function Quiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('welcome'); // 'welcome' or 'quiz'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalQuestions = quizData.length;
  const progress = currentStep === 'welcome' ? 0 : ((currentQuestion + 1) / totalQuestions) * 100;

  // Animasi fade in saat mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentQuestion, currentStep]);

  const handleContinueWelcome = () => {
    setCurrentStep('quiz');
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleContinue = () => {
    if (selectedAnswer === null) return;

    // Simpan jawaban
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    // Pindah ke soal berikutnya atau selesai
    if (currentQuestion < totalQuestions - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 300);
    } else {
      // Quiz selesai, hitung skor
      const correctCount = newAnswers.filter(
        (answer, idx) => answer === quizData[idx].correctAnswer
      ).length;

      // Redirect ke dashboard dengan hasil
      navigate('/dashboard', {
        state: {
          quizCompleted: true,
          score: correctCount,
          total: totalQuestions
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#a8cc4c] to-[#F3F7D2] flex flex-col items-center justify-center p-4">
      {/* Logo Header */}
      <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2">
        <img
          src="/images/welkam_atas.png"
          alt="LogiCT Mascot"
          className="h-8 sm:h-10 lg:h-12 w-auto object-contain drop-shadow-lg"
        />
      </div>

      {/* Progress Bar */}
      <div className="absolute top-16 sm:top-20 left-0 right-0 px-4 sm:px-8 max-w-3xl mx-auto">
        <div className="h-1.5 sm:h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content Card */}
      <div
        className={`w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 lg:p-12 mt-12 sm:mt-16 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
      >
        {currentStep === 'welcome' ? (
          <WelcomeScreen onContinue={handleContinueWelcome} />
        ) : (
          <QuestionScreen
            question={quizData[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={totalQuestions}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );
}

// Welcome Screen Component
function WelcomeScreen({ onContinue }) {
  const [birdAnimation, setBirdAnimation] = useState(false);

  useEffect(() => {
    // Trigger animasi burung setelah mount
    const timer = setTimeout(() => setBirdAnimation(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
      {/* Burung dengan Speech Bubble */}
      <div className="relative">

        {/* Burung Animasi */}
        <div
          className={`mt-8 sm:mt-16 lg:mt-24 transition-all duration-700 ${birdAnimation
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 -rotate-12'
            }`}
        >
          <div className="relative inline-block animate-bounce-slow">
            {/* Placeholder untuk gambar burung - ganti dengan gambar asli */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 relative">
              <img
                src="/images/welkam.png"
                alt="LogiCT Mascot"
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="mt-6 sm:mt-8 px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-150 active:scale-95"
      >
        Continue
      </button>
    </div>
  );
}

// Question Screen Component
function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onContinue
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Question */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center leading-tight">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-2.5 sm:space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left text-gray-700 text-sm sm:text-base font-medium rounded-xl sm:rounded-2xl border-2 transition-all duration-150 active:scale-[0.98] ${selectedAnswer === index
                ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={selectedAnswer === null}
        className={`w-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg rounded-full shadow-lg transition-all duration-150 active:scale-95 ${selectedAnswer !== null
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl hover:scale-[1.01] cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        {questionNumber === totalQuestions ? 'Selesai' : 'Continue'}
      </button>
    </div>
  );
}
