import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilingResultModal({ isOpen, onClose, data, onSeeDetails }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const dummyData = {
        archetype_name: 'Explorer',
        code: 'PGR',
        description: 'Looks at the big picture through charts and maps, preferring to observe the whole landscape first. You have a natural ability to synthesize information and find patterns that others might miss.',
    };

    const displayData = data ? data : dummyData;
    const cleanCode = displayData.code ? (displayData.code.includes('-') ? displayData.code.split('-')[1] : displayData.code).slice(-3).toUpperCase() : 'PAR';

    const handleSeeDetails = () => {
        if (onSeeDetails) {
            onSeeDetails();
        } else {
            onClose();
            navigate('/dashboard/profile-display');
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in">
            {/* Dark semi-transparent background - NO blur for maximum stability */}
            <div className="absolute inset-0 bg-gray-900/80" onClick={onClose}></div>

            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative animate-zoom-in overflow-hidden flex flex-col z-10">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-8 text-gray-300 hover:text-gray-900 z-20 text-2xl transition-all hover:rotate-90"
                >
                    ✕
                </button>

                <div className="p-8 sm:p-12">
                    {/* Header Section */}
                    <div className="text-center mb-6">
                        <div className="inline-block bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
                            Assessment Result
                        </div>
                        <h3 className="text-gray-400 font-bold text-sm tracking-tight mb-2 uppercase">Your Archetype is</h3>
                        <h1 className="text-gray-900 text-5xl font-black mb-4 tracking-tighter italic">
                            {displayData.archetype_name}
                        </h1>
                        <div className="h-1 w-20 bg-teal-500 mx-auto rounded-full"></div>
                    </div>

                    {/* Illustration Card */}
                    <div className="bg-teal-50/50 rounded-[32px] p-6 mb-8 relative group">
                        <div className="flex justify-center">
                            <img
                                src={`/images/profiles/${cleanCode}.png`}
                                alt={displayData.archetype_name}
                                className="w-48 h-48 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    e.target.src = '/images/welkam_atas.png'; // Improved fallback
                                }}
                            />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-6 py-2 rounded-full font-black text-sm shadow-lg border-2 border-white">
                            {displayData.code}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="text-center mb-10 px-2">
                        <p className="text-gray-600 text-sm leading-relaxed font-bold">
                            {displayData.description}
                        </p>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleSeeDetails}
                        className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 px-10 rounded-[20px] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-xl flex items-center justify-center gap-3 group"
                    >
                        EXPLORE FULL DASHBOARD
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all group-hover:translate-x-2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
