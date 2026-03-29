import React from 'react';
import {
    Users, UserCheck, BookOpen, MessageSquare, Activity,
    ArrowUpRight, Clock, Trash2, PlusCircle, Edit3, ShieldCheck,
    Bookmark, Settings as SettingsIcon, User
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Sector
} from 'recharts';

const AdminDashboard = () => {
    // Mock data for charts
    const activityData = [
        { name: 'Senin', value: 18, color: '#8B5CF6' },
        { name: 'Selasa', value: 10, color: '#EC4899' },
        { name: 'Rabu', value: 15, color: '#06B6D4' },
        { name: 'Kamis', value: 28, color: '#FACC15' },
        { name: 'Jumat', value: 32, color: '#3B82F6' },
        { name: 'Sabtu', value: 16, color: '#10B981' },
        { name: 'Minggu', value: 4, color: '#6366F1' },
    ];

    const cognitiveData = [
        { name: 'PAR', value: 20, color: '#7CC1E5', count: 20, percentage: '13.4%' },
        { name: 'TAI', value: 33, color: '#10B981', count: 33, percentage: '15.7%' },
        { name: 'PGI', value: 28, color: '#F18CBC', count: 28, percentage: '19.0%' },
        { name: 'PGR', value: 17, color: '#75DEA4', count: 17, percentage: '19.0%' },
        { name: 'TAR', value: 12, color: '#9B6FD8', count: 12, percentage: '13.7%' },
        { name: 'TGI', value: 15, color: '#FFB84D', count: 15, percentage: '20.0%' },
        { name: 'TGR', value: 11, color: '#BDBDBD', count: 11, percentage: '18.1%' },
        { name: 'PAI', value: 14, color: '#FFB88D', count: 14, percentage: '18.1%' },
    ];

    const topScores = [
        { name: 'Rusydi Balfas', id: 'ST-28', score: '13.408', avatar: '/images/avatar-1.png' },
        { name: 'Zaky Ghoetty', id: 'ST-29', score: '9.398', avatar: '/images/avatar-2.png' },
        { name: 'Fadhil Mumtaz', id: 'ST-25', score: '9.160', avatar: '/images/avatar-3.png' },
        { name: 'Rio Alvein', id: 'ST-26', score: '8.237', avatar: '/images/avatar-1.png' },
        { name: 'Agal Lulanika', id: 'ST-28', score: '7.246', avatar: '/images/avatar-2.png' },
        { name: 'Raihan Zhafran', id: 'ST-27', score: '6.384', avatar: '/images/avatar-3.png' },
    ];

    const recentActivities = [
        { icon: UserCheck, color: 'bg-blue-100 text-blue-600', action: 'New Admin Created:', detail: 'Andrea', time: '5 mins ago' },
        { icon: BookOpen, color: 'bg-green-100 text-green-600', action: 'New Courses Added:', detail: 'Week 2', time: '10 mins ago' },
        { icon: Edit3, color: 'bg-purple-100 text-purple-600', action: 'Edit Courses:', detail: 'Week 1', time: '30 mins ago' },
        { icon: Trash2, color: 'bg-red-100 text-red-600', action: 'Deleted Course:', detail: 'Week 7', time: '1 hour ago' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-12 font-['Outfit']">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Total Users', value: '1.280', type: 'users' },
                    { label: 'Total Admins', value: '4', type: 'admins' },
                    { label: 'Total Course', value: '14', type: 'courses' },
                    { label: 'Questions Generated', value: '30', type: 'questions' },
                    { label: 'Active Users Today', value: '100', type: 'active' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all min-h-[140px]">
                        <div className="flex flex-col h-full items-start">
                            <span className="text-[11px] font-bold text-gray-400 tracking-tight mb-auto">{stat.label}</span>
                            <span className="text-[40px] font-bold text-gray-700 leading-none mb-2 tabular-nums tracking-tighter">{stat.value}</span>
                        </div>

                        {/* Custom Icons Matching the Image */}
                        <div className="absolute bottom-[-10px] right-[-10px] opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all origin-bottom-right pointer-events-none">
                            {stat.type === 'users' && <User className="w-24 h-24 text-slate-300" strokeWidth={3} />}
                            {stat.type === 'admins' && (
                                <div className="relative">
                                    <User className="w-24 h-24 text-red-300" strokeWidth={3} />
                                    <div className="absolute bottom-4 right-2 w-14 h-14 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-full p-1 border-4 border-white">
                                        <SettingsIcon className="w-12 h-12 text-red-300 animate-[spin_8s_linear_infinite]" strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                            {stat.type === 'courses' && <Bookmark className="w-24 h-24 text-emerald-300" strokeWidth={3} />}
                            {stat.type === 'questions' && <MessageSquare className="w-24 h-24 text-purple-300" strokeWidth={3} />}
                            {stat.type === 'active' && (
                                <div className="relative">
                                    <User className="w-24 h-24 text-blue-300" strokeWidth={3} />
                                    <div className="absolute bottom-5 right-5 w-4 h-4 bg-blue-300 rounded-full border-2 border-white shadow-sm"></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* User Activity Chart */}
                <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
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
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-500" />
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
                        <div>
                            <h3 className="text-[18px] font-black text-gray-900 border-b-2 border-slate-100 pb-2 mb-5 tracking-tight inline-block">Key Insights</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[13px] font-bold text-gray-500">Dominant Style:</span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black tracking-tight flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-emerald-400"></div> TAI
                                    </span>
                                    <span className="text-[13px] font-black text-gray-700">(33 user)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[13px] font-bold text-gray-500">Lowest Style:</span>
                                    <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black tracking-tight flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-slate-400"></div> TGR
                                    </span>
                                    <span className="text-[13px] font-black text-gray-700">(11 user)</span>
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
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-500" />
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
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-[20px] font-black text-gray-800 tracking-tight">Recent Activities</h2>
                    </div>

                    <div className="flex flex-col">
                        {recentActivities.map((act, i) => (
                            <div key={i} className={`flex items-center justify-between py-5 ${i !== recentActivities.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${act.action.includes('Admin') ? 'bg-blue-500' :
                                            act.action.includes('Added') ? 'bg-green-500' :
                                                act.action.includes('Edit') ? 'bg-purple-600' :
                                                    'bg-red-500'
                                        }`}>
                                        <act.icon className="w-5 h-5" strokeWidth={2.5} />
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
