import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users, UserCheck, BookOpen, MessageSquare, Activity,
    ArrowUpRight, Clock, Trash2, PlusCircle, Edit3, ShieldCheck,
    Bookmark, Settings as SettingsIcon, User
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Sector
} from 'recharts';

// Import Custom Icons
import userIcon from '../assets/dashboard/boxicons_user.png';
import adminIcon from '../assets/dashboard/Group 13637.png';
import courseIcon from '../assets/dashboard/fluent_class-20-regular.png';
import questionIcon from '../assets/dashboard/ri_question-answer-line.png';
import activeIcon from '../assets/dashboard/mdi_account-online-outline.png';

// Recent Activity Icons
import recentHeaderIcon from '../assets/logo/mdi_recent.png';
import actAdminIcon from '../assets/logo/Group 13515.png';
import actAddedIcon from '../assets/logo/Group 13516.png';
import actEditIcon from '../assets/logo/Group 13517.png';
import actDeleteIcon from '../assets/logo/Group 13518.png';

// Chart & Score Icons
import userActivityIcon from '../assets/logo/Vector.png';
import cognitiveDistributionIcon from '../assets/logo/mdi_recent.png';
import topScoreHeaderIcon from '../assets/logo/mdi_account-online-outline.png';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_admins: 0,
        total_courses: 0,
        total_questions: 0,
        active_today: 0,
        activity_data: [],
        cognitive_data: [],
        top_scores: [],
        recent_activities: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard/stats/');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        };
        fetchStats();
    }, []);

    // Real data for charts from stats
    const activityData = stats.activity_data?.length > 0 ? stats.activity_data : [
        { name: 'Senin', value: 0, color: '#8B5CF6' },
        { name: 'Selasa', value: 0, color: '#EC4899' },
        { name: 'Rabu', value: 0, color: '#06B6D4' },
        { name: 'Kamis', value: 0, color: '#FACC15' },
        { name: 'Jumat', value: 0, color: '#3B82F6' },
        { name: 'Sabtu', value: 0, color: '#10B981' },
        { name: 'Minggu', value: 0, color: '#6366F1' },
    ];

    const cognitiveData = stats.cognitive_data?.length > 0 ? stats.cognitive_data : [];

    const topScores = stats.top_scores?.length > 0 ? stats.top_scores : [];

    const recentActivities = stats.recent_activities?.map(r => ({
        icon: r.type === 'quiz' ? BookOpen : UserCheck,
        color: r.type === 'quiz' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600',
        action: r.action,
        detail: r.detail,
        time: r.time
    })) || [];


    return (
        <div className="flex flex-col gap-8 pb-12 font-['Outfit']">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Total Users', value: stats.total_users?.toLocaleString() || '0', type: 'users', icon: userIcon, color: 'bg-slate-50' },
                    { label: 'Total Admins', value: stats.total_admins?.toLocaleString() || '0', type: 'admins', icon: adminIcon, color: 'bg-red-50' },
                    { label: 'Total Course', value: stats.total_courses?.toLocaleString() || '0', type: 'courses', icon: courseIcon, color: 'bg-emerald-50' },
                    { label: 'Questions Generated', value: stats.total_questions?.toLocaleString() || '0', type: 'questions', icon: questionIcon, color: 'bg-purple-50' },
                    { label: 'Active Users Today', value: stats.active_today?.toLocaleString() || '0', type: 'active', icon: activeIcon, color: 'bg-blue-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all min-h-[140px]">
                        <div className="flex flex-col h-full items-start">
                            <span className="text-[11px] font-bold text-gray-400 tracking-tight mb-auto uppercase">{stat.label}</span>
                            <span className="text-[40px] font-bold text-gray-700 leading-none mb-2 tabular-nums tracking-tighter">{stat.value}</span>
                        </div>

                        {/* Custom Icons Using PNG Assets - Normal Visibility, No BG */}
                        <div className="absolute bottom-2 right-2 transition-all origin-bottom-right pointer-events-none">
                            <div className="w-24 h-24 flex items-center justify-center p-0">
                                <img 
                                    src={stat.icon} 
                                    alt={stat.label} 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* User Activity Chart */}
                <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <img src={userActivityIcon} alt="User Activity" className="w-6 h-6 object-contain" />
                        </div>
                        <h2 className="text-[14px] font-black text-gray-800 uppercase tracking-widest">User Activity This Week</h2>
                    </div>

                    <div className="flex-1 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: '#E2E8F0' }}
                                    tickLine={false}
                                    tick={false}
                                    label={{ value: 'User Activity', position: 'bottom', offset: 0, fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    ticks={[0, 8, 16, 24, 32, 40]}
                                    domain={[0, 40]}
                                    tick={{ fontSize: 13, fontWeight: 700, fill: '#64748B' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[4, 4, 0, 0]}
                                    barSize={45}
                                    background={{ fill: '#F1F5F9', radius: [4, 4, 0, 0] }}
                                >
                                    {activityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="w-full h-px bg-gray-50 mb-6"></div>

                    {/* Legend Matching Image */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                        {activityData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: item.color }} />
                                <span className="text-[13px] font-black text-gray-500">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cognitive Style Distribution */}
                <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8">
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <img src={cognitiveDistributionIcon} alt="Cognitive Style" className="w-7 h-7 object-contain" />
                            </div>
                            <h2 className="text-[20px] font-black text-gray-800 tracking-tight">Cognitive Style Distribution</h2>
                        </div>

                        <div className="flex-1 flex items-center justify-center min-h-[400px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 20, right: 60, left: 60, bottom: 20 }}>
                                    <defs>
                                        {cognitiveData.map((item, i) => (
                                            <linearGradient key={`grad-${i}`} id={`grad-${item.name}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={item.color} stopOpacity={0.8} />
                                                <stop offset="100%" stopColor={item.color} stopOpacity={0.4} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <Pie
                                        data={cognitiveData.map(d => ({ ...d, radius: 80 + d.value * 1.5 }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        dataKey="value"
                                        stroke="none"
                                        paddingAngle={5}
                                        cornerRadius={12}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name, radius }) => {
                                            const RADIAN = Math.PI / 180;
                                            const r = radius;

                                            // Start point at edge
                                            const x = cx + r * Math.cos(-midAngle * RADIAN);
                                            const y = cy + r * Math.sin(-midAngle * RADIAN);

                                            // Dynamic hinge point
                                            const lx = cx + (r + 15) * Math.cos(-midAngle * RADIAN);
                                            const ly = cy + (r + 15) * Math.sin(-midAngle * RADIAN);

                                            const isRight = lx > cx;
                                            // Vertically aligned edges for labels
                                            const ex = cx + (isRight ? 180 : -180);
                                            const ey = ly;

                                            const color = cognitiveData.find(c => c.name === name)?.color;

                                            return (
                                                <g>
                                                    <path d={`M${x},${y}L${lx},${ly}L${ex},${ey}`} stroke={color} fill="none" strokeWidth={1} />
                                                    <text x={ex + (isRight ? 5 : -5)} y={ey} fill={color} textAnchor={isRight ? 'start' : 'end'} dominantBaseline="central" fontSize={13} fontWeight="900" className="uppercase tracking-widest">
                                                        {name}
                                                    </text>
                                                    <text x={cx + (innerRadius + (r - innerRadius) / 2.2) * Math.cos(-midAngle * RADIAN)} y={cy + (innerRadius + (r - innerRadius) / 2.2) * Math.sin(-midAngle * RADIAN)} fill="#1E293B" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="900">
                                                        {value}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                        labelLine={false}
                                    >
                                        {cognitiveData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={`url(#grad-${entry.name})`}
                                                outerRadius={80 + entry.value * 2.5}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Insights Panel */}
                    <div className="w-full md:w-[400px] flex flex-col gap-10">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <h4 className="text-[13px] font-black text-gray-800 tracking-tight">Key Insights</h4>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Dominant Style:</span>
                                        <div className="flex items-center gap-2">
                                            {cognitiveData.length > 0 && (
                                                <>
                                                    <span 
                                                        className="px-2 py-0.5 rounded text-[10px] font-black text-white"
                                                        style={{ background: [...cognitiveData].sort((a,b)=>b.value-a.value)[0].color }}
                                                    >
                                                        {[...cognitiveData].sort((a,b)=>b.value-a.value)[0].name}
                                                    </span>
                                                    <span className="text-[11px] font-black text-gray-700">({[...cognitiveData].sort((a,b)=>b.value-a.value)[0].count} user)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Lowest Style:</span>
                                        <div className="flex items-center gap-2">
                                            {cognitiveData.length > 0 && (
                                                <>
                                                    <span 
                                                        className="px-2 py-0.5 rounded text-[10px] font-black text-white"
                                                        style={{ background: [...cognitiveData].sort((a,b)=>a.value-b.value)[0].color }}
                                                    >
                                                        {[...cognitiveData].sort((a,b)=>a.value-b.value)[0].name}
                                                    </span>
                                                    <span className="text-[11px] font-black text-gray-700">({[...cognitiveData].sort((a,b)=>a.value-b.value)[0].count} user)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[18px] font-black text-gray-900 border-b-2 border-slate-100 pb-2 mb-6 tracking-tight inline-block">Distribution Summary</h3>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                                {cognitiveData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(to bottom, ${item.color}, #ffffff)` }} />
                                            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-black text-blue-900">{item.count}</span>
                                            <span className="text-[12px] font-bold text-blue-500">({item.percentage})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[18px] font-black text-gray-900 border-b-2 border-slate-100 pb-2 mb-4 tracking-tight inline-block">Interpretation</h3>
                            <ul className="flex flex-col gap-3">
                                {[
                                    "Type A is the most dominant cognitive style (20.0%), followed by I and R.",
                                    "The distribution is relatively balanced, indicating diverse learning preferences among students.",
                                    "This suggests the need for adaptive and personalized learning strategies within the system."
                                ].map((bullet, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-2 flex-shrink-0" />
                                        <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic">{bullet}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Top Score and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Top Score */}
                <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <img src={topScoreHeaderIcon} alt="Top Score" className="w-7 h-7 object-contain" />
                        </div>
                        <h2 className="text-[14px] font-black text-gray-800 uppercase tracking-widest">Top Score</h2>
                    </div>

                    <div className="flex flex-col gap-5">
                        {topScores.map((player, i) => (
                            <div key={i} className="flex items-center gap-4 group cursor-pointer p-2 hover:bg-gray-50/50 rounded-2xl transition-all">
                                <span className={`text-xl font-black w-8 transition-colors ${i < 3 ? 'text-blue-500' : 'text-gray-200 group-hover:text-gray-400'}`}>{i + 1}</span>
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:scale-105 transition-all">
                                    <img
                                        src={player.avatar}
                                        alt={player.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = "/images/default-avatar.png"; }}
                                    />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-sm font-bold text-gray-800 truncate">{player.name}</span>
                                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{player.id}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-gray-900 tabular-nums">{player.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                            <img src={recentHeaderIcon} alt="Recent" className="w-7 h-7 object-contain" />
                        </div>
                        <h2 className="text-[20px] font-black text-gray-800 tracking-tight">Recent Activities</h2>
                    </div>

                    <div className="flex flex-col">
                        {recentActivities.map((act, i) => {
                            // Determine PNG Icon based on action text
                            let PngIcon = actAdminIcon;

                            if (act.action.includes('Admin')) {
                                PngIcon = actAdminIcon;
                            } else if (act.action.includes('Added')) {
                                PngIcon = actAddedIcon;
                            } else if (act.action.includes('Edit')) {
                                PngIcon = actEditIcon;
                            } else if (act.action.includes('Deleted')) {
                                PngIcon = actDeleteIcon;
                            }

                            return (
                                <div key={i} className={`flex items-center justify-between py-5 ${i !== recentActivities.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 flex items-center justify-center">
                                            <img src={PngIcon} alt="Activity" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[17px] font-black text-gray-900">{act.action}</span>
                                            <span className="text-[17px] font-medium text-gray-700">{act.detail}</span>
                                        </div>
                                    </div>
                                    <span className="text-[13px] text-gray-400 font-bold whitespace-nowrap">
                                        {act.time}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
