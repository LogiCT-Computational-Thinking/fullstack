import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook untuk efek suara
 * Menggunakan Web Audio API untuk generate suara sederhana
 * OPTIMIZED: Reduced lag by proper cleanup and error handling
 */
export const useSound = () => {
    const audioContextRef = useRef(null);
    const isEnabledRef = useRef(true);

    // Initialize AudioContext with error handling
    const getAudioContext = useCallback(() => {
        if (!isEnabledRef.current) return null;

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Resume context if suspended (browser policy)
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            return audioContextRef.current;
        } catch (error) {
            console.warn('Audio context not available:', error);
            isEnabledRef.current = false;
            return null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Click sound - subtle tap
    const playClick = useCallback(() => {
        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.08);

            // Cleanup
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (error) {
            // Silently fail to prevent UI blocking
        }
    }, [getAudioContext]);

    // Hover sound - very subtle (DISABLED for performance)
    const playHover = useCallback(() => {
        // Disabled to reduce performance impact
        return;
    }, []);

    // Success sound - pleasant tone
    const playSuccess = useCallback(() => {
        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            // First note
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.frequency.value = 523.25; // C5
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0.2, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.15);

            // Second note
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.value = 659.25; // E5
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc2.start(ctx.currentTime + 0.08);
            osc2.stop(ctx.currentTime + 0.25);

            // Cleanup
            osc1.onended = () => {
                osc1.disconnect();
                gain1.disconnect();
            };
            osc2.onended = () => {
                osc2.disconnect();
                gain2.disconnect();
            };
        } catch (error) {
            // Silently fail
        }
    }, [getAudioContext]);

    // Error sound - descending tone
    const playError = useCallback(() => {
        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(400, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
            oscillator.type = 'sawtooth';

            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);

            // Cleanup
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (error) {
            // Silently fail
        }
    }, [getAudioContext]);

    // Input focus sound - DISABLED for performance
    const playFocus = useCallback(() => {
        // Disabled to reduce CPU usage and lag
        return;
    }, []);

    return {
        playClick,
        playHover,
        playSuccess,
        playError,
        playFocus,
    };
};
