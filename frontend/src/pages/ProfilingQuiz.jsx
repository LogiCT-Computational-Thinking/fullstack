import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';
import maleIcon from '../assets/Male.png';
import femaleIcon from '../assets/Female.png';
import genderIcon from '../assets/Gender.png';
import api from '../services/api';

export default function ProfilingQuiz() {
    const navigate = useNavigate();
    const { playClick, playSuccess } = useSound();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        gender: '',
        studentClass: '',
        studentId: ''
    });
    const [cognitiveQuestions, setCognitiveQuestions] = useState([]);
    const [pedagogicQuestions, setPedagogicQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cognitiveAnswers, setCognitiveAnswers] = useState({});
    const [pedagogicAnswers, setPedagogicAnswers] = useState({});

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/profiling/questions/');
            const allQuestions = response.data;

            // Separate cognitive and pedagogic questions
            const cog = allQuestions.filter(q => q.category.startsWith('PROFILING_COGNITIVE'));
            const ped = allQuestions.filter(q => q.category === 'PROFILING_PEDAGOGY');

            setCognitiveQuestions(cog);
            setPedagogicQuestions(ped);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        playClick?.();
        // If we are at the last step of Student Info (academic details), save to DB
        if (step === 4) {
            handleSaveStudentInfo();
        }
        // If we are at the "You're Good to Go!" screen (after cognitive questions), save cognitive answers
        else if (step === 7 + cognitiveQuestions.length) {
            handleSaveCognitiveAnswers();
        }
        else {
            setStep(step + 1);
        }
    };

    const handleSaveCognitiveAnswers = async () => {
        try {
            const responses = Object.entries(cognitiveAnswers).map(([index, answer]) => ({
                question_id: cognitiveQuestions[index].id,
                answer: String(answer)
            }));

            await api.post('/profiling/cognitive-submit/', { responses });
            setStep(step + 1);
        } catch (error) {
            console.error('Failed to save cognitive answers:', error);
            // Optionally show error but still let them continue, or stay on page
            setStep(step + 1);
        }
    };

    const handleSaveStudentInfo = async () => {
        try {
            // Convert birthday to YYYY-MM-DD
            const monthMap = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            const formattedDate = `${formData.birthYear}-${monthMap[formData.birthMonth]}-${formData.birthDay.padStart(2, '0')}`;

            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                birth_date: formattedDate,
                gender: formData.gender,
                student_class: formData.studentClass,
                student_id: formData.studentId
            };

            const response = await api.post('/auth/profiling/student-info/', payload);

            // Update local user data
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setStep(step + 1);
        } catch (error) {
            console.error('Failed to save student info:', error);
            alert('Failed to save information. Please try again.');
        }
    };

    const prevStep = () => {
        playClick?.();
        setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCognitiveAnswer = (index, value) => {
        setCognitiveAnswers(prev => ({ ...prev, [index]: value }));
    };

    const handlePedagogicAnswer = (index, value) => {
        setPedagogicAnswers(prev => ({ ...prev, [index]: value }));
    };

    const handleFinish = async () => {
        playSuccess?.();
        try {
            // Format responses for API
            const responses = [];

            // Add cognitive responses
            Object.entries(cognitiveAnswers).forEach(([index, answer]) => {
                const questionId = cognitiveQuestions[index].id;
                responses.push({ question_id: questionId, answer: String(answer) });
            });

            // Add pedagogic responses
            Object.entries(pedagogicAnswers).forEach(([index, answerIndex]) => {
                const question = pedagogicQuestions[index];
                const actualAnswer = question.option[answerIndex];
                responses.push({ question_id: question.id, answer: actualAnswer });
            });

            const response = await api.post('/profiling/submit/', { responses });

            console.log('Submission success:', response.data);
            navigate('/dashboard', { state: { profileCompleted: true, profilingResult: response.data } });
        } catch (error) {
            console.error('Failed to submit profiling:', error);
            alert('Failed to submit survey. Please try again.');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-white text-center p-8">
                        <div className="bg-[#4CAF50] rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center transition-all">
                            <h1 className="text-7xl font-bold mb-8 leading-tight">Student Information</h1>
                            <div className="w-full h-1 bg-white opacity-40 mb-10 max-w-[80%]"></div>
                            <p className="text-3xl font-semibold tracking-[0.3em] uppercase opacity-90">5 QUESTION</p>
                        </div>
                        <button
                            onClick={nextStep}
                            className="mt-16 bg-white text-[#4CAF50] px-20 py-6 rounded-full font-bold text-3xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                            START
                        </button>
                    </div>
                );
            case 1:
                return (
                    <StepCard
                        title="What should we call you?"
                        onNext={nextStep}
                        onPrev={prevStep}
                        isNextDisabled={!formData.firstName || !formData.lastName}
                    >
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Rio"
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] transition-all placeholder:text-gray-400 placeholder:font-normal"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Alvein"
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] transition-all placeholder:text-gray-400 placeholder:font-normal"
                                />
                            </div>
                        </div>
                    </StepCard>
                );
            case 2:
                return (
                    <StepCard
                        title="When's your birthday?"
                        onNext={nextStep}
                        onPrev={prevStep}
                        isNextDisabled={!formData.birthDay || !formData.birthMonth || !formData.birthYear}
                    >
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Day</label>
                                <select
                                    name="birthDay"
                                    value={formData.birthDay}
                                    onChange={handleChange}
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all"
                                >
                                    <option value="">Day</option>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-[1.5]">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Month</label>
                                <select
                                    name="birthMonth"
                                    value={formData.birthMonth}
                                    onChange={handleChange}
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all"
                                >
                                    <option value="">Month</option>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Year</label>
                                <select
                                    name="birthYear"
                                    value={formData.birthYear}
                                    onChange={handleChange}
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all"
                                >
                                    <option value="">Year</option>
                                    {[...Array(50)].map((_, i) => (
                                        <option key={i} value={2026 - i}>{2026 - i}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </StepCard>
                );
            case 3:
                return (
                    <StepCard
                        title="How do you identify your gender?"
                        onNext={nextStep}
                        onPrev={prevStep}
                        isNextDisabled={!formData.gender}
                    >
                        <div className="flex gap-4 sm:gap-6 justify-between items-stretch mb-4">
                            {[
                                {
                                    id: 'Male',
                                    label: 'Male',
                                    color: '#2563EB',
                                    bgColor: 'bg-[#EAF5FF]',
                                    borderColor: '#B9E1FB',
                                    circleColor: 'bg-[#DEE9FA]',
                                    icon: maleIcon
                                },
                                {
                                    id: 'Female',
                                    label: 'Female',
                                    color: '#DB2777',
                                    bgColor: 'bg-[#FFF0F9]',
                                    borderColor: '#F9CDEA',
                                    circleColor: 'bg-[#FCE1F1]',
                                    icon: femaleIcon
                                },
                                {
                                    id: 'Other',
                                    label: 'Prefer not to say',
                                    color: '#65A30D',
                                    bgColor: 'bg-[#F9FFF0]',
                                    borderColor: '#D9F99D',
                                    circleColor: 'bg-[#E3F8C5]',
                                    icon: genderIcon
                                }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setFormData(prev => ({ ...prev, gender: option.id }))}
                                    className={`flex-1 aspect-square flex flex-col items-center justify-center p-4 sm:p-6 rounded-[32px] border-2 transition-all duration-300 gap-3 sm:gap-4 ${option.bgColor} ${formData.gender === option.id
                                        ? 'shadow-md scale-105 filter brightness-[0.98]'
                                        : 'hover:scale-[1.02] hover:shadow-sm'
                                        }`}
                                    style={{
                                        borderColor: option.borderColor,
                                        borderWidth: formData.gender === option.id ? '2.5px' : '2px'
                                    }}
                                >
                                    <div
                                        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${option.circleColor} ${formData.gender === option.id ? 'shadow-inner' : ''
                                            }`}
                                    >
                                        <img src={option.icon} alt={option.label} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                                    </div>
                                    <span className={`text-sm sm:text-base font-bold text-center leading-tight tracking-tight px-2 ${formData.gender === option.id ? 'text-gray-900' : 'text-gray-600'
                                        }`}>
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </StepCard>
                );
            case 4:
                return (
                    <StepCard
                        title="What are your academic details?"
                        onNext={nextStep}
                        onPrev={prevStep}
                        nextLabel="NEXT"
                        isNextDisabled={!formData.studentClass || !formData.studentId}
                    >
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Student Class</label>
                                <select
                                    name="studentClass"
                                    value={formData.studentClass}
                                    onChange={handleChange}
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all"
                                >
                                    <option value="">Select Class</option>
                                    <option value="ST-26">ST-26</option>
                                    <option value="ST-27">ST-27</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Student ID (NIM)</label>
                                <input
                                    type="text"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    placeholder="G6401221042"
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] transition-all placeholder:text-gray-400 placeholder:font-normal"
                                />
                            </div>
                        </div>
                    </StepCard>
                );
            case 5:
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 transition-all duration-500">
                        <div className="bg-white rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center text-center">
                            <div className="text-9xl mb-10">🎉</div>
                            <h2 className="text-6xl font-extrabold mb-8 text-gray-900 leading-tight">You're All Set!</h2>
                            <div className="w-full h-1 bg-gray-100 opacity-50 mb-10 max-w-[60%]"></div>
                            <p className="text-3xl text-gray-400 mb-14">
                                Let's Move On to the <span className="font-bold text-[#4CAF50]">Cognitive Quiz! 🚀</span>
                            </p>
                            <button
                                onClick={nextStep}
                                className="bg-[#4CAF50] text-white px-16 py-6 rounded-full font-extrabold text-3xl hover:bg-[#43a047] transition-all hover:scale-110 active:scale-95 shadow-xl shadow-green-100"
                            >
                                Take Cognitive Quiz
                            </button>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-white text-center p-8 transition-all duration-500">
                        <div className="bg-[#B33A9D] rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center transition-all">
                            <h1 className="text-7xl font-bold mb-8 leading-tight">Cognitive Quiz</h1>
                            <div className="w-full h-1 bg-white opacity-40 mb-10 max-w-[80%]"></div>
                            <p className="text-3xl font-semibold tracking-[0.3em] uppercase opacity-90">{cognitiveQuestions.length} QUESTION</p>
                        </div>
                        <button
                            onClick={nextStep}
                            className="mt-16 bg-white text-[#B33A9D] px-20 py-6 rounded-full font-bold text-3xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                            START
                        </button>
                    </div>
                );
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
                const qCogIndex = step - 7;
                const cogQ = cognitiveQuestions[qCogIndex];
                return (
                    <StepCard
                        title={cogQ.question}
                        onNext={nextStep}
                        onPrev={prevStep}
                        isNextDisabled={!cognitiveAnswers[qCogIndex]}
                        themeColor="#B33A9D"
                    >
                        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleCognitiveAnswer(qCogIndex, num)}
                                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl font-extrabold text-2xl sm:text-3xl transition-all duration-200 border-2 ${cognitiveAnswers[qCogIndex] === num
                                        ? 'bg-[#B43FB3] text-white border-[#B43FB3] scale-110 shadow-lg'
                                        : 'bg-[#FCE4EC] text-[#B33A9D] border-[#F8BBD0] hover:bg-[#F8BBD0] hover:scale-105'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </StepCard>
                );
            case (7 + cognitiveQuestions.length): // This replaces step 17
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 transition-all duration-500">
                        <div className="bg-white rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center text-center">
                            <div className="text-9xl mb-10">🚀</div>
                            <h2 className="text-6xl font-extrabold mb-8 text-gray-900 leading-tight">You're Good to Go!</h2>
                            <div className="w-full h-1 bg-gray-100 opacity-50 mb-10 max-w-[60%]"></div>
                            <p className="text-3xl text-gray-400 mb-14">
                                Let's Move On to the <span className="font-bold text-[#B33A9D]">Pedagogic Quiz! ✨</span>
                            </p>
                            <button
                                onClick={nextStep}
                                className="bg-[#B33A9D] text-white px-16 py-6 rounded-full font-extrabold text-3xl hover:bg-[#8a2d79] transition-all hover:scale-110 active:scale-95 shadow-xl"
                            >
                                Take Pedagogic Quiz
                            </button>
                        </div>
                    </div>
                );
            case (8 + cognitiveQuestions.length): // This replaces step 18
                return (
                    <div className="flex flex-col items-center justify-center h-full text-white text-center p-8 transition-all duration-500">
                        <div className="bg-[#419FB1] rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center transition-all">
                            <h1 className="text-7xl font-bold mb-8 leading-tight">Pedagogic Quiz</h1>
                            <div className="w-full h-1 bg-white opacity-40 mb-10 max-w-[80%]"></div>
                            <p className="text-3xl font-semibold tracking-[0.3em] uppercase opacity-90">{pedagogicQuestions.length} QUESTION</p>
                        </div>
                        <button
                            onClick={nextStep}
                            className="mt-16 bg-white text-[#419FB1] px-20 py-6 rounded-full font-bold text-3xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                            START
                        </button>
                    </div>
                );
            default:
                if (step >= 7 && step < 7 + cognitiveQuestions.length) {
                    const idx = step - 7;
                    const qCog = cognitiveQuestions[idx];
                    return (
                        <StepCard
                            title={qCog.question}
                            onNext={nextStep}
                            onPrev={prevStep}
                            isNextDisabled={!cognitiveAnswers[idx]}
                            themeColor="#B33A9D"
                        >
                            <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8">
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleCognitiveAnswer(idx, num)}
                                        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl font-extrabold text-2xl sm:text-3xl transition-all duration-200 border-2 ${cognitiveAnswers[idx] === num
                                            ? 'bg-[#B43FB3] text-white border-[#B43FB3] scale-110 shadow-lg'
                                            : 'bg-[#FCE4EC] text-[#B33A9D] border-[#F8BBD0] hover:bg-[#F8BBD0] hover:scale-105'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </StepCard>
                    );
                }

                const pedStartAt = 9 + cognitiveQuestions.length;
                if (step >= pedStartAt && step < pedStartAt + pedagogicQuestions.length) {
                    const qPedIndex = step - pedStartAt;
                    const pedagogicQ = pedagogicQuestions[qPedIndex];
                    const isLast = qPedIndex === pedagogicQuestions.length - 1;

                    return (
                        <StepCard
                            title={pedagogicQ.question}
                            onNext={isLast ? handleFinish : nextStep}
                            onPrev={prevStep}
                            nextLabel={isLast ? "FINISH" : "NEXT"}
                            isNextDisabled={!pedagogicAnswers[qPedIndex] && pedagogicAnswers[qPedIndex] !== 0}
                            themeColor="#419FB1"
                        >
                            <div className="space-y-4">
                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                                    {pedagogicQ.challenge}
                                </p>
                                {pedagogicQ.image && (
                                    <div className="flex justify-center mb-4">
                                        <img src={`/media/${pedagogicQ.image}`} alt="Question Diagram" className="max-h-40 object-contain rounded-lg border border-gray-100" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {(pedagogicQ.option || []).map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handlePedagogicAnswer(qPedIndex, idx)}
                                            className={`p-3 rounded-xl border-2 transition-all font-bold ${pedagogicAnswers[qPedIndex] === idx
                                                ? 'border-[#419FB1] bg-[#E0F2F1] text-[#006064]'
                                                : 'border-[#B2EBF2] bg-[#E1F5FE] text-[#01579B] hover:border-[#81D4FA]'
                                                }`}
                                        >
                                            {pedagogicQ.type === 'image_choice' ? (
                                                <img src={opt} alt={`Option ${idx}`} className="w-full h-auto rounded-lg" />
                                            ) : opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </StepCard>
                    );
                }
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#98E490] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
            </div>
        );
    }

    const isCognitiveIntro = step === 6;
    const isCognitiveQuiz = step >= 7 && step <= 16;
    const isPedagogicIntroStep = step === 17;
    const isPedagogicStart = step === 18;
    const isPedagogicQuiz = step >= 19;

    const cogEndAt = 7 + cognitiveQuestions.length;
    const pedStartAt = 9 + cognitiveQuestions.length;
    const isPedBank = step >= pedStartAt;

    let bgColor = 'bg-[#98E490]'; // Student Info Green
    if (step >= 6 && step < cogEndAt + 1) bgColor = 'bg-[#F3A9D2]'; // Cognitive Pink
    if (step >= cogEndAt + 1) bgColor = 'bg-[#A0E4F1]'; // Pedagogic Blue

    return (
        <div className={`min-h-screen ${bgColor} flex items-center justify-center font-sans transition-colors duration-500`}>
            <div className="w-full h-full max-w-4xl mx-auto flex flex-col justify-center">
                {renderStep()}
            </div>
        </div>
    );
}

function StepCard({ title, children, onNext, onPrev, nextLabel = "NEXT", isNextDisabled, themeColor = "#4CAF50" }) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-t-[40px] p-10 pb-12 shadow-sm min-h-[220px] flex flex-col justify-center">
                <h2 className="text-2xl font-extrabold text-[#333] mb-8">{title}</h2>
                {children}
            </div>
            <div
                className="rounded-b-[40px] flex justify-between px-10 py-6 items-center shadow-lg transition-colors duration-500"
                style={{ backgroundColor: themeColor }}
            >
                <button
                    onClick={onPrev}
                    className="text-white font-bold text-xl tracking-widest hover:opacity-80 transition-opacity"
                >
                    PREV
                </button>
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className={`text-white font-bold text-xl tracking-widest hover:opacity-80 transition-opacity ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {nextLabel}
                </button>
            </div>
        </div>
    );
}
