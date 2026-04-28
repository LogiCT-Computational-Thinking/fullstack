import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';
import maleIcon from '../assets/Male.png';
import femaleIcon from '../assets/Female.png';
import genderIcon from '../assets/Gender.png';
import api from '../services/api';
import ProfilingResultModal from '../components/ProfilingResultModal';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';


export default function ProfilingQuiz() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const { playClick, playSuccess } = useSound();
    const [step, setStep] = useState(0);
    const hasLoadedRef = useRef(false);
    // Use a stable timestamp for the session to prevent flickering but bypass cache on reload
    const [cacheBuster] = useState(Date.now());
    const [studentClasses, setStudentClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await authService.getStudentClasses();
                setStudentClasses(data);
            } catch (err) {
                console.error("Failed to fetch student classes:", err);
            }
        };
        fetchClasses();
    }, []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        gender: '',
        classType: '',
        classNumber: '',
        studentId: ''
    });

    // Helper to get name parts from user object
    const getNameParts = (userData) => {
        if (!userData || !userData.name) return { first: '', last: '' };
        const nameParts = userData.name.trim().split(/\s+/);
        return {
            first: nameParts[0] || '',
            last: nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
        };
    };


    const [cognitiveQuestions, setCognitiveQuestions] = useState([]);
    const [pedagogicQuestions, setPedagogicQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cognitiveAnswers, setCognitiveAnswers] = useState({});
    const [pedagogicAnswers, setPedagogicAnswers] = useState({});
    const [showResultModal, setShowResultModal] = useState(false);
    const [profilingResult, setProfilingResult] = useState(null);

    const cogEndAt = 7 + cognitiveQuestions.length;
    const pedStartAt = 9 + cognitiveQuestions.length;



    // NEW: Save state to backend
    const saveDraft = async (updates = {}) => {
        if (!user || !user.email) return;
        
        const payload = {
            step: updates.step !== undefined ? updates.step : step,
            form_data: updates.formData || formData,
            cognitive_answers: updates.cognitiveAnswers || cognitiveAnswers,
            pedagogic_answers: updates.pedagogicAnswers || pedagogicAnswers
        };

        try {
            await api.post('/profiling/save-draft/', payload);
        } catch (err) {
            console.error("Failed to save profiling draft to server:", err);
        }
    };

    // Load saved state from localStorage and server
    useEffect(() => {
        if (user && user.email && !hasLoadedRef.current) {
            hasLoadedRef.current = true;

            // === GUARD: If user has already completed profiling ===
            if (user.archetype_info) {
                localStorage.removeItem(`profiling_quiz_state_${user.email}`);
                setProfilingResult(user.archetype_info);
                setShowResultModal(true);
                fetchQuestions(user); 
                return;
            }

            // After checking basic user info, fetch questions and saved state
            fetchQuestions(user);
        }
    }, [user]);

    // Internal hook to auto-save whenever answers, step or formData change
    useEffect(() => {
        if (user && user.email && hasLoadedRef.current) {
            // Save to localStorage (as backup)
            const stateToSave = {
                step,
                formData,
                cognitiveAnswers,
                pedagogicAnswers,
                cognitiveQuestions,
                pedagogicQuestions
            };
            localStorage.setItem(`profiling_quiz_state_${user.email}`, JSON.stringify(stateToSave));

            // Also save to server (Draft)
            saveDraft();
        }
    }, [step, formData, cognitiveAnswers, pedagogicAnswers]);


    const fetchQuestions = async (currentUser) => {
        setIsLoading(true);
        try {
            const response = await api.get('/profiling/questions/');
            const { questions, saved_state } = response.data;

            const cog = questions.filter(q => q.category.startsWith('PROFILING_COGNITIVE'));
            const ped = questions
                .filter(q => q.category === 'PROFILING_PEDAGOGY')
                .sort((a, b) => (a.level || 0) - (b.level || 0));

            setCognitiveQuestions(cog);
            setPedagogicQuestions(ped);

            // Restore from server if available
            if (saved_state) {
                if (saved_state.step !== undefined) setStep(saved_state.step);
                if (saved_state.form_data) {
                    setFormData(prev => ({
                        ...prev,
                        ...saved_state.form_data
                    }));
                }
                if (saved_state.cognitive_answers) setCognitiveAnswers(saved_state.cognitive_answers);
                if (saved_state.pedagogic_answers) setPedagogicAnswers(saved_state.pedagogic_answers);
            }

            // Fallback: If server is empty but student info exists in context, pre-fill formData
            const activeUser = currentUser || user;
            if (activeUser && !saved_state) {
                const { first, last } = getNameParts(activeUser);
                setFormData(prev => ({
                    ...prev,
                    firstName: prev.firstName || first,
                    lastName: prev.lastName || last
                }));
            }
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setIsLoading(false);
        }
    };



    const [isSaving, setIsSaving] = useState(false);

    const nextStep = async () => {
        playClick?.();
        // If we are at the last step of Student Info (academic details), save to DB
        if (step === 4) {
            await handleSaveStudentInfo();
        }
        // If we are at the "You're Good to Go!" screen (after cognitive questions), save cognitive answers
        else if (step === 7 + cognitiveQuestions.length) {
            await handleSaveCognitiveAnswers();
        }
        else {
            setStep(step + 1);
        }
    };

    const handleSaveCognitiveAnswers = async () => {
        if (isSaving) return;
        setIsSaving(true);
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
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStudentInfo = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            // Convert birthday to YYYY-MM-DD
            const monthMap = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };

            // Ensure birthDay is treated as string to avoid padStart crash if it's a number
            const dayStr = String(formData.birthDay || '1');
            const formattedDate = `${formData.birthYear}-${monthMap[formData.birthMonth]}-${dayStr.padStart(2, '0')}`;

            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                birth_date: formattedDate,
                gender: formData.gender,
                student_class: `${formData.classType}-${formData.classNumber}`,
                student_id: formData.studentId
            };

            const response = await api.post('/auth/profiling/student-info/', payload);

            const updatedUser = response.data.user || response.data;
            if (updatedUser) {
                // Manually save the next state immediately before updating user to prevent race condition
                const stateToSave = {
                    step: step + 1,
                    formData,
                    cognitiveAnswers,
                    pedagogicAnswers,
                    cognitiveQuestions,
                    pedagogicQuestions
                };
                localStorage.setItem(`profiling_quiz_state_${user.email}`, JSON.stringify(stateToSave));

                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            setStep(step + 1);
        } catch (error) {
            console.error('Failed to save student info:', error);
            alert('Failed to save information. Please try again.');
        } finally {
            setIsSaving(false);
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
        if (isSaving) return;
        setIsSaving(true);
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
                setUser(response.data.user);
            }

            // Clear saved progress on successful submission
            if (user && user.email) {
                localStorage.removeItem(`profiling_quiz_state_${user.email}`);
            }

            setProfilingResult(response.data.user?.archetype_info);

            setShowResultModal(true);
            // We'll navigate when the modal is closed
            // navigate('/dashboard', { state: { profileCompleted: true, profilingResult: response.data } });
        } catch (error) {
            console.error('Failed to submit profiling:', error);
            alert('Failed to submit survey. Please try again.');
        } finally {
            setIsSaving(false);
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
                                    <option value="" className="text-gray-400">Day</option>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1} className="text-gray-900">{i + 1}</option>
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
                                    <option value="" className="text-gray-400">Month</option>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                        <option key={m} value={m} className="text-gray-900">{m}</option>
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
                                    <option value="" className="text-gray-400">Year</option>
                                    {[...Array(50)].map((_, i) => (
                                        <option key={i} value={2026 - i} className="text-gray-900">{2026 - i}</option>
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
                                    bgColor: 'bg-[#EAF5FF]',
                                    selectedBg: 'from-[#4198BC] to-[#204A5C]',
                                    hoverBg: 'hover:from-[#4198BC] hover:to-[#204A5C]',
                                    borderColor: 'border-[#B9E1FB]',
                                    circleColor: 'bg-[#DEE9FA]',
                                    selectedCircle: 'bg-[#0D222E]',
                                    hoverCircle: 'group-hover:bg-[#0D222E]',
                                    iconColor: '#2563EB',
                                    icon: maleIcon
                                },
                                {
                                    id: 'Female',
                                    label: 'Female',
                                    bgColor: 'bg-[#FFF0F9]',
                                    selectedBg: 'from-[#A92A67] to-[#5C163A]',
                                    hoverBg: 'hover:from-[#A92A67] hover:to-[#5C163A]',
                                    borderColor: 'border-[#F9CDEA]',
                                    circleColor: 'bg-[#FCE1F1]',
                                    selectedCircle: 'bg-[#2D0B1B]',
                                    hoverCircle: 'group-hover:bg-[#2D0B1B]',
                                    iconColor: '#DB2777',
                                    icon: femaleIcon
                                }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setFormData(prev => ({ ...prev, gender: option.id }))}
                                    className={`flex-1 flex flex-col items-center justify-center py-6 sm:py-8 px-3 rounded-[32px] border-2 transition-all duration-300 gap-2 group ${formData.gender === option.id
                                        ? `bg-gradient-to-b ${option.selectedBg} border-transparent shadow-lg scale-105`
                                        : `${option.bgColor} ${option.borderColor} hover:bg-gradient-to-b ${option.hoverBg} hover:border-transparent hover:scale-[1.02] hover:shadow-md`
                                        }`}
                                >
                                    <div
                                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${formData.gender === option.id
                                            ? option.selectedCircle
                                            : `${option.circleColor} ${option.hoverCircle}`
                                            }`}
                                    >
                                        <div
                                            style={{
                                                backgroundColor: formData.gender === option.id ? 'white' : undefined,
                                                '--icon-color': option.iconColor,
                                                maskImage: `url(${option.icon})`,
                                                WebkitMaskImage: `url(${option.icon})`,
                                                maskMode: 'alpha',
                                                maskRepeat: 'no-repeat',
                                                maskPosition: 'center',
                                                maskSize: 'contain',
                                                WebkitMaskRepeat: 'no-repeat',
                                                WebkitMaskPosition: 'center',
                                                WebkitMaskSize: 'contain',
                                            }}
                                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${formData.gender === option.id
                                                ? 'bg-white'
                                                : 'bg-[var(--icon-color)] group-hover:!bg-white'
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-[13px] sm:text-sm font-bold text-center leading-tight tracking-tight px-1 transition-all duration-300 ${formData.gender === option.id
                                        ? 'text-white'
                                        : 'text-black group-hover:text-white'
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
                        nextLabel={isSaving ? "SAVING..." : "NEXT"}
                        isNextDisabled={isSaving || !formData.classType || !formData.classNumber || !formData.studentId}
                        step={step}
                        cogEndAt={cogEndAt}
                    >
                        <div className="flex gap-3 sm:gap-4 items-end mb-4">
                            <div className="flex-1">
                                <label className="block text-gray-400 font-bold text-[13px] mb-2 ml-1">Class Type</label>
                                <div className="relative">
                                    <select
                                        name="classType"
                                        value={formData.classType}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFormData(prev => ({ ...prev, classNumber: '' }));
                                        }}
                                        className={`w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] rounded-2xl px-4 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all ${!formData.classType ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'}`}
                                    >
                                        <option value="" className="text-gray-400">Type</option>
                                        {[...new Set(studentClasses.map(c => c.class_type))].map(type => (
                                            <option key={type} value={type} className="text-gray-900">{type}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-400 font-bold text-[13px] mb-2 ml-1">Class Number</label>
                                <div className="relative">
                                    <select
                                        name="classNumber"
                                        value={formData.classNumber}
                                        onChange={handleChange}
                                        disabled={!formData.classType}
                                        className={`w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] rounded-2xl px-4 py-3.5 outline-none focus:border-[#4CAF50] appearance-none transition-all ${!formData.classNumber ? 'text-gray-400 font-normal' : 'text-gray-900 font-bold'} ${!formData.classType ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="" className="text-gray-400">Class</option>
                                        {studentClasses
                                            .filter(c => c.class_type === formData.classType)
                                            .sort((a, b) => a.class_number - b.class_number)
                                            .map(c => (
                                                <option key={c.id} value={c.class_number} className="text-gray-900">
                                                    {c.class_number}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-[2]">
                                <label className="block text-gray-400 font-bold text-[13px] mb-2 ml-1">Student ID (NIM)</label>
                                <input
                                    type="text"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    placeholder="G6401221042"
                                    className="w-full bg-[#E8F5E9] border-2 border-[#C8E6C9] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#4CAF50] transition-all placeholder:text-gray-300 placeholder:font-normal"
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
                            <h2 className="text-6xl font-bold mb-8 text-gray-900 leading-tight">You're All Set!</h2>
                            <div className="w-full h-1 bg-gray-100 opacity-50 mb-10 max-w-[60%]"></div>
                            <p className="text-3xl text-gray-400 mb-14">
                                Let's Move On to the <span className="font-bold text-[#4CAF50]">Cognitive Quiz! 🚀</span>
                            </p>
                            <button
                                onClick={nextStep}
                                disabled={isSaving}
                                className={`bg-gradient-to-b from-[#2EBD40] to-[#115429] text-white px-16 py-5 rounded-full font-semibold text-3xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? "Saving..." : "Take Cognitive Quiz"}
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
                        nextLabel={isSaving ? "SAVING..." : "NEXT"}
                        isNextDisabled={isSaving || !cognitiveAnswers[qCogIndex]}
                        themeColor="#B33A9D"
                        step={step}
                        cogEndAt={cogEndAt}
                    >
                        <div className="mt-4">
                            <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4">
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleCognitiveAnswer(qCogIndex, num)}
                                        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl font-bold text-2xl sm:text-3xl transition-all duration-300 border-2 ${cognitiveAnswers[qCogIndex] === num
                                            ? 'bg-gradient-to-b from-[#B5369E] to-[#4F1845] text-white border-transparent shadow-lg scale-110'
                                            : 'bg-[#FCE4EC] text-[#B33A9D] border-[#F9D6E5] hover:bg-gradient-to-b hover:from-[#B5369E] hover:to-[#4F1845] hover:text-white hover:border-transparent hover:scale-105'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between px-2 text-gray-400 font-medium text-[13px] sm:text-base">
                                <span>Sangat Tidak Setuju</span>
                                <span>Sangat Setuju</span>
                            </div>
                        </div>
                    </StepCard>
                );
            case (7 + cognitiveQuestions.length): // This replaces step 17
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 transition-all duration-500">
                        <div className="bg-white rounded-[60px] p-20 shadow-2xl w-full max-w-3xl min-h-[450px] flex flex-col justify-center items-center text-center">
                            <div className="text-9xl mb-10">🚀</div>
                            <h2 className="text-6xl font-bold mb-8 text-gray-900 leading-tight">You're Good to Go!</h2>
                            <div className="w-full h-1 bg-gray-100 opacity-50 mb-10 max-w-[60%]"></div>
                            <p className="text-3xl text-gray-400 mb-14">
                                Let's Move On to the <span className="font-bold text-[#B33A9D]">Pedagogic Quiz! ✨</span>
                            </p>
                            <button
                                onClick={nextStep}
                                disabled={isSaving}
                                className={`bg-gradient-to-b from-[#B5369E] to-[#4F1845] text-white px-16 py-5 rounded-full font-semibold text-3xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-900/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? "Saving..." : "Take Pedagogic Quiz"}
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
                            <div className="mt-0">
                                <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4">
                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => handleCognitiveAnswer(idx, num)}
                                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl font-bold text-2xl sm:text-3xl transition-all duration-300 border-2 ${cognitiveAnswers[idx] === num
                                                ? 'bg-gradient-to-b from-[#B5369E] to-[#4F1845] text-white border-transparent shadow-lg scale-110'
                                                : 'bg-[#FCE4EC] text-[#B33A9D] border-[#F9D6E5] hover:bg-gradient-to-b hover:from-[#B5369E] hover:to-[#4F1845] hover:text-white hover:border-transparent hover:scale-105'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between px-2 text-gray-400 font-medium text-[13px] sm:text-base">
                                    <span>Sangat Tidak Setuju</span>
                                    <span>Sangat Setuju</span>
                                </div>
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
                            title={(pedagogicQ.question || "").replace(/\\n/g, '\n')}
                            onNext={isLast ? handleFinish : nextStep}
                            onPrev={prevStep}
                            nextLabel={isLast ? (isSaving ? "FINISHING..." : "FINISH") : (isSaving ? "SAVING..." : "NEXT")}
                            isNextDisabled={isSaving || (!pedagogicAnswers[qPedIndex] && pedagogicAnswers[qPedIndex] !== 0)}
                            themeColor="#419FB1"
                            step={step}
                            cogEndAt={cogEndAt}
                        >
                            <div className="space-y-4">
                                <div className="text-gray-700 text-base sm:text-lg leading-tight mb-6 font-normal whitespace-pre-line">
                                    {(pedagogicQ.challenge || "").replace(/\\n/g, '\n')}
                                </div>
                                {pedagogicQ.image && (
                                    <div className="flex justify-center mb-8">
                                        <img
                                            src={`${pedagogicQ.image.startsWith('/media/') ? pedagogicQ.image : `/media/${pedagogicQ.image}`}?t=${cacheBuster}`}
                                            alt="Question Diagram"
                                            className="max-h-[400px] sm:max-h-[500px] w-full object-contain rounded-2xl shadow-md border border-gray-50"
                                        />
                                    </div>
                                )}

                                {pedagogicQ.type?.toLowerCase().includes('short') || pedagogicQ.type?.toLowerCase().includes('fill') ? (
                                    <div className="mt-4">
                                        <div className="text-gray-400 text-sm mb-2 ml-1">Type ur answer...</div>
                                        <input
                                            type="text"
                                            value={pedagogicAnswers[qPedIndex] || ""}
                                            onChange={(e) => handlePedagogicAnswer(qPedIndex, e.target.value)}
                                            placeholder="Type your answer"
                                            className="w-full bg-[#EBFDFF] border-2 border-[#B2EBF2] text-gray-900 font-bold rounded-2xl px-5 py-3.5 outline-none focus:border-[#419FB1] transition-all placeholder:text-gray-300 placeholder:font-normal"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        {pedagogicQ.type.startsWith('multi_select') && (
                                            <div className="text-gray-400 text-sm mb-4 ml-1">Select two or more options..</div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                                                        className={`p-3 sm:p-4 rounded-2xl border-2 transition-all font-semibold text-left flex items-center gap-4 ${isSelected
                                                            ? 'border-[#419FB1] bg-[#E0F2F1] text-[#006064] shadow-md'
                                                            : 'border-[#B2EBF2] bg-[#EBFDFF] text-gray-900 hover:border-[#419FB1] hover:bg-[#E0F2F1]'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${isSelected ? 'bg-[#419FB1] border-[#419FB1]' : 'border-[#B2EBF2] bg-white opacity-40'}`} />
                                                        {((pedagogicQ.type || "").includes('_image') || (typeof opt === 'string' && /\.(png|jpe?g|gif|svg|webp)$/i.test(opt))) ? (
                                                            <img
                                                                src={`${typeof opt === 'string' && opt.startsWith('/media/') ? opt : (opt.includes('/') ? `/media/${opt}` : `/media/questions/${opt}`)}?t=${cacheBuster}`}
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
                    <div className="w-full max-w-5xl px-4 flex flex-col items-center">
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

            {/* Main Content: Adjusting padding based on quiz type to ensure long questions in Quiz 3 don't get cut off, while keeping Quiz 1 & 2 better positioned */}
            <div className={`flex-1 w-full max-w-4xl flex flex-col relative z-10 overflow-y-auto ${progressInfo.show ? (step >= pedStartAt ? 'pt-56 pb-24' : 'pt-43 pb-24') : 'justify-center py-20'}`}>
                <div className="w-full my-auto">
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
        <div className="w-full max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-t-[40px] p-8 sm:p-12 pb-14 shadow-sm min-h-[250px] flex flex-col justify-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#222] mb-6 leading-tight whitespace-pre-line text-left text-justify w-full">{title}</h2>
                {children}
            </div>
            <div
                className="rounded-b-[40px] flex justify-between px-16 py-5 items-center relative overflow-hidden transition-all duration-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]"
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
                    className="flex items-center gap-3 text-white font-bold text-xl tracking-widest transition-colors duration-200 hover:text-[#FF8800] active:text-[#000000] group/btn"
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
                    className={`flex items-center gap-3 font-bold text-xl tracking-widest transition-colors duration-200 ${isNextDisabled ? 'text-white/30 cursor-not-allowed' : 'text-white hover:text-[#FF8800] active:text-[#000000]'} group/btn`}
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
