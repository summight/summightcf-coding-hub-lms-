import { useCallback } from 'react';

// Re-usable audio context to avoid creating multiple instances
let audioContext: AudioContext | null = null;

const useNotificationSound = () => {
    const playSound = useCallback(() => {
        if (typeof window === 'undefined') return;

        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.");
                return;
            }
        }
        
        // Resume context if it was suspended by browser policies
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5 note
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume

        // Fade out quickly
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }, []);

    return playSound;
};

export default useNotificationSound;
