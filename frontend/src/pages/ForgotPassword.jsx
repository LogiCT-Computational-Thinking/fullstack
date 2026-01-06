import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { playClick, playFocus, playSuccess, playError } = useSound();
    const { forgotPassword, verifyOTP, resetPasswordOTP } = useAuth();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        playClick();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await forgotPassword(email);
            setMessage(response.message || 'OTP telah dikirim ke email Anda.');
            playSuccess();
            setStep(2);
        } catch (err) {
            setError(err.detail || err.error || 'Gagal mengirim OTP. Silakan coba lagi.');
            playError();
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        playClick();
        setLoading(true);
        setError('');

        try {
            await verifyOTP(email, otp);
            playSuccess();
            setStep(3);
            setMessage('OTP berhasil diverifikasi. Silakan masukkan password baru.');
        } catch (err) {
            setError(err.detail || err.error || 'OTP tidak valid atau kedaluwarsa.');
            playError();
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        playClick();

        if (formData.new_password !== formData.confirm_password) {
            setError('Konfirmasi password tidak cocok.');
            playError();
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPasswordOTP({
                email,
                otp,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            });
            setMessage('Password berhasil diperbarui! Mengalihkan ke halaman login...');
            playSuccess();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.detail || err.error || 'Gagal mereset password.');
            playError();
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Left Panel - Form */}
            <section className="flex flex-1 items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-14">
                <div className="w-full max-w-[420px]">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-12">
                        <img
                            src="/images/logo-logict.png"
                            alt="LogiCT"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
                        />
                        <div className="text-[#1284FD] font-extrabold text-2xl sm:text-3xl">LogiCT</div>
                    </div>

                    {/* Step Title */}
                    <h1 className="text-2xl sm:text-[32px] font-extrabold leading-tight mb-2 text-slate-900">
                        {step === 1 && "Lupa Kata Sandi?"}
                        {step === 2 && "Verifikasi OTP"}
                        {step === 3 && "Atur Password Baru"}
                    </h1>
                    <p className="text-slate-500 mb-8 text-sm">
                        {step === 1 && "Masukkan email Anda untuk menerima kode OTP."}
                        {step === 2 && `Masukkan 6 digit kode yang dikirim ke ${email}.`}
                        {step === 3 && "Silakan buat password baru yang kuat untuk akun Anda."}
                    </p>

                    {/* Status Messages */}
                    {message && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Email Form */}
                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit}>
                            <div className="mb-6 relative">
                                <input
                                    type="email"
                                    placeholder="Masukkan alamat email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => playFocus()}
                                    required
                                    className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                                />
                                <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                    E-mail
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-transparent transition-all duration-200 hover:bg-white hover:text-[#1284FD] hover:border-[#1284FD] active:bg-black active:text-white active:border-black disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                            >
                                {loading ? 'Mengirim...' : 'Kirim OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Form */}
                    {step === 2 && (
                        <form onSubmit={handleOTPSubmit}>
                            <div className="mb-6 relative">
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    onFocus={() => playFocus()}
                                    required
                                    className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-[14px] text-center text-lg font-bold tracking-[1em] outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                                />
                                <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                    Kode OTP
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-transparent transition-all duration-200 hover:bg-white hover:text-[#1284FD] hover:border-[#1284FD] active:bg-black active:text-white active:border-black disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            >
                                {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                            </button>

                            <button
                                type="button"
                                onClick={handleEmailSubmit}
                                disabled={loading}
                                className="w-full text-sm text-[#1284FD] font-semibold hover:underline mb-6"
                            >
                                Kirim ulang kode
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password Form */}
                    {step === 3 && (
                        <form onSubmit={handleResetSubmit}>
                            <div className="mb-6 relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="new_password"
                                    placeholder="Password baru"
                                    value={formData.new_password}
                                    onChange={handleFormChange}
                                    onFocus={() => playFocus()}
                                    required
                                    className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                                />
                                <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                    Password Baru
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

                            <div className="mb-6 relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    placeholder="Konfirmasi password"
                                    value={formData.confirm_password}
                                    onChange={handleFormChange}
                                    onFocus={() => playFocus()}
                                    required
                                    className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                                />
                                <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                    Konfirmasi Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-transparent transition-all duration-200 hover:bg-white hover:text-[#1284FD] hover:border-[#1284FD] active:bg-black active:text-white active:border-black disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                            >
                                {loading ? 'Memproses...' : 'Perbarui Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to Login Link */}
                    <div className="text-center">
                        <Link
                            to="/"
                            onClick={() => playClick()}
                            className="inline-flex items-center gap-2 text-sm text-slate-600 font-semibold hover:text-[#1284FD] transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Right Panel - Illustration */}
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
