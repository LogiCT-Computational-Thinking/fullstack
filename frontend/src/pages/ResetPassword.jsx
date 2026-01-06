import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { playClick, playFocus, playSuccess, playError } = useSound();
    const { resetPassword } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        playClick();

        if (formData.new_password !== formData.confirm_password) {
            setError('Passwords do not match');
            playError();
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await resetPassword({
                uidb64: uid,
                token: token,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            });
            setMessage('Password has been reset successfully. Redirecting to login...');
            playSuccess();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.error || 'Failed to reset password. The link may be expired.');
            playError();
        } finally {
            setLoading(false);
        }
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

                    {/* Title */}
                    <h1 className="text-2xl sm:text-[32px] font-extrabold leading-tight mb-8 text-slate-900">
                        Set new password
                    </h1>

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

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* New Password Field */}
                        <div className="mb-6 relative">
                            <input
                                type="password"
                                name="new_password"
                                placeholder="Enter new password"
                                value={formData.new_password}
                                onChange={handleChange}
                                onFocus={() => playFocus()}
                                required
                                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                New Password
                            </label>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-6 relative">
                            <input
                                type="password"
                                name="confirm_password"
                                placeholder="Confirm new password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                onFocus={() => playFocus()}
                                required
                                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                Confirm Password
                            </label>
                        </div>

                        {/* Reset Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            onMouseEnter={() => !loading && playClick()}
                            className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-transparent transition-all duration-200 hover:bg-white hover:text-[#1284FD] hover:border-[#1284FD] active:bg-black active:text-white active:border-black disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
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
