import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Loader2, Play } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';

export default function AdminMaterials() {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [week, setWeek] = useState(1);
    const [fileType, setFileType] = useState('pdf');
    const [order, setOrder] = useState(1);
    const [file, setFile] = useState(null);

    // Error State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/admin/materials/');
            setMaterials(response.data);
        } catch (err) {
            console.error('Failed to fetch materials:', err);
            // It's okay if empty or error on first load
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Harap pilih file terlebih dahulu.');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        // Prepare FormData for file upload
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('week', week);
        formData.append('file_type', fileType);
        formData.append('order', order);
        formData.append('file', file);

        try {
            // Using a fresh axios call to ensure no default 'Content-Type': 'application/json' 
            // interferes with the browser's automatic FormData boundary setting.
            const token = localStorage.getItem('access_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

            await axios.post(`${API_URL}/admin/materials/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Letting browser set Content-Type + boundary automatically
                }
            });

            setSuccess('Material berhasil di-upload!');

            // Reset form
            setTitle('');
            setDescription('');
            setWeek(1);
            setOrder(1);
            setFile(null);
            // reset file input
            document.getElementById('file-upload').value = '';

            // Refresh list
            fetchMaterials();
        } catch (err) {
            console.error('Upload error:', err.response?.data || err);
            let errorMessage = 'Gagal meng-upload material.';
            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'object') {
                    // Flatten error object: { file: ["msg"], title: ["msg"] } -> "file: msg, title: msg"
                    errorMessage = Object.entries(data)
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
                        .join(' | ');
                } else {
                    errorMessage = String(data);
                }
            }
            setError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto font-['Outfit'] animate-fade-in">
            <div className="flex flex-col xl:flex-row gap-6">

                {/* L E F T  S I D E : Form Upload */}
                <div className="flex-[4] bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <UploadCloud className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Upload Material</h2>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold">{success}</div>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-600">Judul Material</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: Pengenalan Pseudocode"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-600">Deskripsi Singkat</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Penjelasan singkat materi ini..."
                                rows="3"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-gray-600">Minggu Ke-</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={week}
                                    onChange={(e) => setWeek(parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-gray-600">Urutan (Order)</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 col-span-2 lg:col-span-1">
                                <label className="text-sm font-bold text-gray-600">Tipe File</label>
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm cursor-pointer"
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="ppt">PowerPoint</option>
                                    <option value="other">Lainnya / Video</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 mt-2">
                            <label className="text-sm font-bold text-gray-600">Pilih File (.pdf / .pptx)</label>
                            <input
                                id="file-upload"
                                type="file"
                                required
                                onChange={handleFileChange}
                                accept=".pdf,.ppt,.pptx,.mp4,.webm"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer bg-gray-50 border border-gray-200 rounded-xl"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className="mt-4 w-full bg-[#1284FD] text-white py-3.5 rounded-xl font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Sedang Mengunggah...
                                </>
                            ) : (
                                'Upload Material ke Server'
                            )}
                        </button>
                    </form>
                </div>

                {/* R I G H T  S I D E : List of Materials */}
                <div className="flex-[6] bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Database Material</h2>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{materials.length} Total</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                <p className="font-medium text-sm">Belum ada material yang diupload.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materials.map((m) => (
                                    <div key={m.id} className="border border-gray-100 bg-gray-50 hover:bg-white rounded-2xl p-4 transition-all shadow-sm hover:shadow-md group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                    Minggu {m.week}
                                                </span>
                                                <span className="text-[10px] bg-gray-200 text-gray-500 font-bold px-2 py-0.5 rounded uppercase">
                                                    {m.file_type}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                                {m.title}
                                            </h3>
                                            <p className="text-[11px] text-gray-500 line-clamp-2 mb-4">
                                                {m.description || 'Tidak ada deskripsi'}
                                            </p>
                                        </div>

                                        <a
                                            href={m.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center w-fit gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors mt-auto"
                                        >
                                            <Play className="w-3 h-3 fill-current" /> Buka File
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
