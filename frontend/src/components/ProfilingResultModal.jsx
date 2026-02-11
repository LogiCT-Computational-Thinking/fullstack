import React from 'react';
import { useNavigate } from 'react-router-dom';
import architectImg from '../assets/architect_illustration.png';

export default function ProfilingResultModal({ isOpen, onClose, data, onSeeDetails }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    // Dummy data for matching the image
    const dummyData = {
        archetype: 'Architect',
        code: 'CT-PAR',
        description: 'Sees the tiny details in every picture and builds a plan with careful precision. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus. Vivamus commodo nisi in tortor commodo, ac tincidunt lacus tincidunt.',
    };

    const displayData = data ? {
        archetype: data.archetype_name,
        code: data.code,
        description: data.description
    } : dummyData;

    const handleSeeDetails = () => {
        if (onSeeDetails) {
            onSeeDetails();
        } else {
            onClose();
            navigate('/dashboard/profile-display');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative animate-zoom-in overflow-hidden flex flex-col max-h-[95vh]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 z-20 text-2xl transition-colors"
                >
                    ✕
                </button>

                <div className="overflow-y-auto custom-scrollbar">
                    <div className="p-10 pt-12">
                        {/* Header Section */}
                        <div className="mb-4">
                            <h3 className="text-[#3A9AB1] font-bold text-lg mb-1 tracking-tight">Your Computational Thinking Profile:</h3>
                            <div className="w-48 h-0.5 bg-[#3A9AB1] opacity-20 mb-6"></div>

                            <h1 className="text-[#3A9AB1] text-4xl font-extrabold mb-5 tracking-tight">{displayData.archetype}</h1>

                            <div className="inline-block bg-[#3A9AB1] text-white px-7 py-2 rounded-full font-extrabold text-sm tracking-widest mb-10 shadow-sm">
                                {displayData.code}
                            </div>

                            {/* Main Illustration */}
                            <div className="relative flex justify-center mb-8">
                                <div className="absolute inset-x-0 -top-10 -bottom-10 bg-gradient-to-b from-[#E0F2F1] via-[#F1F8F9] to-transparent rounded-full blur-3xl opacity-40 -z-10"></div>
                                <img
                                    src={architectImg}
                                    alt={displayData.archetype}
                                    className="w-56 h-auto object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Main Description */}
                            <p className="text-gray-700 text-[13px] leading-[1.6] text-center px-4 font-medium mb-10">
                                {displayData.description}
                            </p>

                            {/* See Details Button */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={handleSeeDetails}
                                    className="bg-[#3A9AB1] hover:bg-[#2d7e91] text-white font-bold py-3 px-10 rounded-full transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
                                >
                                    See Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
