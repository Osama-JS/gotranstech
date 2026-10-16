/**
 * GoTransTech Notification Sound Service
 * Powered by Web Audio API - Zero latency, zero external assets, no 404s.
 */

class NotificationSoundService {
    constructor() {
        this.audioCtx = null;
        this.mutedKey = 'gotranstech_notification_sound_muted';
    }

    getAudioContext() {
        if (typeof window === 'undefined') return null;
        if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.audioCtx = new AudioCtx();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    isMuted() {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(this.mutedKey) === 'true';
    }

    setMuted(muted) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.mutedKey, muted ? 'true' : 'false');
    }

    toggleMuted() {
        const nextState = !this.isMuted();
        this.setMuted(nextState);
        return nextState;
    }

    /**
     * Play standard luxury notification chime (Two-tone crystal chime)
     */
    playChime() {
        if (this.isMuted()) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;

            // First note: 880Hz (A5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, now);
            gain1.gain.setValueAtTime(0.001, now);
            gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.35);

            // Second note: 1320Hz (E6) - Harmonious high bell
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1320, now + 0.1);
            gain2.gain.setValueAtTime(0.001, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.14);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.65);
        } catch (e) {
            console.debug('Audio playback throttled or blocked:', e);
        }
    }

    /**
     * Play urgent high-priority siren alert (Triple warning pulse)
     */
    playUrgentAlert() {
        if (this.isMuted()) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;

            // 3 alternating warning beeps (880Hz & 1174Hz)
            const pulses = [
                { time: now, freq: 880, duration: 0.18 },
                { time: now + 0.22, freq: 1174.66, duration: 0.18 },
                { time: now + 0.44, freq: 880, duration: 0.18 },
                { time: now + 0.66, freq: 1318.5, duration: 0.28 },
            ];

            pulses.forEach((pulse) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(pulse.freq, pulse.time);

                gain.gain.setValueAtTime(0.001, pulse.time);
                gain.gain.linearRampToValueAtTime(0.28, pulse.time + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, pulse.time + pulse.duration);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(pulse.time);
                osc.stop(pulse.time + pulse.duration);
            });
        } catch (e) {
            console.debug('Urgent audio playback error:', e);
        }
    }
}

export const notificationSound = new NotificationSoundService();
export default notificationSound;
