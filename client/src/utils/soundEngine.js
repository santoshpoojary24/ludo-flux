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

let bgmNodes = [];

export const setBGM = (enabled, volume) => {
    const ctx = getCtx();
    if (!ctx) return;

    if (!enabled) {
        bgmNodes.forEach(n => {
            n.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
            setTimeout(() => { n.osc.stop(); n.osc.disconnect(); n.gain.disconnect(); }, 1100);
        });
        bgmNodes = [];
        return;
    }

    if (bgmNodes.length > 0) {
        // Just update volume
        bgmNodes.forEach(n => {
            n.gain.gain.linearRampToValueAtTime((volume / 100) * n.maxVol, ctx.currentTime + 0.5);
        });
        return;
    }

    // Start ambient generative drone
    const chords = [
        { freq: 261.63, maxVol: 0.1 }, // C4
        { freq: 329.63, maxVol: 0.08 }, // E4
        { freq: 392.00, maxVol: 0.06 }, // G4
        { freq: 523.25, maxVol: 0.04 }  // C5
    ];

    chords.forEach(c => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        // Very slow drifting LFO for volume
        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + Math.random() * 0.05; // 0.05 - 0.1 Hz
        lfoGain.gain.value = c.maxVol * 0.5;
        lfo.connect(lfoGain);
        
        // Base volume + LFO mod
        gain.gain.value = 0;
        lfoGain.connect(gain.gain);

        osc.type = 'sine';
        osc.frequency.value = c.freq;
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        lfo.start();
        
        // Fade in
        gain.gain.linearRampToValueAtTime((volume / 100) * c.maxVol, ctx.currentTime + 2);
        
        bgmNodes.push({ osc, gain, lfo, lfoGain, maxVol: c.maxVol });
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
