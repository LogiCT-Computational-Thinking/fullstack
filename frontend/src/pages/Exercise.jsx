import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Edit, Settings, LogOut, Send, Loader2, User as UserIcon, Bot, CheckCircle2, XCircle, HelpCircle, MessageSquare, FileText, Sparkles, ChevronRight } from 'lucide-react';
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

// Helper function to preprocess markdown (LaTeX delimiters and newlines)
const preprocessMarkdown = (text) => {
    if (!text || typeof text !== 'string') return text;
    // 1. Handle double-escaped or single-escaped LaTeX brackets
    let processed = text
        .replace(/\\\\\[/g, '$$$$')
        .replace(/\\\\\]/g, '$$$$')
        .replace(/\\\[/g, '$$$$')
        .replace(/\\\]/g, '$$$$')
        .replace(/\\\\\(/g, '$')
        .replace(/\\\\\)/g, '$')
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$');
    
    // 2. Ensure single newlines are rendered (standard Markdown trick: add 2 spaces at end of line)
    // but don't break existing double newlines/paragraphs
    return processed.replace(/\n(?!\n)/g, '  \n');
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
                let nextFollowup = null;

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
                    nextFollowup = evalData.followup_question || null;

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
        } catch (error) {
            console.error("Failed to fetch session detail", error);
        } finally {
            setIsLoading(false);
        }
    }; return (
        <div className="flex bg-white font-['Outfit',sans-serif] h-screen overflow-hidden">
            {/* ── Sidebar ── */}
            <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col z-20">
                {/* Logo Section */}
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center">
                            <img src="/images/logo-logict.png" alt="LogiCT" className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">LogiCT</h1>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all group"
                    >
                        <Edit className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                        New chat
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all group">
                        <Search className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                        Search
                    </button>

                    {/* Spacer Gap */}
                    <div className="h-8" />

                    <div className="mt-10">
                        <h3 className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">Your chats</h3>
                        <div className="space-y-1">
                            {sessions.length === 0 ? null : sessions.map((session) => {
                                let previewText = "New Chat";
                                if (session.messages && session.messages.length > 0) {
                                    const firstUserMsg = session.messages.find(m => m.role === 'user');
                                    if (firstUserMsg) previewText = formatTitle(firstUserMsg.content);
                                }
                                return (
                                    <button
                                        key={session.id}
                                        onClick={() => loadSessionDetail(session.id)}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold truncate rounded-xl transition-all ${currentSessionId === session.id
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {previewText}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Bottom */}
                <div className="p-4 border-t border-gray-50 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Back to course
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col relative bg-white overflow-hidden">
                {/* Header title */}
                <div className="px-10 py-8">
                    <h2 className="text-xl font-bold text-gray-800">Exercise</h2>
                </div>

                <div className="flex-1 flex flex-col items-center overflow-y-auto px-6 pb-40 scrollbar-hide">
                    {messages.length === 0 ? (
                        <div className="w-full max-w-[800px] mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Greeting */}
                            <div className="text-center mb-16">
                                <h1 className="text-[44px] font-bold text-black leading-tight">
                                    Hello, {user?.name ? user.name.split(' ')[0] : 'Rio'} 👋
                                </h1>
                                <h1 className="text-[44px] font-bold text-black leading-tight">
                                    What can I help with?
                                </h1>
                            </div>

                            {/* Action Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[680px] mx-auto">
                                {[
                                    { icon: <Edit className="w-5 h-5" />, label: "Explain a topic", color: "text-[#EF5800]", bg: "bg-[#FFF2EB]" },
                                    { icon: <HelpCircle className="w-5 h-5" />, label: "Generate practice questions", color: "text-[#1089D9]", bg: "bg-[#F1F9FF]" },
                                    { icon: <MessageSquare className="w-5 h-5" />, label: "Help solve a question", color: "text-[#8910D9]", bg: "bg-[#F8F1FF]" },
                                    { icon: <FileText className="w-5 h-5" />, label: "Summarize this topic", color: "text-[#D91089]", bg: "bg-[#FFF1F8]" }
                                ].map((card, i) => (
                                    <button
                                        key={i}
                                        className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all p-4 rounded-2xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`${card.bg} ${card.color} w-11 h-11 rounded-xl flex items-center justify-center shadow-sm`}>
                                                {card.icon}
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">{card.label}</span>
                                        </div>
                                        <div className="w-8 h-8 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-gray-900 group-hover:border-gray-300 transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Chat Messages */
                        <div className="w-full max-w-[800px] mt-4 space-y-8 animate-in fade-in duration-500 pb-10">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`${
                                        msg.role === 'user' 
                                        ? 'max-w-[85%] bg-[#F6F6F6] px-6 py-4 rounded-[0.5rem]' 
                                        : 'w-full bg-transparent py-4 text-gray-900 border-none'
                                    }`}>
                                        <div className={`text-[15px] leading-relaxed prose prose-sm max-w-none 
                                            ${msg.role === 'user' ? 'text-gray-700' : 'text-gray-900'}
                                            ${msg.role === 'assistant' ? 
                                                'prose-p:mb-6 prose-p:leading-7 ' +
                                                'prose-li:mb-2 prose-ul:mb-6 prose-ol:mb-6 ' +
                                                'prose-headings:mb-4 prose-headings:mt-8 prose-headings:text-[#1e2a5e] prose-headings:font-bold ' +
                                                'prose-blockquote:border-l-4 prose-blockquote:border-[#9fa9d3] prose-blockquote:bg-[#f6f7fb] prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:mb-6 ' +
                                                'prose-code:bg-[#f3f4f6] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none ' +
                                                'prose-pre:bg-[#f3f4f6] prose-pre:border prose-pre:border-gray-200 prose-pre:mb-6 ' +
                                                'prose-th:bg-[#f1f2f7] prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-gray-200 ' +
                                                'prose-strong:text-[#1b255a]' : ''}`}
                                        >
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkMath]} 
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {preprocessMarkdown(msg.content)}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Follow-up Question Card (Static Design Match) */}
                                        {msg.role === 'assistant' && msg.followup && (
                                            <div className="mt-6 bg-[#eef3ff] border-l-4 border-[#1e2a5e] rounded-r-xl p-5 shadow-sm animate-in fade-in slide-in-from-left-2 duration-500">
                                                <span className="inline-block bg-[#1e2a5e] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                                                    Pertanyaan
                                                </span>
                                                <div className="text-[15px] font-bold text-[#1e2a5e] leading-relaxed markdown-body prose prose-sm max-w-none prose-p:m-0">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                        {preprocessMarkdown(msg.followup)}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="w-full flex justify-start animate-in fade-in slide-in-from-left-2 duration-500">
                                    <div className="flex items-center gap-3 py-4">
                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[13px] font-bold text-blue-600/70 tracking-wide uppercase">
                                                LogiAI is thinking
                                            </span>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* ── Fixed Input Area (Rainbow) ── */}
                <div className="absolute bottom-0 left-0 right-0 px-10 pb-12 pt-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                    <div className="max-w-[820px] mx-auto pointer-events-auto">
                        <div className="relative group">
                            {/* Rainbow Border Container */}
                            <div
                                className="absolute -inset-[1.5px] rounded-[2rem] opacity-40 group-focus-within:opacity-100 transition-opacity blur-[0.2px]"
                                style={{ background: 'linear-gradient(90deg, #3F67E3 0%, #85DDAF 56%, #EFE68A 73%, #FCB021 86%)' }}
                            ></div>

                            {/* Inner Input */}
                            <div className="relative bg-white rounded-[1.95rem] p-3 flex items-end gap-3">
                                <div className="pl-4 pb-3.5 text-gray-300 self-start mt-2">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything"
                                    rows={3}
                                    className="flex-1 bg-transparent border-none outline-none text-base font-medium text-gray-700 placeholder:text-gray-300 py-3 resize-none max-h-40 scrollbar-hide"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all mb-0.5 mr-0.5 ${input.trim() && !isLoading
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 active:scale-95'
                                            : 'bg-gray-100 text-gray-300'
                                        }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
