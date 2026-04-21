import { useEffect } from 'react';

/**
 * Custom hook to handle Escape key press
 * @param {Function} callback - Function to call when Escape is pressed
 * @param {boolean} active - Whether the listener should be active
 */
export default function useEscapeKey(callback, active = true) {
    useEffect(() => {
        if (!active) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                callback();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [callback, active]);
}
