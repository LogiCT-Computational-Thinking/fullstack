import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, googleAdminLogin } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ── Email/password login ──────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            const role = data.user?.role;

            if (role !== 'teacher' && role !== 'admin') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setError('Akses ditolak. Akun ini bukan admin atau teacher.');
                return;
            }

            navigate('/admin/materials');
        } catch (err) {
            setError(err.error || 'Login gagal. Periksa kembali email dan password.');
        } finally {
            setLoading(false);
        }
    };

    // ── Google login (endpoint khusus admin — tidak buat akun baru) ───────────
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);

        try {
            await googleAdminLogin(credentialResponse.credential);
            navigate('/admin/materials');
        } catch (err) {
            const msg = err.error || err.detail || err.message || 'Google login gagal. Coba lagi.';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google login gagal. Pastikan pop-up tidak diblokir browser.');
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Left Panel - Form */}
            <section className="flex flex-1 items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-14">
                <div className="w-full max-w-[420px]">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-6">
                        <img
                            src="/images/logo-logict.png"
                            alt="LogiCT"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
                        />
                        <div className="text-[#1284FD] font-extrabold text-2xl sm:text-3xl">LogiCT</div>
                    </div>

                    {/* Title — satu-satunya yang berbeda dari login biasa */}
                    <h1 className="text-2xl sm:text-[32px] font-extrabold leading-tight mb-1 text-slate-900">
                        Admin Portal
                    </h1>
                    <p className="text-sm text-gray-500 mb-6 sm:mb-7">
                        Khusus untuk <span className="font-semibold text-slate-700">admin</span> dan <span className="font-semibold text-slate-700">teacher</span>.{' '}
                        <Link to="/login" className="text-[#1284FD] hover:underline">
                            Login mahasiswa →
                        </Link>
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="mb-3 relative">
                            <input
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer disabled:opacity-50"
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                Email
                            </label>
                        </div>

                        {/* Password Field */}
                        <div className="mb-2.5 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer disabled:opacity-50"
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Remember Me */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between my-4 sm:my-[18px] gap-2 sm:gap-0">
                            <label className="flex items-center gap-2 text-[13px] text-gray-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-300"
                                />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-xs text-slate-500 hover:underline">
                                Lupa Kata Sandi?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-[#1284FD] transition-colors duration-150 hover:bg-white hover:text-[#1284FD] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Loading...' : 'Login'}
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-white text-gray-500">atau</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <div className="w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                text="signin_with"
                                shape="rectangular"
                                size="large"
                                width="100%"
                                locale="id"
                            />
                        </div>
                    </form>
                </div>
            </section>

            {/* Right Panel - Illustration (same as Login.jsx) */}
            <aside
                className="hidden lg:flex flex-[1.5] items-center justify-center relative overflow-hidden bg-white"
                aria-hidden="true"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{ backgroundImage: 'url(/images/Burung_Thinking_1.png)' }}
                />
            </aside>
        </div>
    );
}
