import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';
import maleIcon from '../assets/Male.png';
import femaleIcon from '../assets/Female.png';
import genderIcon from '../assets/Gender.png';
import api from '../services/api';
import ProfilingResultModal from '../components/ProfilingResultModal';

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
    const [showResultModal, setShowResultModal] = useState(false);
    const [profilingResult, setProfilingResult] = useState(null);

    const cogEndAt = 7 + cognitiveQuestions.length;
    const pedStartAt = 9 + cognitiveQuestions.length;

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
            const ped = allQuestions
                .filter(q => q.category === 'PROFILING_PEDAGOGY')
                .sort((a, b) => (a.level || 0) - (b.level || 0));

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
        const question = pedagogicQuestions[index];
        const isMulti = question.type.startsWith('multi_select');

        if (isMulti) {
            setPedagogicAnswers(prev => {
                const current = prev[index] || "";
                const answers = current ? current.split('|') : [];
                if (answers.includes(value)) {
                    const filtered = answers.filter(a => a !== value);
                    return { ...prev, [index]: filtered.join('|') };
                } else {
                    return { ...prev, [index]: [...answers, value].join('|') };
                }
            });
        } else {
            setPedagogicAnswers(prev => ({ ...prev, [index]: value }));
        }
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
            Object.entries(pedagogicAnswers).forEach(([index, answerValue]) => {
                const question = pedagogicQuestions[index];
                // Send as string (index for MC, pipe-separated string for Multi)
                responses.push({ question_id: question.id, answer: String(answerValue) });
            });

            const response = await api.post('/profiling/submit/', { responses });

            console.log('Submission success:', response.data);

            // Update local user data with the new profiling results
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            setProfilingResult(response.data.user?.archetype_info);
            setShowResultModal(true);
            // We'll navigate when the modal is closed
            // navigate('/dashboard', { state: { profileCompleted: true, profilingResult: response.data } });
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
                        <div
                            onClick={nextStep}
                            className="bg-gradient-to-b from-[#115429] to-[#2EBD40] hover:from-[#9BFC9B] hover:to-[#BDFFBD] rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group border-2 border-transparent hover:border-[#115429]"
                        >
                            <h1 className="text-7xl font-medium mb-8 leading-tight text-white group-hover:text-[#115429] transition-colors duration-300">Student Information</h1>
                            <div className="w-full h-[2px] bg-white group-hover:bg-[#115429] opacity-40 group-hover:opacity-100 mb-10 max-w-[80%] transition-all duration-300"></div>
                            <p className="text-3xl font-normal tracking-[0.3em] uppercase text-white/90 group-hover:text-[#115429] transition-colors duration-300">5 QUESTION</p>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <StepCard
                        title="What should we call you?"
                        onNext={nextStep}
                        onPrev={prevStep}
                        isNextDisabled={!formData.firstName || !formData.lastName}
                        step={step}
                        cogEndAt={cogEndAt}
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
                        step={step}
                        cogEndAt={cogEndAt}
                    >
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Day</label>
                                <select
                                    name="birthDay"
                                    value={formData.birthDay}
                                    onChange={handleChange}
                                    className={`w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all ${!formData.birthDay ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'}`}
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
                                    className={`w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all ${!formData.birthMonth ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'}`}
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
                                    className={`w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all ${!formData.birthYear ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'}`}
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
                        step={step}
                        cogEndAt={cogEndAt}
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
                        step={step}
                        cogEndAt={cogEndAt}
                    >
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-gray-500 font-bold text-sm mb-1 ml-1">Student Class</label>
                                <select
                                    name="studentClass"
                                    value={formData.studentClass}
                                    onChange={handleChange}
                                    className={`w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all ${!formData.studentClass ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'}`}
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
                                className="bg-gradient-to-b from-[#2EBD40] to-[#115429] text-white px-16 py-5 rounded-full font-semibold text-3xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20"
                            >
                                Take Cognitive Quiz
                            </button>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-white text-center p-8 transition-all duration-500">
                        <div
                            onClick={nextStep}
                            className="bg-gradient-to-b from-[#4F1845] to-[#B5369E] hover:from-[#EEB3D2] hover:to-[#F9D6E5] rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group border-2 border-transparent hover:border-[#B5369E]"
                        >
                            <h1 className="text-7xl font-medium mb-8 leading-tight text-white group-hover:text-[#4F1845] transition-colors duration-300">Cognitive Quiz</h1>
                            <div className="w-full h-[2px] bg-white group-hover:bg-[#4F1845] opacity-40 group-hover:opacity-100 mb-10 max-w-[80%] transition-all duration-300"></div>
                            <p className="text-3xl font-normal tracking-[0.3em] uppercase text-white/90 group-hover:text-[#4F1845] transition-colors duration-300">{cognitiveQuestions.length} QUESTION</p>
                        </div>
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
                        step={step}
                        cogEndAt={cogEndAt}
                    >
                        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleCognitiveAnswer(qCogIndex, num)}
                                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl font-bold text-2xl sm:text-3xl transition-all duration-200 border-2 ${cognitiveAnswers[qCogIndex] === num
                                        ? 'bg-[#B43FB3] text-white border-[#B43FB3] shadow-lg scale-110'
                                        : 'bg-[#FCE4EC] text-[#B33A9D] border-[#F9D6E5] hover:border-[#F48FB1] hover:bg-[#F8BBD0]'
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
                                className="bg-gradient-to-b from-[#B5369E] to-[#4F1845] text-white px-16 py-5 rounded-full font-semibold text-3xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-900/20"
                            >
                                Take Pedagogic Quiz
                            </button>
                        </div>
                    </div>
                );
            case (8 + cognitiveQuestions.length): // This replaces step 18
                return (
                    <div className="flex flex-col items-center justify-center h-full text-white text-center p-8 transition-all duration-500">
                        <div
                            onClick={nextStep}
                            className="bg-gradient-to-b from-[#004D54] to-[#3A9AB1] hover:from-[#B2EBF2] hover:to-[#E0F7FA] rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group border-2 border-transparent hover:border-[#004D54]"
                        >
                            <h1 className="text-7xl font-medium mb-8 leading-tight text-white group-hover:text-[#004D54] transition-colors duration-300">Pedagogic Quiz</h1>
                            <div className="w-full h-[2px] bg-white group-hover:bg-[#004D54] opacity-40 group-hover:opacity-100 mb-10 max-w-[80%] transition-all duration-300"></div>
                            <p className="text-3xl font-normal tracking-[0.3em] uppercase text-white/90 group-hover:text-[#004D54] transition-colors duration-300">{pedagogicQuestions.length} QUESTION</p>
                        </div>
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
                            step={step}
                            cogEndAt={cogEndAt}
                        >
                            <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8">
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleCognitiveAnswer(idx, num)}
                                        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl font-bold text-2xl sm:text-3xl transition-all duration-200 border-2 ${cognitiveAnswers[idx] === num
                                            ? 'bg-[#B43FB3] text-white border-[#B43FB3] shadow-lg scale-110'
                                            : 'bg-[#FCE4EC] text-[#B33A9D] border-[#F9D6E5] hover:border-[#F48FB1] hover:bg-[#F8BBD0]'
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
                            step={step}
                            cogEndAt={cogEndAt}
                        >
                            <div className="space-y-4">
                                <div className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8 font-medium whitespace-pre-line">
                                    {pedagogicQ.challenge}
                                </div>
                                {pedagogicQ.image && (
                                    <div className="flex justify-center mb-8">
                                        <img
                                            src={pedagogicQ.image.startsWith('/media/') ? pedagogicQ.image : `/media/${pedagogicQ.image}`}
                                            alt="Question Diagram"
                                            className="max-h-[400px] sm:max-h-[500px] w-full object-contain rounded-2xl shadow-md border border-gray-50"
                                        />
                                    </div>
                                )}

                                {pedagogicQ.type?.toLowerCase().includes('short') || pedagogicQ.type?.toLowerCase().includes('fill') ? (
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            value={pedagogicAnswers[qPedIndex] || ""}
                                            onChange={(e) => handlePedagogicAnswer(qPedIndex, e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 font-bold rounded-2xl px-5 py-4 outline-none focus:border-[#419FB1] transition-all"
                                        />
                                    </div>
                                ) : (
                                    <div className={`grid ${pedagogicQ.type.includes('_image') ? 'grid-cols-2' : 'grid-cols-1'} gap-4 sm:gap-6`}>
                                        {(pedagogicQ.option || []).map((opt, idx) => {
                                            const isMulti = pedagogicQ.type.startsWith('multi_select');
                                            const currentAns = pedagogicAnswers[qPedIndex] || "";
                                            const isSelected = isMulti
                                                ? currentAns.split('|').includes(opt)
                                                : currentAns === opt;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handlePedagogicAnswer(qPedIndex, opt)}
                                                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-bold text-left flex items-center gap-4 ${isSelected
                                                        ? 'border-[#419FB1] bg-[#E0F2F1] text-[#006064] shadow-md ring-2 ring-[#419FB1]/20'
                                                        : 'border-[#B2EBF2] bg-[#E1F5FE] text-[#01579B] hover:border-[#81D4FA] hover:bg-[#E1F5FE]/80'
                                                        }`}
                                                >
                                                    {((pedagogicQ.type || "").includes('_image') || (typeof opt === 'string' && /\.(png|jpe?g|gif|svg|webp)$/i.test(opt))) ? (
                                                        <img
                                                            src={typeof opt === 'string' && opt.startsWith('/media/') ? opt : (opt.includes('/') ? `/media/${opt}` : `/media/questions/${opt}`)}
                                                            alt={`Option ${idx}`}
                                                            className="w-full h-auto rounded-lg max-h-40 object-contain mx-auto"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const nextSpan = e.target.parentElement.querySelector('span');
                                                                if (nextSpan) nextSpan.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span className={`text-sm sm:text-base ${((pedagogicQ.type || "").includes('_image') || (typeof opt === 'string' && /\.(png|jpe?g|gif|svg|webp)$/i.test(opt))) ? 'hidden' : 'block'}`}>
                                                        {opt}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
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
    const getProgressInfo = () => {
        if (step >= 1 && step <= 4) {
            return { progress: ((step - 1) / 4) * 100, show: true };
        }
        if (step >= 7 && step < cogEndAt) {
            const current = step - 7;
            const total = cognitiveQuestions.length;
            return { progress: (current / total) * 100, show: true };
        }
        if (step >= pedStartAt && step < pedStartAt + pedagogicQuestions.length) {
            const current = step - pedStartAt;
            const total = pedagogicQuestions.length;
            return { progress: (current / total) * 100, show: true };
        }
        return { progress: 0, show: false };
    };

    const progressInfo = getProgressInfo();

    let bgGradient = 'linear-gradient(to bottom, #E8F9E4 0%, #A8E9A1 100%)'; // Student Info Green (Light to Dark)
    if (step >= 6 && step < cogEndAt + 1) {
        bgGradient = 'linear-gradient(to bottom, #FEF2F6 0%, #F9D6E5 100%)'; // Cognitive Pink (Light to Dark)
    }
    if (step >= cogEndAt + 1) {
        bgGradient = 'linear-gradient(to bottom, #EBFDFF 0%, #B2EBF2 100%)'; // Pedagogic Blue (Light to Dark)
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center font-sans transition-all duration-700 relative overflow-hidden"
            style={{ background: bgGradient }}
        >
            {/* Clean Full-Width Blurred Header */}
            {progressInfo.show && (
                <div
                    className="fixed top-0 left-0 w-full z-50 pt-10 pb-8 flex flex-col items-center transition-all duration-700 backdrop-blur-md"
                    style={{
                        background: `linear-gradient(to bottom, 
                            ${step >= 1 && step <= 4 ? '#E8F9E4' : step >= 6 && step < cogEndAt + 1 ? '#FEF2F6' : '#EBFDFF'} 70%, 
                            transparent 100%)`
                    }}
                >
                    <div className="w-full max-w-2xl px-4 flex flex-col items-center">
                        <div className="flex justify-center mb-3 opacity-60">
                            <img
                                src="/images/logo-logict-3.png"
                                alt="LogiCT"
                                className="h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                            />
                        </div>
                        <div className="w-full h-3 bg-gray-900/10 rounded-full relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                            <div
                                className="h-full bg-gradient-to-r from-[#FF8800] to-[#FFEE66] rounded-full transition-all duration-700 ease-out relative"
                                style={{ width: `${progressInfo.progress}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[1px] shadow-[0_0_15px_rgba(255,255,255,1),0_0_5px_rgba(255,255,255,1)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content pushed below the fixed header */}
            <div className={`flex-1 w-full max-w-4xl flex flex-col ${progressInfo.show ? 'pt-48 pb-12' : 'justify-center'} relative z-10 overflow-y-auto`}>
                <div className="w-full">
                    {renderStep()}
                </div>
            </div>
            <ProfilingResultModal
                isOpen={showResultModal}
                onClose={() => {
                    setShowResultModal(false);
                    navigate('/dashboard');
                }}
                onSeeDetails={() => {
                    setShowResultModal(false);
                    navigate('/dashboard/profile-display', { state: { resultData: profilingResult } });
                }}
                data={profilingResult}
            />
        </div>
    );
}

function StepCard({ title, children, onNext, onPrev, nextLabel = "NEXT", isNextDisabled, themeColor = "#4CAF50", step, cogEndAt }) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-t-[40px] p-8 sm:p-12 pb-14 shadow-sm min-h-[250px] flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl font-bold text-[#222] mb-10 leading-tight">{title}</h2>
                {children}
            </div>
            <div
                className="rounded-b-[40px] flex justify-between px-16 py-8 items-center relative overflow-hidden transition-all duration-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]"
                style={{
                    background: step >= 6 && step < cogEndAt + 1
                        ? 'linear-gradient(to bottom, #B5369E 0%, #4F1845 100%)' // Cognitive Purple Gradient
                        : step >= cogEndAt + 1
                            ? 'linear-gradient(to bottom, #3A9AB1 0%, #004D54 100%)' // Pedagogic Blue Gradient
                            : 'linear-gradient(to bottom, #2EBD40 0%, #115429 100%)' // Student Info Green Gradient
                }}
            >
                <button
                    onClick={onPrev}
                    className="flex items-center gap-3 text-white font-bold text-2xl tracking-widest transition-colors duration-200 hover:text-[#FF8800] active:text-[#000000] group/btn"
                >
                    <span className="flex items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-200">
                            <path d="M8 12L14 6V18L8 12Z" fill="currentColor" />
                            <circle cx="17" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="21" cy="12" r="1" fill="currentColor" opacity="0.6" />
                        </svg>
                    </span>
                    PREV
                </button>
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className={`flex items-center gap-3 font-bold text-2xl tracking-widest transition-colors duration-200 ${isNextDisabled ? 'text-white/30 cursor-not-allowed' : 'text-white hover:text-[#FF8800] active:text-[#000000]'} group/btn`}
                >
                    {nextLabel}
                    <span className="flex items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-200">
                            <path d="M16 12L10 18V6L16 12Z" fill="currentColor" />
                            <circle cx="7" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="3" cy="12" r="1" fill="currentColor" opacity="0.6" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}
