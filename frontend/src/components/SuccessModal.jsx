import { useEffect } from 'react';
import useEscapeKey from '../hooks/useEscapeKey';

export default function SuccessModal({ show, onClose, title, message, buttonText, onButtonClick }) {
  useEffect(() => {
    if (show) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Use escape key to close
  useEscapeKey(onClose, show);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-md w-full p-8 sm:p-12 animate-scaleIn border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-all duration-200 hover:rotate-90"
          aria-label="Close"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            {/* Soft pulse effect */}
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping-slow" />
            
            {/* Main success icon container */}
            <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
              <svg 
                className="w-14 h-14 text-white animate-checkmark" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={4.5} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-[28px] sm:text-[32px] font-black text-gray-900 leading-tight">
            {title || 'Success!'}
          </h2>
          <p className="text-gray-500 text-base sm:text-lg font-medium leading-relaxed max-w-[280px] mx-auto">
            {message || 'Your action was completed successfully.'}
          </p>
        </div>

        {/* CTA Button */}
        {buttonText && (
          <button
            onClick={onButtonClick || onClose}
            className="w-full py-4 px-6 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200"
          >
            {buttonText}
          </button>
        )}

        {/* Auto-close progress bar (only if no button) */}
        {!buttonText && (
          <div className="mt-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-progress" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            transform: scale(0.95);
            opacity: 0; 
          }
          to { 
            transform: scale(1);
            opacity: 1; 
          }
        }

        @keyframes checkmark {
          0% {
            stroke-dasharray: 0 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100 100;
            stroke-dashoffset: 0;
          }
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          70%, 100% { transform: scale(1.6); opacity: 0; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-checkmark {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.6s 0.2s ease-out forwards;
        }

        .animate-progress {
          width: 0;
          animation: progress 2s linear forwards;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
