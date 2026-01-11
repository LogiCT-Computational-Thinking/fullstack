import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div
            className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{ backgroundImage: "url('/images/sky bg 1.png')" }}
        >
            {/* Header */}
            <header className="flex justify-between items-center px-8 py-6 md:px-16 animate-fade-down">
                <div className="flex items-center gap-2">
                    <img src="/images/logo-logict.png" alt="LogiCT Logo" className="h-8 w-auto" />
                    <span className="text-2xl font-bold text-[#1A73E8]">LogiCT</span>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/login"
                        className="px-7 py-1.5 border border-[#1A73E8] text-[#1A73E8] rounded-full font-bold text-sm hover:bg-[#1A73E8]/5 transition-colors"
                    >
                        Log in
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-8 md:px-20 lg:px-32">
                {/* Left Side: Text */}
                <div className="flex-1 max-w-2xl z-10 pt-10 lg:pt-0">
                    <div className="mb-8 select-none">
                        {/* think SMARTER */}
                        <div className="flex flex-col -mb-2 animate-fade-right" style={{ animationDelay: '0.2s' }}>
                            <span
                                className="text-4xl md:text-5xl font-normal ml-1 mb-1 bg-clip-text text-transparent bg-gradient-to-b from-[#0C88C6] to-[#005782]"
                                style={{ fontFamily: "'Graphik Web', 'Inter', sans-serif" }}
                            >
                                think
                            </span>
                            <span
                                className="text-7xl md:text-9xl lg:text-[130px] font-light leading-[0.8] bg-clip-text text-transparent bg-gradient-to-b from-[#0C88C6] to-[#005782]"
                                style={{
                                    fontFamily: "'Barmeno', 'Outfit', sans-serif",
                                    letterSpacing: '0.1em',
                                    WebkitFontSmoothing: 'antialiased'
                                }}
                            >
                                SMARTER
                            </span>
                        </div>
                        {/* fly HIGHER */}
                        <div className="flex items-start gap-4 -mt-2 animate-fade-right" style={{ animationDelay: '0.4s' }}>
                            <span
                                className="text-4xl md:text-5xl font-normal mt-2 bg-clip-text text-transparent bg-gradient-to-b from-[#0C88C6] to-[#005782]"
                                style={{ fontFamily: "'BM HANNA_TTF', 'Black Han Sans', sans-serif" }}
                            >
                                fly
                            </span>
                            <span
                                className="text-7xl md:text-9xl lg:text-[130px] font-light leading-[0.8] bg-clip-text text-transparent bg-gradient-to-b from-[#0C88C6] to-[#005782]"
                                style={{
                                    fontFamily: "'Barmeno', 'Outfit', sans-serif",
                                    letterSpacing: '0.1em',
                                    WebkitFontSmoothing: 'antialiased'
                                }}
                            >
                                HIGHER
                            </span>
                        </div>
                    </div>

                    <p className="text-lg md:text-xl text-gray-800 mb-10 max-w-md leading-relaxed animate-fade-right" style={{ animationDelay: '0.6s' }}>
                        Learn how to think, not just what to learn through Computational Thinking.
                    </p>

                    <Link
                        to="/register"
                        className="inline-block px-12 py-3.5 bg-black text-white border-2 border-black rounded-full font-bold text-lg shadow-xl hover:bg-white hover:text-black transition-all duration-300 active:scale-95 animate-pop-in"
                        style={{ animationDelay: '0.8s' }}
                    >
                        Register Now
                    </Link>
                </div>

                {/* Right Side: Bird Mascot */}
                <div className="flex-1 flex justify-center items-center relative py-12 lg:py-0 animate-fade-left" style={{ animationDelay: '0.5s' }}>
                    <img
                        src="/images/burung 1.png"
                        alt="LogiCT Bird Mascot"
                        className="w-full max-w-xl animate-float"
                    />
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Outfit:wght@400;500;600&family=Black+Han+Sans&display=swap');
                
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-30px) rotate(1deg); }
                }
                
                @keyframes fadeDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeRight {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes fadeLeft {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.9); }
                    70% { transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }

                .animate-float { animation: float 6s ease-in-out infinite; }
                
                .animate-fade-down { 
                    animation: fadeDown 0.8s ease-out forwards; 
                }
                
                .animate-fade-right { 
                    opacity: 0;
                    animation: fadeRight 0.8s ease-out forwards; 
                }
                
                .animate-fade-left { 
                    opacity: 0;
                    animation: fadeLeft 1s ease-out forwards; 
                }
                
                .animate-pop-in { 
                    opacity: 0;
                    animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
                }
            `}} />
        </div>
    );
};

export default LandingPage;
