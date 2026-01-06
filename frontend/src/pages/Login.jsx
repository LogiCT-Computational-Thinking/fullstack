import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../hooks/useSound';


export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const { playClick, playSuccess, playError, playFocus } = useSound();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick(); // Play click sound
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      playSuccess(); // Play success sound
      navigate('/quiz');
    } catch (err) {
      playError(); // Play error sound
      setError(err.error || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    playClick(); // Play click sound
    setError('');
    setLoading(true);

    try {
      await googleLogin(credentialResponse.credential, 'student');
      playSuccess(); // Play success sound
      navigate('/quiz');
    } catch (err) {
      playError(); // Play error sound
      console.error('Google login error - Full error:', err);
      console.error('Google login error - Error message:', err.error);
      console.error('Google login error - Error detail:', err.detail);

      // Show detailed error message
      const errorMessage = err.error || err.detail || err.message || 'Google login failed. Please try again.';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
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

          {/* Title */}
          <h1 className="text-2xl sm:text-[32px] font-extrabold leading-tight mb-6 sm:mb-7 text-slate-900">
            Welcome to LogiCT
          </h1>

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
                onFocus={() => playFocus()}
                required
                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
              />
              <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                Email
              </label>
            </div>

            {/* Password Field */}
            <div className="mb-2.5 relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-[14px] text-sm outline-none transition-all focus:border-[#1284FD] focus:shadow-[0_0_0_4px_rgba(18,132,253,0.1)] peer"
              />
              <label className="absolute left-3 -top-2.5 bg-white px-1.5 text-sm font-bold text-[#1284FD] pointer-events-none">
                Password
              </label>
            </div>

            {/* Remember Me & Forgot Password */}
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
              <a
                href="#"
                className="text-xs text-slate-500 hover:underline"
              >
                Lupa Kata Sandi?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => !loading && playClick()}
              className="w-full py-3 sm:py-3.5 px-4 bg-[#1284FD] text-white font-bold text-base rounded-[10px] border-2 border-transparent transition-all duration-200 hover:bg-white hover:text-[#1284FD] hover:border-[#1284FD] active:bg-black active:text-white active:border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-500">atau</span>
              </div>
            </div>

            {/* Google Sign In Button */}
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

            {/* Register Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-500 font-bold hover:underline">
                Daftar
              </Link>
            </div>
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
