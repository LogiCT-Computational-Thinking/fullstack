import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';

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
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { playClick, playFocus, playSuccess, playError } = useSound();
    const { forgotPassword, verifyOTP, resetPasswordOTP } = useAuth();
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    // Sync individual digits to the main otp string
    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);

    useEffect(() => {
        setOtp(otpArray.join(''));
    }, [otpArray]);

    const handleOtpChange = (index, value) => {
        // Only allow digits
        const cleanValue = value.replace(/\D/g, '').slice(-1);
        
        const newOtpArray = [...otpArray];
        newOtpArray[index] = cleanValue;
        setOtpArray(newOtpArray);

        // Move focus to next input if value is entered
        if (cleanValue && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            // Move focus to previous input on backspace if current is empty
            inputRefs[index - 1].current.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtpArray = [...otpArray];
        
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtpArray[i] = char;
        });
        
        setOtpArray(newOtpArray);
        
        // Focus the last filled input or the first empty one
        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs[focusIndex].current.focus();
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        playClick();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await forgotPassword(email);
            setError('');
            setMessage(response.message || 'OTP has been sent to your email.');
            playSuccess();
            setStep(2);
        } catch (err) {
            setMessage('');
            setError(err.detail || err.error || 'Failed to send OTP. Please try again.');
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
        setMessage('');

        try {
            await verifyOTP(email, otp);
            playSuccess();
            setStep(3);
            setError('');
            setMessage('OTP verified successfully. Please enter your new password.');
        } catch (err) {
            setMessage('');
            setError(err.detail || err.error || 'Invalid or expired OTP.');
            playError();
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        playClick();

        if (formData.new_password !== formData.confirm_password) {
            setMessage('');
            setError('Passwords do not match.');
            playError();
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await resetPasswordOTP({
                email,
                otp,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            });
            playSuccess();
            setShowSuccess(true);
        } catch (err) {
            setMessage('');
            setError(err.detail || err.error || 'Failed to reset password.');
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
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "Reset Password"}
                    </h1>
                    <p className="text-slate-500 mb-8 text-sm">
                        {step === 1 && "Enter your email address to receive an OTP code."}
                        {step === 2 && `Enter the 6-digit code sent to ${email}.`}
                        {step === 3 && "Create a strong new password for your account."}
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
                                    placeholder="Enter your email address"
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
                                className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-[#1284FD] transition-colors duration-150 hover:bg-white hover:text-[#1284FD] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Form */}
                    {step === 2 && (
                        <form onSubmit={handleOTPSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-[#1284FD] mb-4">
                                    OTP Code
                                </label>
                                <div className="flex justify-between gap-2 sm:gap-3">
                                    {otpArray.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={inputRefs[index]}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            onFocus={() => playFocus()}
                                            required
                                            className="w-full h-12 sm:h-14 bg-white border border-gray-300 rounded-[12px] text-center text-xl font-bold outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)]"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-[#1284FD] transition-colors duration-150 hover:bg-white hover:text-[#1284FD] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                type="button"
                                onClick={handleEmailSubmit}
                                disabled={loading}
                                className="w-full text-sm text-[#1284FD] font-semibold hover:underline mb-6"
                            >
                                Resend code
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
                                    placeholder="New password"
                                    value={formData.new_password}
                                    onChange={handleFormChange}
                                    onFocus={() => playFocus()}
                                    required
                                    className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                                />
                                <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                    New Password
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
                                    placeholder="Confirm password"
                                    value={formData.confirm_password}
                                    onChange={handleFormChange}
                                    onFocus={() => playFocus()}
                                    required
                                    className="w-full px-4 py-3 sm:py-3.5 pr-12 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
                                />
                                <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                                    Confirm Password
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
                                className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-[#1284FD] transition-colors duration-150 hover:bg-white hover:text-[#1284FD] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                            >
                                {loading ? 'Processing...' : 'Update Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to Login Link */}
                    <div className="text-center">
                        <Link
                            to="/login"
                            onClick={() => playClick()}
                            className="inline-flex items-center gap-2 text-sm text-slate-600 font-semibold hover:text-[#1284FD] transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Login
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

            {/* Success Modal */}
            <SuccessModal
                show={showSuccess}
                onClose={() => navigate('/login')}
                title="Password Successfully Updated"
                message="Your password has been successfully updated. You can now log in using your new password."
                buttonText="Back to login"
                onButtonClick={() => navigate('/login')}
            />
        </div>
    );
}
