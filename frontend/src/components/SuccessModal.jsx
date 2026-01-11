import { useEffect } from 'react';

export default function SuccessModal({ show, onClose, title, message }) {
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-12 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Animated circle background */}
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />

            {/* Main success icon */}
            <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-20 h-20 text-white animate-checkmark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-3">
          {title || 'Success!'}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 text-lg">
          {message || 'Your action was completed successfully.'}
        </p>

        {/* Optional: Auto-close indicator */}
        <div className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 animate-progress" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
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
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-checkmark {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.6s 0.3s ease-out forwards;
        }

        .animate-progress {
          width: 0;
          animation: progress 2s linear forwards;
        }
      `}</style>
    </div>
  );
}
