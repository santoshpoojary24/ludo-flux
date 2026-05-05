// Sound Engine v2 — expanded with capture, win fanfare, tick, and notification sounds

const audioCtxPool = [];

export const getCtx = () => {
    try {
        if (!window.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioCtx = new AudioContext();
        }
        if (window.audioCtx.state === 'suspended') {
            window.audioCtx.resume();
        }
        return window.audioCtx;
    } catch {
        return null;
    }
};

let bgmAudio = null;

export const setBGM = (enabled, volume) => {
    if (!enabled) {
        if (bgmAudio) {
            // Fade out
            let vol = bgmAudio.volume;
            const fadeOut = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    bgmAudio.volume = vol;
                } else {
                    clearInterval(fadeOut);
                    bgmAudio.pause();
                    bgmAudio.currentTime = 0;
                    bgmAudio = null;
                }
            }, 100);
        }
        return;
    }

    if (bgmAudio) {
        bgmAudio.volume = volume / 100;
        return;
    }

    bgmAudio = new Audio('/song.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = volume / 100;
    
    // Play with a promise catch to handle browser auto-play policies
    bgmAudio.play().catch((e) => {
        console.warn('Audio auto-play prevented by browser', e);
        // Will try playing on next user interaction
        const tryPlay = () => {
            if (bgmAudio) {
                bgmAudio.play().catch(() => {});
                document.removeEventListener('click', tryPlay);
            }
        };
        document.addEventListener('click', tryPlay);
    });
};

export const playSound = (type) => {
    const ctx = getCtx();
    if (!ctx) return;

    let masterVolume = 100;
    try {
        const raw = localStorage.getItem('ludo_flux_settings');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.masterVolume !== undefined) masterVolume = parsed.masterVolume;
        }
    } catch {}

    const now = ctx.currentTime;
    const sfxMaster = ctx.createGain();
    sfxMaster.gain.value = masterVolume / 100;
    sfxMaster.connect(ctx.destination);

    try {
        switch (type) {
            case 'pop': {
                // Bubbly dice roll
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(sfxMaster);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now); osc.stop(now + 0.2);
                break;
            }

            case 'clack': {
                // Crisp token placement
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(sfxMaster);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(900, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                gain.gain.setValueAtTime(0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
                break;
            }

            case 'capture': {
                // Dramatic descending sweep
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(sfxMaster);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now); osc.stop(now + 0.4);
                break;
            }

            case 'fanfare': {
                // Victory fanfare — 3-note rising arpeggio
                [523, 659, 784].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(sfxMaster);
                    osc.type = 'sine';
                    const t = now + i * 0.18;
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0, t);
                    gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
                    osc.start(t); osc.stop(t + 0.5);
                });
                break;
            }

            case 'tick': {
                // Short tick for turn timer
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(sfxMaster);
                osc.type = 'square';
                osc.frequency.setValueAtTime(1000, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
                osc.start(now); osc.stop(now + 0.04);
                break;
            }

            case 'notify': {
                // Soft chime for turn notification
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(sfxMaster);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(1100, now + 0.15);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now); osc.stop(now + 0.3);
                break;
            }

            default:
                break;
        }
    } catch (e) {
        console.warn('Audio play failed', e);
    }
};
