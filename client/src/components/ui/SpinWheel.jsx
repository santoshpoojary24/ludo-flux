import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { playSound } from '../../utils/soundEngine';

const prizes = [100, 50, 500, 10, 250, 20];
const spinDuration = 3;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const SpinWheel = ({ onClose, onReward }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const controls = useAnimation();
    
    // Cooldown logic
    const [lastSpinTime, setLastSpinTime] = useState(() => parseInt(localStorage.getItem('ludo_last_spin')) || 0);
    const [timeLeft, setTimeLeft] = useState('');
    const canSpin = !lastSpinTime || (Date.now() - lastSpinTime >= COOLDOWN_MS);

    useEffect(() => {
        if (canSpin) return;
        const interval = setInterval(() => {
            const remaining = COOLDOWN_MS - (Date.now() - lastSpinTime);
            if (remaining <= 0) {
                setLastSpinTime(0);
                setTimeLeft('');
            } else {
                const h = Math.floor(remaining / 3600000).toString().padStart(2, '0');
                const m = Math.floor((remaining % 3600000) / 60000).toString().padStart(2, '0');
                const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lastSpinTime, canSpin]);

    const handleSpin = async () => {
        if (isSpinning || !canSpin) return;
        setIsSpinning(true);
        
        playSound('clack'); // initial spin sound
        
        const segment = Math.floor(Math.random() * prizes.length);
        const prize = prizes[segment];
        
        const segmentAngle = 360 / prizes.length;
        // Subtract half a segment so the pointer lands exactly in the middle of the slice
        const targetAngle = 1800 - (segment * segmentAngle) - (segmentAngle / 2);

        await controls.start({
            rotate: targetAngle,
            transition: { duration: spinDuration, ease: [0.1, 0.9, 0.2, 1] }
        });

        playSound('fanfare'); // win sound

        setTimeout(() => {
            onReward(prize);
            const now = Date.now();
            setLastSpinTime(now);
            localStorage.setItem('ludo_last_spin', now.toString());
            setIsSpinning(false);
        }, 500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}
        >
            <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ background: 'var(--surface)', width: '100%', maxWidth: 360, borderRadius: 48, padding: 32, boxShadow: 'var(--shadow-out)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, position: 'relative' }}
            >
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: 'none', boxShadow: 'var(--shadow-out)', color: 'var(--text-muted)', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}
                >✕</button>
                
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font)' }}>DAILY SPIN</h2>
                
                <div style={{ position: 'relative', width: 240, height: 240 }}>
                    {/* Pointer */}
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '28px solid var(--text)', zIndex: 20, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))' }}></div>
                    
                    {/* Wheel */}
                    <motion.div 
                        animate={controls}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: 'inset 0 0 0 8px var(--surface2), 0 8px 24px rgba(0,0,0,0.2)', position: 'relative', background: `conic-gradient(var(--token-red) 0deg 60deg, var(--token-blue) 60deg 120deg, var(--token-yellow) 120deg 180deg, var(--token-green) 180deg 240deg, #c084fc 240deg 300deg, #fb923c 300deg 360deg)` }}
                    >
                        {prizes.map((prize, i) => {
                            const angle = (i * 60) + 30;
                            return (
                                <div 
                                    key={i}
                                    style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', paddingTop: 20, fontWeight: 900, color: '#fff', fontSize: 22, textShadow: '0 2px 4px rgba(0,0,0,0.5)', transform: `rotate(${angle}deg)`, fontFamily: 'var(--font)' }}
                                >
                                    {prize}
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
                
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button 
                        onClick={handleSpin} 
                        disabled={isSpinning || !canSpin}
                        style={{ width: '100%', padding: '16px', borderRadius: 40, border: 'none', background: isSpinning || !canSpin ? 'var(--surface2)' : 'var(--accent)', color: isSpinning || !canSpin ? 'var(--text-muted)' : '#fff', fontWeight: 900, fontSize: 18, letterSpacing: 2, cursor: isSpinning || !canSpin ? 'not-allowed' : 'pointer', boxShadow: isSpinning || !canSpin ? 'none' : '0 8px 24px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3)', transition: 'all 0.2s', fontFamily: 'var(--font)' }}
                    >
                        {!canSpin ? "TODAY's SPIN DONE" : isSpinning ? 'SPINNING...' : 'SPIN NOW'}
                    </button>
                    {!canSpin && timeLeft && (
                        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 1, fontFamily: 'var(--font)' }}>
                            OPENS IN {timeLeft}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SpinWheel;
