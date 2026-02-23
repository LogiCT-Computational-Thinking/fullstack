import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, ChevronRight, X, Layout, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Modules() {
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/materials/');
            setMaterials(response.data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWeekClick = (week) => {
        setSelectedWeek(week);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleAccessModule = () => {
        if (selectedWeek && selectedWeek.file) {
            // Open PDF in new tab
            const fileUrl = selectedWeek.file.startsWith('http')
                ? selectedWeek.file
                : `http://127.0.0.1:8000${selectedWeek.file}`;
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-6 py-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <Layout className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                            Materi Pembelajaran
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg font-medium">
                            Jelajahi setiap modul pembelajaran secara bertahap. Selesaikan materi dan asah kemampuan berpikir komputasionalmu melalui kuiz asah otak.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="max-w-[1200px] mx-auto px-6 mt-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                        <p className="text-gray-400 font-bold">Memuat Materi...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((material, index) => {
                            // Dummy logic for status demonstration
                            const status = index === 0 ? 'completed' : index === 1 ? 'active' : 'locked';

                            return (
                                <div
                                    key={material.id}
                                    onClick={() => handleWeekClick(material)}
                                    className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                >
                                    {/* Card Decorative Bg */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${status === 'completed' ? 'bg-green-50 text-green-600' :
                                                status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status === 'completed' ? 'bg-green-100 text-green-700' :
                                                status === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {status === 'completed' ? 'Selesai' : status === 'active' ? 'Sedang Dipelajari' : 'Terkunci'}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black text-gray-800 mb-2">
                                            {material.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                                            {material.description || `Materi untuk minggu ke-${material.week}`}
                                        </p>

                                        <div className="flex items-center gap-4 text-gray-400 text-xs font-bold pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span>45 Menit</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>1 Modul</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Selection Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Decorative Background Blob */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 z-0" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedWeek?.title}</h2>
                                    <p className="text-gray-500 font-medium">Pilih aktivitas untuk melanjutkan</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Option 1: Access Module */}
                                <button
                                    onClick={handleAccessModule}
                                    className="group relative flex items-center gap-6 p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-left"
                                >
                                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                        <BookOpen className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-gray-900 text-lg group-hover:text-blue-900">Akses Modul</h4>
                                        <p className="text-gray-500 text-sm font-medium">Baca materi modul secara lengkap</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                                </button>

                                {/* Option 2: Quiz */}
                                <button
                                    className="group relative flex items-center gap-6 p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 text-left"
                                >
                                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                                        <Brain className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-gray-900 text-lg group-hover:text-purple-900">Asah Otak</h4>
                                        <p className="text-gray-500 text-sm font-medium">Uji pemahamanmu dengan kuis</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500" />
                                </button>
                            </div>

                            <button
                                onClick={closeModal}
                                className="w-full mt-8 py-4 bg-gray-50 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-colors"
                            >
                                Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
