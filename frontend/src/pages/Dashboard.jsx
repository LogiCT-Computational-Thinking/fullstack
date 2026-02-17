import { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import { Clock, Target, BarChart2, BookOpen, ChevronRight, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  // Cognitive Style Traits (Bi-directional Bars)
  const profileTraits = [
    { left: 'Visual Text', right: 'Visual Picture', value: 65, color: '#8B5CF6' },
    { left: 'Global', right: 'Analytics', value: 75, color: '#EC4899' },
    { left: 'Impulsive', right: 'Reflective', value: 60, color: '#10B981' },
  ];

  // CT Framework Statistics (Radar - 6 Points)
  const frameworkData = [
    { subject: 'Abstraction', A: user?.ct_abstraction || 85 },
    { subject: 'Decomposition', A: user?.ct_decomposition || 70 },
    { subject: 'Pattern Recognition', A: user?.ct_pattern || 65 },
    { subject: 'Algorithmic Thinking', A: user?.ct_algorithm || 90 },
    { subject: 'Logical Reasoning', A: 75 },
    { subject: 'Debugging', A: 80 },
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
    <div className="max-w-[1400px] mx-auto animate-fade-in p-4 sm:p-0 lg:h-[calc(100vh-80px)] lg:flex lg:flex-col lg:overflow-hidden">
      {/* Welcome Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 font-['Outfit'] shrink-0">
        Welcome, let's crack today's challenge!
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch lg:flex-1 lg:min-h-0">

        {/* TOP-LEFT SECTION: KOTAK 1 & KB 3 (Weekly + Chatbot Overlay) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full lg:min-h-0">
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
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0 relative">
            {/* Chatbot Overlay (Kotak 2) */}
            {/* Chatbot Overlay (Kotak 2) */}
            <div className="absolute -top-8 -right-6 z-20 animate-bounce-slow">
              <img
                src="/images/chatbot.png"
                alt="Chatbot"
                className="w-28 drop-shadow-xl hover:scale-110 transition-transform cursor-pointer"
              />
            </div>

            <h2 className="text-base font-bold text-gray-800 mb-4 tracking-tight uppercase">WEEKLY PERFORMANCE</h2>

            {/* CORRECT STATS RENDER */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 shrink-0">
              <div className="bg-[#FECACA] p-3 rounded-2xl flex flex-col items-center justify-center text-[#991B1B]">
                <Clock className="w-5 h-5 mb-1 opacity-80" />
                <span className="text-[9px] font-bold uppercase opacity-70">Duration</span>
                <span className="text-lg font-black">5h 30m</span>
              </div>
              <div className="bg-[#DCFCE7] p-3 rounded-2xl flex flex-col items-center justify-center text-[#166534]">
                <div className="bg-white/50 p-1 rounded-full mb-1"><Target className="w-3.5 h-3.5" /></div>
                <span className="text-[9px] font-bold uppercase opacity-70 leading-tight text-center">Attempted</span>
                <span className="text-lg font-black">120</span>
              </div>
              <div className="bg-[#F3E8FF] p-3 rounded-2xl flex flex-col items-center justify-center text-[#6B21A8]">
                <BarChart2 className="w-5 h-5 mb-1 opacity-80" />
                <span className="text-[9px] font-bold uppercase opacity-70">Accuracy</span>
                <span className="text-lg font-black">82%</span>
              </div>
              <div className="bg-[#CFFAFE] p-3 rounded-2xl flex flex-col items-center justify-center text-[#155E75]">
                <BookOpen className="w-5 h-5 mb-1 opacity-80" />
                <span className="text-[9px] font-bold uppercase opacity-70">Topics</span>
                <span className="text-lg font-black">3</span>
              </div>
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
        <div className="lg:col-span-5 h-full flex flex-col gap-4 lg:min-h-0">

          {/* Cognitive Style Profile Card (Kotak 4) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm shrink-0">
            <h2 className="text-base font-bold text-gray-800 mb-3 tracking-tight uppercase">COGNITIVE STYLE PROFILE</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[220px]"> {/* Increased height for better visibility */}
              {/* Left: Character Card */}
              <div className="bg-[#FEFCE8] border border-yellow-100 rounded-2xl p-3 pl-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 h-full w-2 bg-yellow-300"></div>
                <p className="text-[10px] text-yellow-700 font-bold uppercase tracking-widest mb-1">Your Profile</p>
                <h3 className="text-yellow-900 font-black text-xl italic tracking-tight mb-2">
                  {user?.archetype_info?.archetype_name || 'Architect'}
                  <span className="opacity-50 not-italic text-xs block">({user?.archetype_info?.code || 'CT-PAR'})</span>
                </h3>
                <img
                  src={user?.archetype_info?.code ? `/images/profiles/${user.archetype_info.code.includes('-') ? user.archetype_info.code.split('-')[1] : user.archetype_info.code}.png` : "/images/welkam_atas.png"}
                  alt="Profile"
                  className="w-20 drop-shadow-md z-10 hover:scale-110 transition-transform duration-300 mb-1"
                  onError={(e) => { e.target.src = "/images/welkam_atas.png"; }}
                />
                <button className="mt-2 text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right: Bi-directional Bar Chart */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-center gap-5 h-full relative">
                {profileTraits.map((trait, i) => (
                  <div key={i} className="flex items-center gap-2 w-full">
                    {/* Left Label */}
                    <span className="w-16 text-[9px] font-bold text-gray-500 text-right leading-tight">{trait.left}</span>

                    {/* Bar Container */}
                    <div className="flex-1 relative h-2.5 bg-gray-100 rounded-full flex items-center">
                      {/* Filled Bar */}
                      <div
                        className="absolute h-full rounded-full transition-all duration-1000"
                        style={{ width: `${trait.value}%`, backgroundColor: trait.color }}
                      ></div>

                      {/* Thumb */}
                      <div
                        className="absolute w-3.5 h-3.5 bg-white border-2 rounded-full shadow-sm z-10"
                        style={{ left: `calc(${trait.value}% - 6px)`, borderColor: trait.color }}
                      ></div>
                    </div>

                    {/* Right Label */}
                    <span className="w-16 text-[9px] font-bold text-gray-500 text-left leading-tight">{trait.right}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Card (Kotak 5) */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            <h2 className="text-base font-bold text-gray-800 mb-4 tracking-tight uppercase">STATISTICS</h2>

            <div className="flex-1 flex flex-col items-center justify-between gap-4 min-h-0">
              <div className="w-full h-full min-h-0 relative flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={frameworkData}>
                    <PolarGrid stroke="#F1F5F9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#94A3B8', fontWeight: 700 }} />
                    <Radar
                      name="Framework"
                      dataKey="A"
                      stroke="#F87171"
                      fill="#F87171"
                      fillOpacity={0.3}
                      animationDuration={1500}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full bg-[#FFF1F2] p-4 rounded-3xl flex justify-around items-center gap-3 border border-red-50 shrink-0">
                {[
                  { label: 'Overall Score', value: '78', color: 'border-[#F97316] text-[#C2410C]' },
                  { label: 'Accuracy', value: '82%', color: 'border-[#EF4444] text-[#B91C1C]' },
                  { label: 'Streak', value: '14', color: 'border-[#FB7185] text-[#BE123C]' },
                ].map((bubble, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full border-[3px] ${bubble.color} bg-white flex items-center justify-center shadow-md transition-transform hover:scale-110`}>
                      <span className="text-sm font-black">{bubble.value}</span>
                    </div>
                    <p className={`text-[7px] font-black uppercase text-center w-12 leading-tight tracking-tighter opacity-80 ${bubble.color.split(' ')[1]}`}>
                      {bubble.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
