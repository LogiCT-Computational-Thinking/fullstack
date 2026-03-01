import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

/**
 * MaterialViewer — menampilkan materi (PDF / PPT) dalam iframe.
 *
 * URL params:
 *   ?url=<encoded file URL>
 *   &title=<encoded judul materi>
 *   &type=<pdf|ppt>
 */
export default function MaterialViewer() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const fileUrl = params.get('url') || '';
    const title = params.get('title') || 'Materi';
    const fileType = (params.get('type') || 'pdf').toLowerCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Konversi URL /media/... → /api/media/... agar bebas X-Frame-Options
    const toProxiedUrl = (url) => {
        if (!url) return '';
        // Jika URL mengandung /media/ → ganti dengan /api/media/
        const mediaIndex = url.indexOf('/media/');
        if (mediaIndex !== -1) {
            const filePath = url.slice(mediaIndex + 7); // ambil path setelah /media/
            return `http://127.0.0.1:8000/api/media/${filePath}`;
        }
        return url; // URL external (Google Drive, dll) → biarkan apa adanya
    };

    // PPT / PPTX → Google Docs Viewer (renders in browser)
    // PDF       → /api/media/ proxy (iframe-friendly)
    const isPPT = fileType === 'ppt' || fileType === 'pptx';
    const proxiedUrl = toProxiedUrl(fileUrl);
    const viewerUrl = isPPT
        ? `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`
        : proxiedUrl;

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = title;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!fileUrl) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-gray-600 font-medium">URL materi tidak ditemukan.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
                >
                    Kembali
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">

            {/* ── Top Navbar ────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 gap-3 sticky top-0 z-50 shadow-sm">

                {/* Kiri: back + judul */}
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
                        title="Kembali"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 truncate">{title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            {fileType}
                        </span>
                    </div>
                </div>

                {/* Kanan: tombol download */}
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-bold transition-all flex-shrink-0"
                    title="Download file"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                </button>
            </header>

            {/* ── Iframe area ───────────────────────────────────────────── */}
            <div className="flex-1 relative">
                {/* Loading spinner */}
                {loading && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-3 z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-500">Memuat materi...</p>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-4 z-10">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                        <p className="text-gray-600 font-medium text-center px-4">
                            Tidak bisa menampilkan file ini di browser.<br />
                            Silakan download untuk membukanya.
                        </p>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition"
                        >
                            <Download className="w-4 h-4" />
                            Download File
                        </button>
                    </div>
                )}

                <iframe
                    key={viewerUrl}
                    src={viewerUrl}
                    title={title}
                    className="w-full h-full border-none"
                    style={{ minHeight: 'calc(100vh - 57px)' }}
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                    allow="fullscreen"
                />
            </div>
        </div>
    );
}
