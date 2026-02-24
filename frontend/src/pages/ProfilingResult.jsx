import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import shieldBars from '../assets/dashboard/shield_bars.png';
import api from '../services/api';



export default function ProfilingResult({ data }) {
    const { user, setUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [hoveredTrait, setHoveredTrait] = useState(null);

    // Always fetch fresh profile on mount — same pattern as Dashboard.jsx
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchLatestProfile = async () => {
            try {
                const response = await api.get('/auth/profile/');
                const updatedUser = response.data;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } catch (err) {
                console.error("Failed to refresh profile in Result page:", err);
            }
        };
        fetchLatestProfile();
    }, []);

    // Use user from AuthContext as primary (like Dashboard.jsx)
    // Fall back to location.state only for immediate post-quiz moment
    const resultObj = data || location.state?.resultData;
    const archetypeInfo = user?.archetype_info
        || resultObj?.user?.archetype_info
        || resultObj?.archetype_info;
    const sourceUser = user;   // Always use fresh user, same as Dashboard

    const getScore = (val) => (val !== undefined && val !== null) ? val : 25;

    // Format test taken date
    const formatDate = (dateStr) => {
        if (!dateStr) return '12 Februari 2026';
        const d = new Date(dateStr);
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const testTakenDate = formatDate(sourceUser?.updated_at || sourceUser?.date_joined);

    // Default dummy data
    const dummyData = {
        archetype: 'Architect',
        code: 'CT-PAR',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus.',
        cognitiveDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus. Vivamus commodo nisi in tortor commodo, ac tincidunt lacus tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus. Vivamus commodo nisi in tortor commodo, ac tincidunt lacus tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus. Vivamus commodo nisi in tortor commodo, ac tincidunt lacus tincidunt.',
        tactics: ['Step-by-Step', 'Planner'],
        tacticsImage: '/images/traits/PAR 2.png',
        tacticsDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo.',
        cognitiveTraits: [
            { left: 'Visual Text', right: 'Visual Picture', shortLeft: 'T', shortRight: 'P', value: sourceUser?.cog_tp_value ?? 68, bright: '#FFD1FF', dark: '#E600E6' },
            { left: 'Global', right: 'Analytics', shortLeft: 'G', shortRight: 'A', value: sourceUser?.cog_ga_value ?? 35, bright: '#FFE4BC', dark: '#FF8A00' },
            { left: 'Impulsive', right: 'Reflective', shortLeft: 'I', shortRight: 'R', value: sourceUser?.cog_ir_value ?? 60, bright: '#C1FFEB', dark: '#00D06C' },
        ],
        strengths: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        ],
        weaknesses: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        ]
    };

    const displayData = archetypeInfo ? {
        ...dummyData,
        archetype: archetypeInfo.archetype_name || dummyData.archetype,
        code: archetypeInfo.code ? `CT-${archetypeInfo.code}` : dummyData.code,
        description: archetypeInfo.description || dummyData.description,
        cognitiveDescription: archetypeInfo.cognitive_description || dummyData.cognitiveDescription,
        tactics: (archetypeInfo.tactics && archetypeInfo.tactics.length > 0)
            ? archetypeInfo.tactics
            : dummyData.tactics,
        tacticsImage: archetypeInfo.tactics_image || dummyData.tacticsImage,
        tacticsDescription: archetypeInfo.tactics_description || dummyData.tacticsDescription,
        strengths: (archetypeInfo.strengths && archetypeInfo.strengths.length > 0)
            ? archetypeInfo.strengths
            : dummyData.strengths,
        weaknesses: (archetypeInfo.weaknesses && archetypeInfo.weaknesses.length > 0)
            ? archetypeInfo.weaknesses
            : dummyData.weaknesses,
        cognitiveTraits: [
            { left: 'Visual Text', right: 'Visual Picture', shortLeft: 'T', shortRight: 'P', value: getScore(sourceUser?.cog_tp_value), bright: '#FFD1FF', dark: '#E600E6' },
            { left: 'Global', right: 'Analytics', shortLeft: 'G', shortRight: 'A', value: getScore(sourceUser?.cog_ga_value), bright: '#FFE4BC', dark: '#FF8A00' },
            { left: 'Impulsive', right: 'Reflective', shortLeft: 'I', shortRight: 'R', value: getScore(sourceUser?.cog_ir_value), bright: '#C1FFEB', dark: '#00D06C' },
        ],
    } : {
        ...dummyData,
        // When not profiled yet, keep full dummy
    };

    // Get profile image code e.g. "CT-TGI" -> "TGI"
    const profileImageCode = displayData.code?.includes('-')
        ? displayData.code.split('-')[1]
        : displayData.code?.slice(-3)?.toUpperCase() || 'PAR';

    // Exact same colors as Dashboard.jsx ARCHETYPE_STYLES (Tailwind hex → inline)
    const ARCHETYPE_STYLES = {
        PAR: { bgCard: '#E5EAFF', sideBar: '#1F3A8A', badgeFrom: '#3427C0', badgeTo: '#5A4F12', bottomBar: '#1F3A8A' },
        TAI: { bgCard: '#E5FFEC', sideBar: '#059669', badgeFrom: '#27C07B', badgeTo: '#5A4F12', bottomBar: '#059669' },
        PGR: { bgCard: '#E5FFF5', sideBar: '#0F766E', badgeFrom: '#27C08F', badgeTo: '#5A4F12', bottomBar: '#0F766E' },
        PGI: { bgCard: '#FFE5F2', sideBar: '#DB2777', badgeFrom: '#C02778', badgeTo: '#5A4F12', bottomBar: '#DB2777' },
        TAR: { bgCard: '#F2E5FF', sideBar: '#5B21B6', badgeFrom: '#8827C0', badgeTo: '#5A4F12', bottomBar: '#5B21B6' },
        TGI: { bgCard: '#FFFBE5', sideBar: '#F59E0B', badgeFrom: '#C0A927', badgeTo: '#5A4F12', bottomBar: '#B45309' },
        TGR: { bgCard: '#EEEEEE', sideBar: '#374151', badgeFrom: '#39372E', badgeTo: '#5A4F12', bottomBar: '#374151' },
        PAI: { bgCard: '#FFEFE5', sideBar: '#F97316', badgeFrom: '#C05C27', badgeTo: '#5A4F12', bottomBar: '#EA580C' },
    };
    const currentStyle = ARCHETYPE_STYLES[profileImageCode] || ARCHETYPE_STYLES.PAR;

    return (
        <div
            className="flex-1 flex flex-col font-sans -m-8 px-8 py-10"
            style={{
                background: '#F5F7FF',
                minHeight: 'calc(100vh - 73px)'
            }}
        >
            {/* Page Title */}
            <h1 className="text-2xl font-black text-gray-900 mb-8 ml-2">
                Your Cognitive Profile is..
            </h1>

            {/* TOP SECTION: Profile Card + Cognitive Traits Card */}
            <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 mb-8">

                {/* LEFT CARD: Profile */}
                <div
                    className="flex-[1] flex flex-col rounded-3xl overflow-hidden shadow-lg relative"
                    style={{ background: 'white', minWidth: 220 }}
                >
                    {/* Archetype background Grid — Full height background */}
                    <div
                        className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                        style={{ background: currentStyle.sideBar }}
                    />
                    <div
                        className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />

                    {/* White wavy SVG background shape — matches reference hump pattern */}
                    <svg
                        className="absolute top-0 left-0 w-[110%] h-full pointer-events-none"
                        viewBox="0 0 1440 400"
                        preserveAspectRatio="none"
                        style={{ zIndex: 1, left: '-5%' }}
                    >
                        <path
                            fill="white"
                            d="M0,115 C150,185 350,75 500,135 C700,215 900,-15 1200,95 C1350,165 1440,15 1440,15 V400 H0 Z"
                        ></path>
                    </svg>

                    {/* Doodle background image — positioned on top of the grid/wave as requested */}
                    <img
                        src="/images/Group 7305.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                        style={{ opacity: 0.45, zIndex: 2 }}
                    />

                    {/* Card content */}
                    <div className="relative z-10 flex flex-col items-center px-10 pt-16 pb-0 flex-1 group">
                        {/* "Your Profile" label */}
                        <p className="text-[16px] text-gray-500 font-medium mb-2">Your Profile</p>

                        {/* Archetype name + badge on same row */}
                        <div className="flex items-center gap-4 mb-8 flex-wrap justify-center">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{displayData.archetype}</h2>
                            <span
                                className="text-white text-[13px] font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap"
                                style={{ background: `linear-gradient(to right, ${currentStyle.badgeFrom}, ${currentStyle.badgeTo})` }}
                            >
                                {displayData.code}
                            </span>
                        </div>

                        {/* Mascot Image */}
                        <div className="flex items-center justify-center mb-10 relative">
                            <img
                                src={`/images/profiles/${profileImageCode}.png`}
                                alt={displayData.archetype}
                                className="w-64 h-auto drop-shadow-2xl z-20 transition-transform duration-700 ease-out group-hover:scale-110 cursor-pointer"
                                onError={(e) => { e.target.src = '/images/welkam_atas.png'; }}
                            />
                        </div>

                        {/* Description */}
                        <p className="text-[14px] text-gray-700 leading-relaxed text-left w-full mb-8">
                            {displayData.description}
                        </p>
                    </div>

                    {/* Bottom bar — archetype sideBar accent color */}
                    {/* Bottom bar — archetype sideBar accent color */}
                    <div
                        className="relative z-10 w-full py-4 text-white font-black text-[16px] text-center overflow-hidden"
                        style={{ background: currentStyle.sideBar }}
                    >
                        {/* Grid Overlay for bar */}
                        <div
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                                backgroundSize: '16px 16px',
                            }}
                        />
                        <span className="relative z-10">Cognitive Profile</span>
                    </div>
                </div>

                {/* RIGHT CARD: Cognitive Traits */}
                <div
                    className="flex-[1.6] flex flex-col rounded-3xl overflow-hidden shadow-lg relative"
                    style={{ background: currentStyle.sideBar }}
                >
                    {/* Header bar */}
                    <div className="flex items-center justify-center px-6 py-4 relative overflow-hidden" style={{ background: currentStyle.sideBar }}>
                        {/* Grid Overlay for header */}
                        <div
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                                backgroundSize: '18px 18px',
                            }}
                        />
                        <h2 className="text-white font-black text-[18px] tracking-wide relative z-10">Cognitive Traits</h2>
                    </div>

                    {/* Main content area */}
                    <div
                        className="flex-1 flex flex-col relative overflow-hidden px-5 pt-3"
                        style={{ background: 'white' }}
                    >
                        {/* Horizontal divider below header */}
                        <hr className="border-t border-gray-100 mb-5 w-full opacity-50" />

                        {/* Decorative background image at the bottom */}
                        <img
                            src="/images/Group 7326.png"
                            alt=""
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 w-full pointer-events-none select-none z-0 object-contain"
                            style={{ opacity: 0.6 }}
                        />

                        {/* TOP SECTION: Tactics enclosed in a card */}
                        <div
                            className="relative z-10 flex flex-row gap-0 mb-5 rounded-2xl overflow-hidden group"
                            style={{ border: `1px solid ${currentStyle.sideBar}33` }}
                        >
                            {/* LEFT: Tactics label + badge + image */}
                            <div className="flex flex-col items-center flex-shrink-0 py-5 px-6" style={{ minWidth: 230, maxWidth: 250 }}>
                                {/* Tactics label */}
                                <p className="text-[11px] text-gray-300 font-bold mb-1 uppercase tracking-wider">Tactics</p>

                                {/* Tactic badge */}
                                <div className="mb-4">
                                    <span
                                        className="text-white text-[11px] font-black px-4 py-1.5 rounded-full w-fit block"
                                        style={{
                                            background: `linear-gradient(to right, ${currentStyle.badgeFrom}, ${currentStyle.badgeTo})`,
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {(displayData.tactics || ['Step-by-Step', 'Planner']).join(' · ')}
                                    </span>
                                </div>

                                {/* Tactics image */}
                                <div className="flex justify-center w-full">
                                    <img
                                        src={displayData.tacticsImage || `/images/traits/${profileImageCode} 2.png`}
                                        alt="tactics"
                                        className="w-28 h-auto drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-110 cursor-pointer"
                                        onError={(e) => { e.target.src = `/images/profiles/${profileImageCode}.png`; }}
                                    />
                                </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="w-[1px] h-auto my-5 opacity-30" style={{ background: currentStyle.sideBar }}></div>

                            {/* RIGHT: Tactics description inside its own box */}
                            <div className="flex-1 p-5 flex items-center justify-center">
                                <div
                                    className="rounded-3xl p-6 flex items-center justify-center h-full w-full"
                                    style={{ background: currentStyle.sideBar }}
                                >
                                    <p className="text-[13px] text-white/90 leading-relaxed text-center font-medium">
                                        {displayData.tacticsDescription}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM SECTION: Bar chart enclosed in a card */}
                        <div
                            className="mb-4 rounded-2xl p-6 px-10 flex flex-col justify-center gap-8 relative z-10"
                            style={{
                                background: `linear-gradient(to right, white, ${currentStyle.bgCard})`,
                                border: `1px solid ${currentStyle.sideBar}33`
                            }}
                        >
                            {displayData.cognitiveTraits.map((trait, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 w-full relative group"
                                    onMouseEnter={() => setHoveredTrait(i)}
                                    onMouseLeave={() => setHoveredTrait(null)}
                                >
                                    {/* Left label */}
                                    <span className="w-6 text-[12px] font-black text-gray-600 text-center uppercase flex-shrink-0 tracking-tighter">{trait.shortLeft}</span>

                                    {/* Bar track */}
                                    <div className="flex-1 relative h-6 bg-gray-50 border border-gray-200 rounded-full flex items-center shadow-inner overflow-visible">

                                        {/* % label above thumb */}
                                        <div
                                            className="absolute -top-6 z-50 text-white text-[10px] font-black px-1.5 py-0.5 rounded pointer-events-none"
                                            style={{
                                                left: `${trait.value}%`,
                                                transform: 'translateX(-50%)',
                                                background: trait.dark,
                                            }}
                                        >
                                            {Math.round(Math.abs(trait.value - 50) * 2)}%
                                        </div>

                                        {/* Floating Tooltip on Hover */}
                                        {hoveredTrait === i && (
                                            <div
                                                className="absolute -top-10 z-50 px-2.5 py-1 bg-gray-800 text-white text-[10px] font-black rounded-md shadow-xl pointer-events-none flex items-center gap-1.5"
                                                style={{
                                                    left: `${trait.value}%`,
                                                    transform: 'translateX(-50%)'
                                                }}
                                            >
                                                <span className="whitespace-nowrap italic">{trait.value >= 50 ? trait.right : trait.left}</span>
                                                <span className="bg-white/20 px-1 rounded">{Math.round(Math.abs(trait.value - 50) * 2)}%</span>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                            </div>
                                        )}

                                        {/* Bidirectional fill from center */}
                                        <div
                                            className="absolute h-full transition-all duration-1000 opacity-90 rounded-full"
                                            style={{
                                                left: trait.value >= 50 ? '50%' : `${trait.value}%`,
                                                width: `${Math.abs(trait.value - 50)}%`,
                                                background: trait.value >= 50
                                                    ? `linear-gradient(to right, ${trait.bright}, ${trait.dark})`
                                                    : `linear-gradient(to left, ${trait.bright}, ${trait.dark})`
                                            }}
                                        ></div>

                                        {/* Shield icon at center */}
                                        <div className="absolute left-1/2 -translate-x-1/2 w-7 h-7 z-40 drop-shadow-sm flex items-center justify-center pointer-events-none">
                                            <img
                                                src={shieldBars}
                                                alt="shield"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        {/* Glowing Doughnut Thumb */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 z-50 transition-all duration-1000 flex items-center justify-center pointer-events-none"
                                            style={{
                                                left: trait.value >= 50
                                                    ? `calc(${trait.value}% - 20px)`
                                                    : `calc(${trait.value}% - 2px)`
                                            }}
                                        >
                                            <div
                                                className="w-5 h-5 rounded-full bg-transparent border-[3.5px] border-white flex-shrink-0"
                                                style={{ boxShadow: `0 0 14px ${trait.dark}, inset 0 0 5px ${trait.dark}` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Right label */}
                                    <span className="w-6 text-[12px] font-black text-gray-600 text-center uppercase flex-shrink-0 tracking-tighter">{trait.shortRight}</span>
                                </div>
                            ))}
                        </div>

                        {/* Test Taken date */}
                        <div className="px-5 pb-4 relative z-10">
                            <p className="text-[11px] text-gray-400">
                                Test Taken: {testTakenDate}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 1: Cognitive Description */}
            <div className="w-full max-w-[1400px] mx-auto mb-8">
                <div
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{ background: 'white', border: '1px solid #e5e7eb' }}
                >
                    {/* Section header */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 font-black text-sm flex-shrink-0"
                            style={{ background: '#F3F4F6' }}
                        >
                            1
                        </div>
                        <h3 className="text-xl font-black text-gray-800">Cognitive Description</h3>
                    </div>

                    {/* Description text */}
                    <div className="px-6 py-5 relative overflow-hidden group">
                        {/* Specific background for this section */}
                        <img
                            src="/images/Group 7329.png"
                            alt=""
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 w-full object-contain pointer-events-none opacity-[0.45] z-0"
                        />

                        <p className="text-[13px] text-gray-700 leading-relaxed relative z-10 mb-6">
                            {displayData.cognitiveDescription}
                        </p>

                        {/* Mascot centered with stage */}
                        <div className="flex justify-center relative pb-2">
                            {/* Stage for mascot */}
                            <img
                                src="/images/Ellipse 579.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute bottom-[-5px] w-64 h-auto object-contain pointer-events-none"
                                style={{ zIndex: 5 }}
                            />
                            <img
                                src={`/images/profiles/${profileImageCode}.png`}
                                alt={displayData.archetype}
                                className="w-52 h-auto drop-shadow-2xl relative z-10 transition-all duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2 cursor-pointer"
                                onError={(e) => { e.target.src = '/images/welkam_atas.png'; }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Strength & Weakness */}
            <div className="w-full max-w-[1400px] mx-auto mb-12">
                <div
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{ background: 'white', border: '1px solid #e5e7eb' }}
                >
                    {/* Section header */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 font-black text-sm flex-shrink-0"
                            style={{ background: '#F3F4F6' }}
                        >
                            2
                        </div>
                        <h3 className="text-xl font-black text-gray-800">Strength &amp; Weakness</h3>
                    </div>

                    {/* Two columns */}
                    <div className="px-6 py-6 relative overflow-hidden">
                        {/* Specific background for this section */}
                        <img
                            src="/images/Group 7329.png"
                            alt=""
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 w-full object-contain pointer-events-none opacity-[0.45] z-0"
                        />
                        <div className="grid grid-cols-2 gap-8 relative z-10">

                            {/* Strength column */}
                            <div>
                                {/* Column header */}
                                <div
                                    className="mb-5 py-3 px-4 rounded-2xl text-center font-black text-[14px] text-gray-800 shadow-sm"
                                    style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '2px 4px 0px rgba(0,0,0,0.06)' }}
                                >
                                    Strength
                                </div>
                                <div className="flex flex-col gap-3">
                                    {displayData.strengths.map((str, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            {/* Number badge */}
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                                style={{ background: currentStyle.bgCard, color: '#4B5563' }}
                                            >
                                                {idx + 1}
                                            </div>
                                            {/* Text pill */}
                                            <div
                                                className="flex-1 py-2.5 px-4 rounded-2xl text-[12px] text-gray-600 leading-snug"
                                                style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '1px 2px 0px rgba(0,0,0,0.04)' }}
                                            >
                                                {str}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weakness column */}
                            <div>
                                {/* Column header */}
                                <div
                                    className="mb-5 py-3 px-4 rounded-2xl text-center font-black text-[14px] text-gray-800 shadow-sm"
                                    style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '2px 4px 0px rgba(0,0,0,0.06)' }}
                                >
                                    Weakness
                                </div>
                                <div className="flex flex-col gap-3">
                                    {displayData.weaknesses.map((weak, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            {/* Number badge */}
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                                style={{ background: currentStyle.bgCard, color: '#4B5563' }}
                                            >
                                                {idx + 1}
                                            </div>
                                            {/* Text pill */}
                                            <div
                                                className="flex-1 py-2.5 px-4 rounded-2xl text-[12px] text-gray-600 leading-snug"
                                                style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '1px 2px 0px rgba(0,0,0,0.04)' }}
                                            >
                                                {weak}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Dashboard Button */}
            <div className="w-full max-w-[1400px] mx-auto flex justify-center mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-white px-16 py-4 rounded-full font-black text-[15px] shadow-xl hover:scale-105 active:scale-95 transition-all"
                    style={{ background: currentStyle.sideBar }}
                >
                    Back to Main Page
                </button>
            </div>
        </div>
    );
}
