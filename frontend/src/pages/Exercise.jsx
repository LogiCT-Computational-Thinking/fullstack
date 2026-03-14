import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Edit, Settings, LogOut, Send, Loader2, User as UserIcon, Bot, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { llmService } from '../services/llmApi';
import { historyService } from '../services/historyApi';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Helper function to format chat title
const formatTitle = (text) => {
    if (!text) return "New Chat";
    const lowercaseWords = new Set([
        'dan', 'atau', 'tetapi', 'karena', 'jika', 'agar', 'supaya', 'dengan', 
        'bahwa', 'yang', 'untuk', 'di', 'ke', 'dari', 'pada', 'dalam', 'yaitu', 
        'yakni', 'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 
        'to', 'from', 'by', 'over', 'in', 'of', 'with', 'about', 'as', 'into', 'like'
    ]);
    
    return text.split(/\s+/).map((word, index) => {
        if (word.length === 0) return word;
        const lowerWord = word.toLowerCase();
        // Skip capitalizing if it's not the first word and exists in preposition/conjunctions
        if (index > 0 && lowercaseWords.has(lowerWord)) {
            return lowerWord;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

export default function Exercise() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    // Evaluation Logic States
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [followupCount, setFollowupCount] = useState(0);
    
    // History states
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Initial Load Sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await historyService.getSessions();
                setSessions(data);
            } catch (error) {
                console.error("Failed to load sessions", error);
            }
        };
        fetchSessions();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        
        // Add user message to UI
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            let activeSessionId = currentSessionId;

            // 1. Create session if it doesn't exist yet
            if (!activeSessionId) {
                const newSession = await historyService.createSession();
                activeSessionId = newSession.id;
                setCurrentSessionId(activeSessionId);
                // Prepend to sidebar logically
                setSessions(prev => [newSession, ...prev]);
            }

            // 2. Save user message to backend
            await historyService.addMessage(activeSessionId, 'user', userMsg);

            // Update conversation title in sidebar
            setSessions(prev => prev.map(sess => {
                if (sess.id === activeSessionId) {
                    return {
                        ...sess,
                        messages: [...(sess.messages || []), { role: 'user', content: userMsg }]
                    };
                }
                return sess;
            }));

            // Call LLM Service directly via decoupled logic
            const sessionIdStr = `user-${user?.id || 'guest'}`;
            
            // Ekstrak preference code (misal: "3TGR") jika ada, format aman
            let cognitive = '1PAR'; // Default baseline
            if (user?.preferences) {
                // Hapus karakter non-alphanumeric (jika berupa string dump array JSON)
                const cleanedPrefs = user.preferences.replace(/[^a-zA-Z0-9]/g, '');
                if (cleanedPrefs.length >= 4) {
                    cognitive = cleanedPrefs.slice(-4).toUpperCase(); // Ambil 4 karakter terakhir (e.g. 3TGR)
                } else if (cleanedPrefs.length > 0) {
                    cognitive = cleanedPrefs.toUpperCase();
                }
            }
            
            if (activeQuestion) {
                 // ======= EVALUATION MODE =======
                 const evalData = await llmService.evaluate(
                     userMsg, 
                     correctAnswer, 
                     activeQuestion, 
                     sessionIdStr, 
                     cognitive, 
                     wrongAttempts
                 );
                 
                 let asstPayload = {};

                 if (evalData.is_correct) {
                     // Selesai/Benar
                     setActiveQuestion(null);
                     setWrongAttempts(0);
                     
                     asstPayload = {
                         role: 'assistant',
                         type: 'evaluation',
                         status: 'correct',
                         content: "✅ **Jawabanmu BENAR!**\n\n" + (evalData.feedback || ""),
                         activeQuestion: null,
                         correctAnswer: null,
                         wrongAttempts: 0,
                         followupCount: followupCount
                     };
                 } else {
                     // Salah
                     const newAttempts = wrongAttempts + 1;
                     setWrongAttempts(newAttempts);
                     const nextFollowup = evalData.followup_question || null;
                     
                     if (nextFollowup) {
                         setActiveQuestion(nextFollowup);
                         setFollowupCount(prev => prev + 1);
                     }
                     
                     let content = `❌ **Jawabanmu belum tepat.**\n\n` + 
                                   `*Petunjuk (${evalData.hint_level || "Evaluasi"}):*\n\n` + 
                                   (evalData.feedback || "");
                                   
                     asstPayload = {
                        role: 'assistant',
                        type: 'evaluation',
                        status: 'incorrect',
                        content: content,
                        followup: nextFollowup,
                        followupIndex: nextFollowup ? (followupCount + 1) : null,
                        activeQuestion: nextFollowup || activeQuestion,
                        correctAnswer: correctAnswer,
                        wrongAttempts: newAttempts,
                        followupCount: nextFollowup ? (followupCount + 1) : followupCount
                     };
                 }
                 
                 setMessages(prev => [...prev, asstPayload]);
                 await historyService.addMessage(activeSessionId, 'assistant', asstPayload);
                 
            } else {
                // ======= NORMAL CHAT MODE =======
                const data = await llmService.chat(userMsg, sessionIdStr, cognitive);
                
                let activeQ = null;
                let cAns = null;
                let nextFollowupCount = 0;

                if (data.followup_question) {
                     activeQ = data.followup_question;
                     cAns = data.reply;
                     nextFollowupCount = 1;

                     setActiveQuestion(activeQ);
                     setCorrectAnswer(cAns);
                     setWrongAttempts(0);
                     setFollowupCount(1);
                }
                
                const asstPayload = { 
                    role: 'assistant', 
                    type: 'chat',
                    content: data.reply,
                    followup: data.followup_question,
                    followupIndex: data.followup_question ? 1 : null,
                    activeQuestion: activeQ,
                    correctAnswer: cAns,
                    wrongAttempts: 0,
                    followupCount: nextFollowupCount
                };

                // Add tutor response to UI
                setMessages(prev => [...prev, asstPayload]);
                await historyService.addMessage(activeSessionId, 'assistant', asstPayload);
            }

        } catch (error) {
            console.error('Error in chat:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm sorry, I encountered an error connecting to my thought engine. Please try again or check the server." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setInput('');
        setActiveQuestion(null);
        setCorrectAnswer(null);
        setWrongAttempts(0);
        setFollowupCount(0);
        setCurrentSessionId(null);
    };

    const loadSessionDetail = async (id) => {
        try {
            setIsLoading(true);
            const data = await historyService.getSessionDetail(id);
            setCurrentSessionId(id);
            
            let lastActiveQ = null;
            let lastCorrectA = null;
            let lastAttempts = 0;
            let lastFollowCount = 0;

            const parsedMessages = data.messages.map(m => {
                if (m.role === 'user') {
                    return { role: 'user', content: m.content };
                } else {
                    try {
                        const parsed = JSON.parse(m.content);
                        // Update state restoration trackers based on the latest assistant info
                        if (parsed.activeQuestion !== undefined) lastActiveQ = parsed.activeQuestion;
                        if (parsed.correctAnswer !== undefined) lastCorrectA = parsed.correctAnswer;
                        if (parsed.wrongAttempts !== undefined) lastAttempts = parsed.wrongAttempts;
                        if (parsed.followupCount !== undefined) lastFollowCount = parsed.followupCount;
                        return parsed;
                    } catch (e) {
                        return { role: 'assistant', content: m.content, type: 'chat' };
                    }
                }
            });

            setMessages(parsedMessages);
            setActiveQuestion(lastActiveQ);
            setCorrectAnswer(lastCorrectA);
            setWrongAttempts(lastAttempts);
            setFollowupCount(lastFollowCount);
        } catch(error) {
            console.error("Failed to fetch session detail", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white font-['Inter',sans-serif]">
            {/* Custom Sidebar for Exercise */}
            <aside className="w-[280px] bg-[#F8FAFC] border-r border-gray-100 flex flex-col z-20">
                {/* Logo */}
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo-logict.png"
                            alt="LogiCT"
                            className="w-8 h-8 rounded-lg"
                        />
                        <h1 className="text-[18px] font-black text-gray-900 font-['Outfit']">LogiCT</h1>
                    </div>
                </div>

                {/* Top actions (Hamburger & Search) */}
                <div className="px-6 py-2 flex items-center justify-between text-gray-500">
                    <button className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        <Menu className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        <Search className="w-4 h-4" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-6 py-6">
                    <button 
                        onClick={startNewChat}
                        className="flex items-center gap-3 text-sm font-bold text-gray-700 hover:text-black transition-colors w-full"
                    >
                        <Edit className="w-[18px] h-[18px]" />
                        New chat
                    </button>
                </div>

                {/* Conversation List */}
                <div className="px-6 py-2 flex-1 overflow-y-auto">
                    <h3 className="text-[10px] font-black text-black uppercase tracking-wider mb-4">Conversation</h3>
                    <div className="space-y-4">
                        {sessions.map((session) => {
                            let previewText = "New Chat";
                            if (session.messages && session.messages.length > 0) {
                                // Find first user message for a good title
                                const firstUserMsg = session.messages.find(m => m.role === 'user');
                                if (firstUserMsg) previewText = formatTitle(firstUserMsg.content);
                            }
                            
                            return (
                                <p 
                                    key={session.id} 
                                    onClick={() => loadSessionDetail(session.id)}
                                    className={`text-[11px] font-bold cursor-pointer truncate transition-colors ${
                                        currentSessionId === session.id 
                                            ? 'text-blue-600 bg-blue-50 -mx-3 px-3 py-1.5 rounded-lg' 
                                            : 'text-gray-500 hover:text-gray-900 py-1.5'
                                    }`}
                                >
                                    {previewText}
                                </p>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-6 space-y-5 mb-2">
                    <button className="flex items-center gap-3 text-[13px] font-bold text-gray-700 hover:text-black transition-colors w-full">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 text-[13px] font-bold text-gray-700 hover:text-black transition-colors w-full"
                    >
                        <LogOut className="w-4 h-4 rotate-180" />
                        Back to course
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col w-full h-screen overflow-hidden bg-white relative">
                {/* Header */}
                <header className="flex-shrink-0 px-8 py-6 w-full bg-white/80 backdrop-blur-md z-10">
                    <h2 className="text-xl font-bold text-gray-600">Exercise</h2>
                </header>

                {/* Content Container */}
                <div className="flex-1 flex flex-col w-full max-w-[800px] mx-auto overflow-hidden relative">
                    
                    {messages.length === 0 ? (
                        /* Welcome Area Centered */
                        <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
                            <div className="w-full bg-gradient-to-br from-[#E1EAFE] via-[#F3EEFE] to-white border border-gray-200/60 rounded-[2rem] py-16 px-10 text-center shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] mb-12">
                                <h2 className="text-[28px] font-bold text-black mb-1 tracking-tight">
                                    Hello, {user?.name ? user.name.split(' ')[0] : 'Rio'} 👋
                                </h2>
                                <h2 className="text-[28px] font-bold text-black tracking-tight">
                                    What can I help with?
                                </h2>
                            </div>
                        </div>
                    ) : (
                        /* Chat Messages Scrollable Area */
                        <div className="flex-1 overflow-y-auto space-y-6 px-4 custom-scrollbar flex flex-col pb-4 w-full">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                                    
                                    <div className={`flex flex-col max-w-[85%] sm:max-w-[80%]`}>
                                        <div className={`rounded-2xl px-5 py-4 ${
                                            msg.role === 'user' 
                                                ? 'bg-[#F4F4F5] text-gray-800 rounded-tr-sm shadow-none' 
                                                : msg.status === 'correct' 
                                                  ? 'bg-[#f0fdf4] text-gray-800 rounded-tl-sm'
                                                  : msg.status === 'incorrect'
                                                    ? 'bg-[#fef2f2] text-gray-800 rounded-tl-sm'
                                                    : 'bg-white text-gray-800 rounded-tl-sm'
                                        }`}>
                                            <div className="text-[14px] leading-relaxed markdown-body prose prose-sm max-w-none">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkMath]} 
                                                    rehypePlugins={[rehypeKatex]}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Follow-up Question Card Layout */}
                                        {msg.followup && (
                                            <div className="mt-3 bg-[#f8fafc] border border-blue-100/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                                                <span className="inline-block px-2.5 py-1 bg-blue-100/60 text-blue-700 text-[11px] font-bold rounded mb-2 uppercase tracking-wide">
                                                    Pertanyaan Lanjutan {msg.followupIndex ? `#${msg.followupIndex}` : ''}
                                                </span>
                                                <div className="text-[14px] leading-relaxed text-gray-800 markdown-body prose prose-sm max-w-none">
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkMath]} 
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {msg.followup}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-3 mt-1 overflow-hidden">
                                           {user?.profilePicture ? 
                                                <img src={user.profilePicture} alt="User" /> : 
                                                <UserIcon className="w-4 h-4 text-gray-500" />
                                            }
                                        </div>
                                    )}

                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                        <span className="text-xs text-gray-400 font-medium tracking-wide animate-pulse">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Chat Input Field */}
                    <div className="flex-shrink-0 px-4 pb-8 pt-2 w-full bg-white">
                        <div className="w-full relative flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white border border-gray-200 p-2 pl-6 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-200">
                            <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                placeholder="Ask anything" 
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400 resize-none h-10 py-2.5 custom-scrollbar"
                                rows={1}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`w-10 h-10 ml-2 rounded-[14px] flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${
                                    input.trim() && !isLoading ? 'bg-[#3B82F6] hover:bg-blue-600 text-white active:scale-95' : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                <Send className="w-4 h-4 ml-[-2px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
