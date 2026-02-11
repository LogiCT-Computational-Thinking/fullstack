import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import architectImg from '../assets/architect_illustration.png';

export default function ProfilingResult({ data }) {
    const { user } = useAuth();
    const location = useLocation();

    // Priority: prop data \u003e navigation state data \u003e user profile data
    const archetypeInfo = data || location.state?.resultData || user?.archetype_info;

    // Dummy data for matching the image if no data is passed
    const dummyData = {
        archetype: 'Architect',
        code: 'CT-PAR',
        description: 'Sees the tiny details in every picture and builds a plan with careful precision. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus. Vivamus commodo nisi in tortor commodo, ac tincidunt lacus tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus. Vivamus commodo nisi in tortor commodo, ac tincidunt lacus tincidunt.',
        cognitiveTraits: [
            { label: 'Visual Information Processin', value: 84, color: '#D671A8' },
            { label: 'Problem Decomposition', value: 78, color: '#E5A544' },
            { label: 'Focused & Sequential Thinking', value: 70, color: '#EF5DA8' },
            { label: 'Analytical Decision-Making', value: 76, color: '#4CAF50' },
            { label: 'Self-Monitoring & Verification', value: 88, color: '#3A9AB1' },
        ],
        pedagogicTraits: [
            { label: 'Problem Decomposition', value: 68, left: 'Intuitive', right: 'Systematic', color: '#4CAF50' },
            { label: 'Pattern Recognition', value: 81, left: 'Specific', right: 'General', color: '#68C3E5' },
            { label: 'Abstraction', value: 57, left: 'Detail', right: 'Conceptual', color: '#D671A8' },
            { label: 'Algorithmic Thinking', value: 74, left: 'Flexible', right: 'Structured', color: '#E5A544' },
        ],
        strengths: [
            'Exceptional attention to detail in visual tasks.',
            'Highly structured approach to problem-solving.',
            'Strong ability to verify results against expectations.',
        ],
        weaknesses: [
            'May take longer to process information due to high focus on details.',
            'Can get bogged down in minutiae before seeing the big picture.',
            'Risk of over-analyzing simple tasks.',
        ]
    };

    // If we have archetype data from DB, we override the basics
    const displayData = archetypeInfo ? {
        ...dummyData, // Keep traits for now since they are dynamic/dummy in UI
        archetype: archetypeInfo.archetype_name,
        code: archetypeInfo.code,
        description: archetypeInfo.description
    } : dummyData;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-10 pt-12">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h3 className="text-[#3A9AB1] font-bold text-lg mb-1 tracking-tight">Your Computational Thinking Profile:</h3>
                        <div className="w-48 h-0.5 bg-[#3A9AB1] opacity-20 mb-6"></div>

                        <h1 className="text-[#3A9AB1] text-4xl font-extrabold mb-5 tracking-tight">{displayData.archetype}</h1>

                        <div className="inline-block bg-[#3A9AB1] text-white px-7 py-2 rounded-full font-extrabold text-sm tracking-widest mb-10 shadow-sm">
                            {displayData.code}
                        </div>

                        {/* Main Illustration */}
                        <div className="relative flex justify-center mb-12">
                            <div className="absolute inset-x-0 -top-10 -bottom-10 bg-gradient-to-b from-[#E0F2F1] via-[#F1F8F9] to-transparent rounded-full blur-3xl opacity-40 -z-10"></div>
                            <img
                                src={architectImg}
                                alt={displayData.archetype}
                                className="w-80 h-auto object-contain drop-shadow-2xl"
                            />
                        </div>

                        {/* Main Description */}
                        <p className="text-gray-700 text-[13px] leading-[1.6] text-center px-10 font-medium whitespace-pre-wrap">
                            {displayData.description}
                        </p>
                    </div>

                    <div className="h-px bg-gray-100 w-full my-12 opacity-60"></div>

                    {/* Cognitive Traits Section */}
                    <div className="mb-12">
                        <h4 className="text-[#3A9AB1] font-bold text-lg mb-8 tracking-tight">Traits cognitive</h4>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-7">
                                {displayData.cognitiveTraits.map((trait, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-end mb-2.5 px-0.5">
                                            <span className="text-[12px] font-extrabold text-gray-800 tracking-tight">{trait.label}</span>
                                            <span className="text-[12px] font-bold" style={{ color: trait.color }}>› <span className="ml-1">{trait.value}%</span></span>
                                        </div>
                                        <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${trait.value}%`, backgroundColor: trait.color }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Archetype Small Card */}
                            <div className="w-full md:w-60 bg-[#F1F8F9] rounded-[32px] p-6 flex flex-col items-center text-center shadow-sm self-start mt-2">
                                <p className="text-[12px] font-extrabold text-gray-800 mb-4">{displayData.archetype}</p>
                                <div className="bg-white/50 p-2 rounded-2xl mb-4">
                                    <img src={architectImg} alt="mini" className="w-28 h-28 object-contain" />
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                    The Architect profile excels at identifying patterns and relationships within complex systems, creating detailed plans for execution.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full my-12 opacity-60"></div>

                    {/* Pedagogic Traits Section */}
                    <div className="mb-12">
                        <h4 className="text-[#3A9AB1] font-bold text-lg mb-10 tracking-tight">Traits pedagogic</h4>
                        <div className="grid grid-cols-1 gap-12">
                            {displayData.pedagogicTraits.map((trait, idx) => (
                                <div key={idx} className="relative">
                                    <div className="flex justify-between items-center mb-3 px-1">
                                        <span className="text-[12px] font-extrabold text-gray-800 tracking-tight">{trait.label}</span>
                                        <span className="text-[11px] font-extrabold" style={{ color: trait.color }}>
                                            {trait.value}% <span className="text-gray-900 ml-1">{trait.value > 50 ? trait.right : trait.left}</span>
                                        </span>
                                    </div>
                                    <div className="relative h-4 flex items-center">
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{ backgroundColor: `${trait.color}15` }}
                                        ></div>
                                        <div className="absolute inset-x-0 h-[10px] bg-gray-50/50 rounded-full border border-gray-100 shadow-inner"></div>
                                        <div
                                            className="absolute h-[10px] rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${trait.value}%`, backgroundColor: trait.color, opacity: 0.6 }}
                                        ></div>

                                        {/* Slider Thumb */}
                                        <div
                                            className="absolute w-6 h-6 bg-white rounded-full border-[1px] shadow-md z-10 transition-all duration-1000 ease-out flex items-center justify-center"
                                            style={{ left: `calc(${trait.value}% - 12px)`, borderColor: trait.color }}
                                        >
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: trait.color }}></div>
                                        </div>
                                    </div>
                                    {/* End Labels */}
                                    <div className="flex justify-between mt-3 px-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{trait.left}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{trait.right}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full my-12 opacity-60"></div>

                    {/* Strength & Weakness Section */}
                    <div className="mb-6">
                        <h4 className="text-[#3A9AB1] font-bold text-lg mb-8 tracking-tight">Strength & Weakness</h4>
                        <div className="border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                            <div className="bg-[#3A9AB1] flex text-white font-extrabold text-[12px] py-4 px-8 uppercase tracking-wider">
                                <div className="flex-1 text-center">Strengths</div>
                                <div className="w-[1px] bg-white/30 my-0.5"></div>
                                <div className="flex-1 text-center pl-4">Weaknesses</div>
                            </div>
                            <div className="flex flex-col md:flex-row p-8 gap-8 items-stretch">
                                <div className="flex-1 space-y-4">
                                    {displayData.strengths.map((item, i) => (
                                        <div key={i} className="flex gap-3 text-[11px] text-gray-700 leading-normal font-medium">
                                            <span className="text-[#3A9AB1] text-sm leading-none mt-0.5">♦</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-px bg-gray-100 hidden md:block"></div>
                                <div className="flex-1 space-y-4">
                                    {displayData.weaknesses.map((item, i) => (
                                        <div key={i} className="flex gap-3 text-[11px] text-gray-700 leading-normal font-medium">
                                            <span className="text-[#3A9AB1] text-xs leading-none mt-0.5">▪</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
