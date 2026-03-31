import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from "recharts";
import { Clock, Target, BarChart2, BookOpen, ChevronRight, Send, Brain, X } from 'lucide-react';
// Re-bundled to resolve import analysis error

import { useAuth } from '../context/AuthContext';
import studyIcon from '../assets/dashboard/study_duration.png';
import attemptIcon from '../assets/dashboard/attempt.png';
import accuracyIcon from '../assets/dashboard/accuracy_rate.png';
import topicsIcon from '../assets/dashboard/topics_completed.png';
import bubbleChat from '../assets/dashboard/bubble_chat.png';
import shieldBars from '../assets/dashboard/shield_bars.png';
import mascotIcon from '/images/chatbot.png';

const ARCHETYPE_STYLES = {
  PAR: { bgCard: 'bg-[#E5EAFF]', sideBar: 'bg-[#1F3A8A]', badge: 'bg-gradient-to-r from-[#3427C0] to-[#5A4F12]', border: 'border-blue-100', text: 'text-[#2653DF]' },
  TAI: { bgCard: 'bg-[#E5FFEC]', sideBar: 'bg-[#059669]', badge: 'bg-gradient-to-r from-[#27C07B] to-[#5A4F12]', border: 'border-green-100', text: 'text-[#2653DF]' },
  PGR: { bgCard: 'bg-[#E5FFF5]', sideBar: 'bg-[#0F766E]', badge: 'bg-gradient-to-r from-[#27C08F] to-[#5A4F12]', border: 'border-teal-100', text: 'text-[#2653DF]' },
  PGI: { bgCard: 'bg-[#FFE5F2]', sideBar: 'bg-[#DB2777]', badge: 'bg-gradient-to-r from-[#C02778] to-[#5A4F12]', border: 'border-pink-100', text: 'text-[#2653DF]' },
  TAR: { bgCard: 'bg-[#F2E5FF]', sideBar: 'bg-[#5B21B6]', badge: 'bg-gradient-to-r from-[#8827C0] to-[#5A4F12]', border: 'border-purple-100', text: 'text-[#2653DF]' },
  TGI: { bgCard: 'bg-[#FFFBE5]', sideBar: 'bg-[#F59E0B]', badge: 'bg-gradient-to-r from-[#C0A927] to-[#5A4F12]', border: 'border-yellow-100', text: 'text-[#2653DF]' },
  TGR: { bgCard: 'bg-[#EEEEEE]', sideBar: 'bg-[#374151]', badge: 'bg-gradient-to-r from-[#39372E] to-[#5A4F12]', border: 'border-gray-200', text: 'text-[#2653DF]' },
  PAI: { bgCard: 'bg-[#FFEFE5]', sideBar: 'bg-[#F97316]', badge: 'bg-gradient-to-r from-[#C05C27] to-[#5A4F12]', border: 'border-orange-100', text: 'text-[#2653DF]' }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [hoveredTrait, setHoveredTrait] = useState(null);

  // Auto-show bubble effect on first visit
  useEffect(() => {
    // Check if the message was explicitly closed before
    const hasClosed = localStorage.getItem('logiai_msg_closed');

    if (!hasClosed) {
      // Show for the first time after a short delay
      const initialTimer = setTimeout(() => setIsMessageVisible(true), 1500);
      return () => clearTimeout(initialTimer);
    }
  }, []);

  const handleCloseMessage = (e) => {
    e.stopPropagation();
    setIsMessageVisible(false);
    localStorage.setItem('logiai_msg_closed', 'true');
  };

  const toggleMessage = () => {
    setIsMessageVisible(!isMessageVisible);
  };

  // Dynamic Archetype Styles
  const archetypeCode = (user?.archetype_info?.code || 'CT-PAR').split('-').pop();
  const currentStyle = ARCHETYPE_STYLES[archetypeCode] || ARCHETYPE_STYLES.PAR;

  // Cognitive Style Traits (Bi-directional Bars)
  const profileTraits = [
    { left: 'Visual Text', right: 'Visual Picture', shortLeft: 'T', shortRight: 'P', value: user?.cog_tp_value ?? 50, bright: '#FFD1FF', dark: '#E600E6' },
    { left: 'Global', right: 'Analytics', shortLeft: 'G', shortRight: 'A', value: user?.cog_ga_value ?? 50, bright: '#FFE4BC', dark: '#FF8A00' },
    { left: 'Impulsive', right: 'Reflective', shortLeft: 'I', shortRight: 'R', value: user?.cog_ir_value ?? 50, bright: '#C1FFEB', dark: '#00D06C' },
  ];

  // CT Framework Statistics (Radar - 4 Points ordered for vertical label optimization)
  const frameworkData = [
    { subject: 'Pattern Recognition', A: user?.ct_pattern || 65 },
    { subject: 'Algorithm', A: user?.ct_algorithm || 90 },
    { subject: 'Decomposition', A: user?.ct_decomposition || 70 },
    { subject: 'Abstraction', A: user?.ct_abstraction || 85 },
  ];

  // Weekly CT Score (Line Chart)
  const weeklyData = [
    { day: 'Mon', score: 80 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 85 },
    { day: 'Thu', score: 83 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 87 },
    { day: 'Sun', score: 20 },
  ];

  return (
    <div className="w-full animate-fade-in p-4 sm:p-0 lg:min-h-[calc(100vh-80px)] lg:flex lg:flex-col pb-8">
      {/* Welcome Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-gray-800 font-['Outfit'] mb-1">
          Hello, {user?.name?.split(' ')[0] || 'User LogiCT'}
        </h1>
        <p
          className="text-3xl font-semibold w-fit"
          style={{
            background: 'linear-gradient(to right, #00DDB6, #6064CF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Ready to tackle another courses?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch lg:flex-1 lg:min-h-0">

        {/* TOP-LEFT SECTION: KOTAK 1 & KB 3 (Weekly + Chatbot Overlay) */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-full lg:min-h-0">
          {/* Progress Card (Kotak 1) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-gray-800">CONTINUE STUDYING?</h2>
              <span className="text-gray-400 font-bold text-sm">47%</span>
            </div>

            <p className="text-xs text-gray-600 mb-2">Belajar Dasar Pseudocode</p>

            <div className="w-full bg-gray-100 h-2.5 rounded-full mb-2">
              <div
                className="h-full bg-[#14B8A6] rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: '47%' }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button className="text-[#3B82F6] font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Lanjut Belajar <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-gray-400 font-medium italic">Progress Belajar</span>
            </div>
          </div>

          {/* Weekly Performance Card (Kotak 3) WITH CHATBOT OVERLAY */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-[480px] relative">
            <h2 className="text-base font-bold text-gray-800 mb-4 tracking-tight">Weekly Performance</h2>

            {/* STATS WITH WATERMARKS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 shrink-0">
              {[
                { label: 'Study Duration', value: '5h 30m', icon: studyIcon, rotate: 'rotate(-9deg)', color: 'text-gray-700', bottom: '-bottom-8', size: 'w-24' },
                { label: 'Attempt', value: '120', icon: attemptIcon, rotate: 'rotate(-10deg)', color: 'text-gray-700', bottom: '-bottom-8', size: 'w-24' },
                { label: 'Accuracy Rate', value: '82%', icon: accuracyIcon, rotate: 'rotate(19.7deg)', color: 'text-gray-700', bottom: '-bottom-5', size: 'w-26' },
                { label: 'Topics Completed', value: '3', icon: topicsIcon, rotate: 'rotate(-10deg)', color: 'text-gray-700', bottom: '-bottom-5', size: 'w-24' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden h-28 flex flex-col justify-between group">
                  <span className="text-[10px] font-bold text-gray-400 z-10">{stat.label}</span>
                  <span className="text-xl font-black text-gray-700 z-10">{stat.value}</span>
                  <img
                    src={stat.icon}
                    alt=""
                    className={`absolute ${stat.bottom} -right-4 ${stat.size} h-24 object-contain transition-transform duration-500 group-hover:scale-110 select-none pointer-events-none`}
                    style={{ transform: stat.rotate }}
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 w-full bg-white border border-gray-100 p-3 rounded-2xl flex flex-col shadow-inner min-h-0 overflow-hidden">
              <p className="text-center text-[10px] font-bold text-gray-500 mb-2 font-['Outfit']">CT Score</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 600 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <RechartsTooltip
                      cursor={{ stroke: '#818CF8', strokeWidth: 2 }}
                      contentStyle={{ fontSize: '10px', padding: '5px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#818CF8"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#818CF8', stroke: '#FFF' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT SECTION: KOTAK 4 & 5 */}
        <div className="lg:col-span-6 h-full flex flex-col gap-4 lg:min-h-0">

          {/* Cognitive Style Profile Card (Kotak 4) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-base font-bold text-gray-800 tracking-tight">Cognitive Style Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[35fr_65fr] gap-4 h-[250px]">
              {/* Left: Character Card (35%) */}
              <div className={`${currentStyle.bgCard} border ${currentStyle.border} rounded-2xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden h-full shadow-sm`}>
                <div className={`absolute top-0 left-0 h-full w-1.5 ${currentStyle.sideBar} z-20`}></div>

                {/* White Hill (Curved Background) - Card Level */}
                <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[180%] h-[140px] bg-white rounded-[100%] z-0 shadow-[0_-10px_20px_-5px_rgba(255,255,255,0.5)]"></div>

                <div className="flex flex-col items-center">
                  <p className="text-[11px] text-gray-500 font-medium mb-1">Your Profile</p>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-gray-900 font-black text-md tracking-tight leading-none">
                      {user?.archetype_info?.archetype_name || 'Architect'}
                    </h3>
                    <span className={`${currentStyle.badge} text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-white/20 whitespace-nowrap`}>
                      CT - {archetypeCode}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center py-2 relative">
                  {/* Subtle Glow */}
                  <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full scale-75"></div>

                  <img
                    src={user?.archetype_info?.code ? `/images/profiles/${user.archetype_info.code.includes('-') ? user.archetype_info.code.split('-')[1] : user.archetype_info.code}.png` : "/images/welkam_atas.png"}
                    alt="Profile"
                    className="w-32 drop-shadow-xl z-20 hover:scale-110 transition-transform duration-500 ease-out"
                    onError={(e) => { e.target.src = "/images/welkam_atas.png"; }}
                  />
                </div>

                <button
                  onClick={() => navigate('/dashboard/profile-display')}
                  className={`text-[11px] font-bold ${currentStyle.text || 'text-blue-600'} flex items-center gap-1 hover:gap-2 transition-all group border-b border-transparent hover:border-current pb-0.5`}
                >
                  Pelajari Selengkapnya <span className="text-[10px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                </button>
              </div>

              {/* Right: Bi-directional Bar Chart (65%) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-start gap-6 h-full relative overflow-visible">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Cognitive Traits</h3>
                {profileTraits.map((trait, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 w-full relative group"
                    onMouseEnter={() => setHoveredTrait(i)}
                    onMouseLeave={() => setHoveredTrait(null)}
                  >
                    <span className="w-6 text-[10px] font-bold text-gray-400 text-center leading-tight uppercase transition-all">
                      {trait.shortLeft}
                    </span>

                    <div className="flex-1 relative h-4 bg-gray-50 border border-gray-200 rounded-full flex items-center shadow-inner overflow-visible px-2">

                      {/* Floating Tooltip (On Hover) */}
                      {hoveredTrait === i && (
                        <div
                          className="absolute -top-9 z-50 px-2 py-1 bg-gray-800 text-white text-[9px] font-black rounded-md shadow-xl pointer-events-none transition-all duration-200 flex items-center gap-1.5"
                          style={{
                            left: `${trait.value}%`,
                            transform: `translateX(-${trait.value}%)`
                          }}
                        >
                          <span className="whitespace-nowrap italic">{trait.value >= 50 ? trait.right : trait.left}</span>
                          <span className="bg-white/20 px-1 rounded">
                            {Math.round(Math.abs(trait.value - 50) * 2)}%
                          </span>
                          <div
                            className="absolute -bottom-1 w-2.5 h-2.5 bg-gray-800 rotate-45"
                            style={{
                              left: `${trait.value}%`,
                              transform: 'translateX(-50%) rotate(45deg)'
                            }}
                          ></div>
                        </div>
                      )}

                      {/* Bidirectional fill - START FROM CENTER (50%) */}
                      <div
                        className="absolute h-full transition-all duration-1000 shadow-inner opacity-90 rounded-full"
                        style={{
                          left: trait.value >= 50 ? '50%' : `${trait.value}%`,
                          width: `${Math.abs(trait.value - 50)}%`,
                          background: trait.value >= 50
                            ? `linear-gradient(to right, ${trait.bright}, ${trait.dark})`
                            : `linear-gradient(to left, ${trait.bright}, ${trait.dark})`
                        }}
                      ></div>

                      {/* Static Shield at Center */}
                      <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 z-40 drop-shadow-sm flex items-center justify-center pointer-events-none">
                        <img
                          src={shieldBars}
                          alt="shield"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Glowing Doughnut Thumb at Value (Switch Style) */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 z-50 transition-all duration-1000 flex items-center justify-center pointer-events-none"
                        style={{
                          left: `${trait.value}%`,
                          transform: `translateY(-50%) translateX(-${trait.value}%)`
                        }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full bg-transparent border-[3px] border-white shadow-xl flex-shrink-0"
                          style={{ boxShadow: `0 0 12px ${trait.dark}, inset 0 0 4px ${trait.dark}` }}
                        ></div>
                      </div>

                      {/* Static Center Line (The Zero Point) */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] z-10 pointer-events-none"></div>

                    </div>
                    <span className="w-6 text-[10px] font-bold text-gray-400 text-center leading-tight uppercase transition-all">
                      {trait.shortRight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Card (Kotak 5) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-[400px] overflow-hidden">
            <h2 className="text-base font-bold text-gray-800 mb-4 tracking-tight uppercase">STATISTICS</h2>

            <div className="flex-1 flex items-center gap-4 min-h-0">
              {/* Radar Column */}
              <div className="flex-[1.2] h-full min-h-0 relative bg-white border border-gray-50 rounded-3xl p-2 shadow-sm">
                <p className="absolute top-3 left-3 text-[10px] font-bold text-gray-400 uppercase">Distribution Skills</p>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={frameworkData}>
                    <PolarGrid stroke="#F1F5F9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 7, fill: '#94A3B8', fontWeight: 700 }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Radar
                      name="Framework"
                      dataKey="A"
                      stroke="#F87171"
                      fill="#F87171"
                      fillOpacity={0.2}
                      animationDuration={1500}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Column (Vertical List) */}
              <div className="flex-1 flex flex-col justify-around h-full py-4">
                {[
                  { label: 'Overall CT Score', value: '78', color: 'border-orange-500 text-orange-600' },
                  { label: 'Accuracy Rate', value: '82%', color: 'border-red-500 text-red-600' },
                  { label: 'Mastery Streak', value: '14', color: 'border-pink-500 text-pink-600' },
                ].map((bubble, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className={`w-14 h-14 rounded-full border-4 bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 flex-shrink-0 ${bubble.color}`}>
                      <span className="text-base font-black">{bubble.value}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black uppercase leading-tight text-gray-400">
                        {bubble.label}
                      </p>
                      <p className="text-[9px] font-bold text-gray-300">Level: Expert</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Chatbot Mascot - Pojok Kanan Bawah */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
        {/* Mascot & Bubble Container */}
        <div
          className="relative cursor-pointer group animate-bounce-slow"
          onClick={toggleMessage}
        >
          {/* LogiAI Interactive Bubble */}
          <div
            className={`absolute bottom-full right-0 mb-4 w-72 bg-[#007AFF] rounded-[32px] p-5 shadow-2xl transition-all duration-300 origin-bottom-right 
              ${isMessageVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseMessage}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center border border-white/30">
                <img src={mascotIcon} alt="Avatar" className="w-7 h-7 object-contain" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1 font-['Outfit']">LogiAI</h3>
                <p className="text-white/90 text-[11px] leading-relaxed mb-3 pr-4">
                  I noticed you found <b>Belajar Dasar Pseudocode</b> hard. Want a 3 minutes refresher?
                </p>
                <button
                  onClick={() => navigate('/exercise')}
                  className="bg-white text-[#007AFF] px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
                >
                  Let's go!
                </button>
              </div>
            </div>
            {/* Tail */}
            <div className="absolute -bottom-2 right-8 w-6 h-6 bg-[#007AFF] rotate-45 rounded-sm -z-10"></div>
          </div>

          {/* Mascot Image */}
          <div className="transition-transform hover:scale-105 active:scale-95">
            <img
              src={mascotIcon}
              alt="Mascot"
              className="w-20 h-20 object-contain drop-shadow-2xl"
            />
            {/* Sleeping Bubble (Hanya tampil jika bubble utama tertutup) */}
            {!isMessageVisible && (
              <img
                src={bubbleChat}
                alt="Bubble Chat"
                className="absolute -top-1 -left-2 w-10 object-contain z-30 select-none pointer-events-none drop-shadow-sm animate-pulse"
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

    </div>
  );
}