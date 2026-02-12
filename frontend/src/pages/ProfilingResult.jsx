import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import architectImg from '../assets/architect_illustration.png';

export default function ProfilingResult({ data }) {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Priority: prop data > navigation state data > user profile data
    const archetypeInfo = data || location.state?.resultData || user?.archetype_info;

    // Data for matching the image
    const dummyData = {
        archetype: 'Architect',
        code: 'CT-PAR',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum.',
        cognitiveTraits: [
            { left: 'Intuitive', right: 'Systematic', value: 68, color: '#D671A8', text: '68% Intuitive' },
            { left: 'Specific', right: 'General', value: 61, color: '#E5A544', text: '61% Specific' },
            { left: 'Detail', right: 'Conceptual', value: 57, color: '#EF5DA8', text: '57% Detail' },
            { left: 'Flexible', right: 'Structured', value: 74, color: '#4CAF50', text: '74% Flexible' },
            { left: 'Implicit', right: 'Explicit', value: 88, color: '#3A9AB1', text: '88% Explicit' },
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
        archetype: archetypeInfo.archetype_name,
        code: archetypeInfo.code,
        description: archetypeInfo.description
    } : dummyData;

    return (
        <div
            className="flex-1 flex flex-col items-center py-10 font-sans -m-8 px-6"
            style={{
                background: 'linear-gradient(to bottom, #DCD5FF 0%, #9D8DE5 100%)',
                minHeight: 'calc(100vh - 73px)'
            }}
        >
            <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 mb-10 items-stretch">

                {/* LEFT SECTION: PROFILE (Rounded ONLY on Left) */}
                <div className="flex-[1] bg-white rounded-l-[40px] rounded-r-none p-8 flex flex-col items-center shadow-xl relative overflow-hidden border-2 border-[#7A2494] border-r-0">
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#7A2494] opacity-90"></div>

                    <h2 className="text-xl font-black text-[#7A2494] mb-4 mt-2">Your Profile</h2>

                    <div className="bg-[#F8F9FE] rounded-[32px] p-4 border border-gray-100 mb-6 w-full flex justify-center shadow-inner">
                        <img
                            src={architectImg}
                            alt="Profile"
                            className="w-48 h-auto drop-shadow-md"
                        />
                    </div>

                    <h1 className="text-3xl font-black text-[#7A2494] mb-2 tracking-tight">{displayData.archetype}</h1>

                    <div className="bg-[#EF5DA8] text-white px-5 py-1.5 rounded-2xl font-black text-xs mb-6 shadow-sm tracking-widest">
                        {displayData.code}
                    </div>

                    <div className="w-full bg-[#FBFBFF] border-2 border-[#7A2494] rounded-[32px] p-5 text-gray-600 text-[12px] leading-relaxed font-bold shadow-sm">
                        {displayData.description}
                    </div>
                </div>

                {/* RIGHT SECTION: TRAITS & STRENGTH/WEAKNESS (Wide) */}
                <div className="flex-[2.2] flex flex-col gap-6">

                    {/* TOP RIGHT: COGNITIVE TRAITS (Rounded ONLY on top-right) */}
                    <div className="bg-white rounded-tr-[40px] rounded-l-none rounded-b-none p-10 shadow-xl border-2 border-[#7A2494] flex flex-col">
                        <h2 className="text-2xl font-black text-[#7A2494] mb-8">Traits Cognitive</h2>

                        <div className="border border-[#7A2494]/50 rounded-[32px] p-10 space-y-12 bg-white">
                            {displayData.cognitiveTraits.map((trait, i) => (
                                <div key={i} className="flex items-center gap-6 group relative">
                                    {/* Left Label */}
                                    <span className="w-20 text-[13px] font-bold text-gray-400 text-right">{trait.left}</span>

                                    {/* Slider Container */}
                                    <div className="flex-1 relative h-4 flex items-center">
                                        {/* Background Slot (Pale) */}
                                        <div className="absolute inset-x-0 h-4 rounded-full" style={{ backgroundColor: `${trait.color}33` }}></div>

                                        {/* Filled Slot (Solid) */}
                                        <div
                                            className="absolute h-4 rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${trait.value}%`,
                                                backgroundColor: trait.color
                                            }}
                                        ></div>

                                        {/* Floating Value Indicator */}
                                        <div
                                            className="absolute -top-7 transition-all duration-1000 ease-out z-20 flex items-center gap-1.5 whitespace-nowrap"
                                            style={{ left: `calc(${trait.value}% - 35px)` }}
                                        >
                                            <span className="text-[12px] font-black" style={{ color: trait.color }}>{trait.value}%</span>
                                            <span className="text-[12px] font-black text-black">
                                                {trait.text.split(' ')[1]}
                                            </span>
                                        </div>

                                        {/* Slider Thumb (Solid with White Ring) */}
                                        <div
                                            className="absolute w-6 h-6 bg-white rounded-full transition-all duration-1000 ease-out flex items-center justify-center shadow-md transform group-hover:scale-110"
                                            style={{ left: `calc(${trait.value}% - 12px)` }}
                                        >
                                            <div className="w-[18px] h-[18px] rounded-full ring-2 ring-white" style={{ backgroundColor: trait.color }}></div>
                                        </div>
                                    </div>

                                    {/* Right Label */}
                                    <span className="w-24 text-[13px] font-bold text-gray-400 text-left">{trait.right}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOTTOM RIGHT: STRENGTH & WEAKNESS (Rounded ONLY on bottom-right) */}
                    <div className="bg-white rounded-br-[40px] rounded-l-none rounded-t-none p-10 shadow-xl flex flex-col md:flex-row gap-10 border-2 border-[#7A2494] border-t-0 border-l-2">

                        {/* Strengths */}
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[#7A2494] mb-6 text-center">Strength</h3>
                            <div className="space-y-3">
                                {displayData.strengths.map((str, idx) => (
                                    <div key={idx} className="bg-white border-2 border-[#7A2494]/40 rounded-full py-2.5 px-5 flex items-center gap-3 shadow-sm hover:translate-x-1 transition-transform cursor-default">
                                        <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                                        <p className="text-[11px] font-bold text-gray-600 leading-tight">{str}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="hidden md:block w-px bg-gray-100 my-4"></div>

                        {/* Weaknesses */}
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[#7A2494] mb-6 text-center">Weakness</h3>
                            <div className="space-y-3">
                                {displayData.weaknesses.map((weak, idx) => (
                                    <div key={idx} className="bg-white border-2 border-[#7A2494]/40 rounded-full py-2.5 px-5 flex items-center gap-3 shadow-sm hover:translate-x-1 transition-transform cursor-default">
                                        <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                                        <p className="text-[11px] font-bold text-gray-600 leading-tight">{weak}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Main Page Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-[#4C1D95] to-[#7C3AED] text-white px-16 py-4 rounded-full font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all mb-12 border-b-4 border-[#431407]/20"
            >
                Back to Main Page
            </button>
        </div>
    );
}
