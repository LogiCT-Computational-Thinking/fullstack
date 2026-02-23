import React from 'react';
import { useNavigate } from 'react-router-dom';

// Archetype styles mirroring Dashboard.jsx exactly
const ARCHETYPE_STYLES = {
    PAR: { bgCard: '#E5EAFF', sideBar: '#1F3A8A', badgeFrom: '#3427C0', badgeTo: '#4B5563', btnFrom: '#38BDF8', btnTo: '#0EA5E9' },
    TAI: { bgCard: '#E5FFEC', sideBar: '#059669', badgeFrom: '#27C07B', badgeTo: '#065F46', btnFrom: '#34D399', btnTo: '#059669' },
    PGR: { bgCard: '#E5FFF5', sideBar: '#0F766E', badgeFrom: '#27C08F', badgeTo: '#134E4A', btnFrom: '#2DD4BF', btnTo: '#0F766E' },
    PGI: { bgCard: '#FFE5F2', sideBar: '#DB2777', badgeFrom: '#C02778', badgeTo: '#831843', btnFrom: '#F472B6', btnTo: '#DB2777' },
    TAR: { bgCard: '#F2E5FF', sideBar: '#5B21B6', badgeFrom: '#8827C0', badgeTo: '#4C1D95', btnFrom: '#A78BFA', btnTo: '#5B21B6' },
    TGI: { bgCard: '#FFFBE5', sideBar: '#F59E0B', badgeFrom: '#C0A927', badgeTo: '#92400E', btnFrom: '#38BDF8', btnTo: '#0EA5E9' },
    TGR: { bgCard: '#EEEEEE', sideBar: '#374151', badgeFrom: '#39372E', badgeTo: '#1F2937', btnFrom: '#6B7280', btnTo: '#374151' },
    PAI: { bgCard: '#FFEFE5', sideBar: '#F97316', badgeFrom: '#C05C27', badgeTo: '#7C2D12', btnFrom: '#FB923C', btnTo: '#F97316' },
};

const DEFAULT_STYLE = ARCHETYPE_STYLES.PAR;

export default function ProfilingResultModal({ isOpen, onClose, data, onSeeDetails }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const dummyData = {
        archetype_name: 'Architect',
        code: 'CT-PAR',
        description: 'Architect adalah tipe pemikir strategis yang unggul dalam merancang solusi sebelum bertindak. Kamu cenderung memahami masalah secara menyeluruh, memecahnya menjadi struktur logis, lalu membangun pendekatan yang efisien dan terencana.',
    };

    const displayData = data ? data : dummyData;

    // Normalize code: "CT-PGR" → "PGR"
    const rawCode = displayData.code || '';
    const cleanCode = (rawCode.includes('-') ? rawCode.split('-').pop() : rawCode).slice(-3).toUpperCase();
    const style = ARCHETYPE_STYLES[cleanCode] || DEFAULT_STYLE;

    const handleSeeDetails = () => {
        if (onSeeDetails) {
            onSeeDetails();
        } else {
            onClose();
            navigate('/dashboard/profile-display');
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-700/70 backdrop-blur-sm"
                onClick={onClose}
                style={{ animation: 'fadeIn 0.25s ease-out' }}
            />

            {/* Modal Outer */}
            <div
                className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden z-10"
                style={{ animation: 'zoomIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        {/* Brain icon */}
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5" />
                                <path d="M17 3.5A4.5 4.5 0 0 1 21.5 8v2.5" />
                                <path d="M21.5 10.5A4.5 4.5 0 0 1 17 15" />
                                <path d="M6.5 3.5A4.5 4.5 0 0 0 2.5 8v2.5" />
                                <path d="M2.5 10.5A4.5 4.5 0 0 0 7 15" />
                                <path d="M12 2.5V15" />
                                <path d="M7 15a5 5 0 0 0 10 0" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-800 text-[15px]">Cognitive Style Reveal</span>
                    </div>
                    {/* X button */}
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Close"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── INNER CARD (archetype color bg) ── */}
                <div className="mx-4 mt-4 rounded-[20px] overflow-hidden relative flex flex-row" style={{ background: style.bgCard, minHeight: 220 }}>

                    {/* Left sidebar accent stripe */}
                    <div className="w-1.5 flex-shrink-0" style={{ background: style.sideBar }} />

                    {/* Left: text content */}
                    <div className="flex-1 px-5 py-5 flex flex-col justify-center z-10">
                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">You're an</p>
                        <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
                            {displayData.archetype_name}
                        </h2>

                        {/* Badge */}
                        <div className="mb-4">
                            <span
                                className="text-white text-[11px] font-black px-3 py-1 rounded-full inline-block"
                                style={{ background: `linear-gradient(to right, ${style.badgeFrom}, ${style.badgeTo})` }}
                            >
                                CT-{cleanCode}
                            </span>
                        </div>

                        {/* Explanation */}
                        <p className="text-[11px] font-bold text-gray-800 mb-1">Explanation:</p>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                            {displayData.description}
                        </p>
                    </div>

                    {/* Right: mascot image — vertically centered */}
                    <div className="flex-shrink-0 w-[180px] flex items-center justify-center relative overflow-hidden">
                        <img
                            src={`/images/profiles/${cleanCode}.png`}
                            alt={displayData.archetype_name}
                            className="w-44 h-auto object-contain drop-shadow-xl relative z-10"
                            onError={(e) => { e.target.src = '/images/welkam_atas.png'; }}
                        />
                    </div>
                </div>

                {/* ── BOTTOM BUTTON ── */}
                <div className="px-4 py-5 flex justify-center">
                    <button
                        onClick={handleSeeDetails}
                        className="w-full max-w-xs py-3.5 rounded-full font-black text-white text-[15px] shadow-lg hover:scale-105 active:scale-95 transition-all"
                        style={{ background: `linear-gradient(to right, ${style.btnFrom}, ${style.btnTo})` }}
                    >
                        Back to Main Page
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes zoomIn {
                    from { transform: scale(0.88); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
