/**
 * AnimeEffects.jsx
 * ─────────────────────────────────────────────────────────────────
 * Reusable anime-style UI effects engine for Ludo Flux.
 * Includes: speed lines, screen flash, impact text, floating text,
 *           shockwave rings, and capture overlay.
 * All built with CSS transforms/opacity only — GPU-accelerated.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ── Inject shared anime keyframes once ─────────────────────────── */
let _kf = false;
const injectAnimeKF = () => {
  if (_kf) return; _kf = true;
  const s = document.createElement('style');
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

    @keyframes animeFlash    { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
    @keyframes animeSpeedLine{ 0%{transform:scaleX(0) translateX(0);opacity:1} 100%{transform:scaleX(1) translateX(var(--tx,0));opacity:0} }
    @keyframes animeShockwave{ 0%{transform:scale(0);opacity:.8} 100%{transform:scale(3);opacity:0} }
    @keyframes animeDustPuff  { 0%{transform:scale(0) translateY(0);opacity:.7} 100%{transform:scale(1.5) translateY(-20px);opacity:0} }
    @keyframes animeTextSlam  { 0%{transform:scale(0) rotate(-5deg);opacity:0} 60%{transform:scale(1.4) rotate(3deg);opacity:1} 80%{transform:scale(.95) rotate(-1deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
    @keyframes animeTextFloat { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-80px);opacity:0} }
    @keyframes animeShakeX    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
    @keyframes animePowerUp   { 0%{transform:scale(1);opacity:0} 30%{opacity:1} 60%{transform:scale(3)} 100%{transform:scale(4);opacity:0} }
    @keyframes animeEnergyLine{ 0%{transform:scaleY(0) translateY(0);opacity:1} 100%{transform:scaleY(1) translateY(-40px);opacity:0} }
    @keyframes animeCaptureKanji{ 0%{transform:scale(0) rotate(-10deg);opacity:0} 40%{transform:scale(1.6) rotate(5deg);opacity:1} 70%{transform:scale(1.2) rotate(-2deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:0} }
    @keyframes animeAftimage  { 0%{opacity:.6;filter:blur(0)} 100%{opacity:0;filter:blur(3px)} }
    @keyframes animeFireAura  { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.15);opacity:1} }
    @keyframes animeGoldenBurst{ 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(4) rotate(45deg);opacity:0} }
    @keyframes animeEmergeFlame{ 0%{transform:translateY(20px) scale(0);opacity:0} 60%{transform:translateY(-5px) scale(1.1);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }
    @keyframes animeChargeShake{ 0%,100%{transform:translateX(0) translateY(0)} 25%{transform:translateX(-2px) translateY(-1px)} 75%{transform:translateX(2px) translateY(1px)} }
    @keyframes animeOrbit      { from{transform:rotate(var(--a,0deg)) translateX(var(--r,20px)) rotate(calc(-1*var(--a,0deg)))} to{transform:rotate(calc(var(--a,0deg)+360deg)) translateX(var(--r,20px)) rotate(calc(-1*(var(--a,0deg)+360deg)))} }
    @media (prefers-reduced-motion: reduce) {
      [class*="anime-"] { animation: none !important; transition: none !important; }
    }
  `;
  document.head.appendChild(s);
};

/* ────────────────────────────────────────────────────────────────── */
/*  SCREEN FLASH                                                      */
/* ────────────────────────────────────────────────────────────────── */
export const ScreenFlash = ({ color = '#FFFFFF', duration = 200, onDone }) => {
  injectAnimeKF();
  useEffect(() => { const t = setTimeout(() => onDone?.(), duration + 50); return () => clearTimeout(t); }, [duration, onDone]);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:color, pointerEvents:'none', animation:`animeFlash ${duration}ms ease-out forwards` }} />
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  SPEED LINES (radiate from center point)                           */
/* ────────────────────────────────────────────────────────────────── */
export const SpeedLines = ({ cx = '50%', cy = '50%', count = 12, duration = 300, color = 'rgba(255,200,0,0.6)', onDone }) => {
  injectAnimeKF();
  useEffect(() => { const t = setTimeout(() => onDone?.(), duration + 50); return () => clearTimeout(t); }, [duration, onDone]);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9998, pointerEvents:'none', overflow:'hidden' }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const len = 120 + Math.random() * 200;
        return (
          <div key={i} style={{
            position:'absolute', top:cy, left:cx,
            width:len, height:2,
            background:`linear-gradient(to right,${color},transparent)`,
            transformOrigin:'0 50%',
            transform:`rotate(${angle}deg)`,
            '--tx':`${len}px`,
            animation:`animeSpeedLine ${duration}ms ${i * 10}ms ease-out forwards`,
          }} />
        );
      })}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  SHOCKWAVE RING                                                    */
/* ────────────────────────────────────────────────────────────────── */
export const ShockwaveRing = ({ cx = '50%', cy = '50%', color = '#FFD700', size = 60, onDone }) => {
  injectAnimeKF();
  useEffect(() => { const t = setTimeout(() => onDone?.(), 700); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', top:cy, left:cx, transform:'translate(-50%,-50%)', zIndex:9997, pointerEvents:'none' }}>
      <div style={{ width:size, height:size, borderRadius:'50%', border:`3px solid ${color}`, animation:'animeShockwave 600ms ease-out forwards' }} />
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  IMPACT TEXT (slam-in kanji/word)                                  */
/* ────────────────────────────────────────────────────────────────── */
export const ImpactText = ({ text, x = '50%', y = '50%', color = '#FFD700', shadowColor = '#FF4500', size = 48, duration = 1200, onDone }) => {
  injectAnimeKF();
  useEffect(() => { const t = setTimeout(() => onDone?.(), duration); return () => clearTimeout(t); }, [duration, onDone]);
  return (
    <div style={{
      position:'fixed', left:x, top:y, transform:'translate(-50%,-50%)',
      zIndex:9998, pointerEvents:'none',
      fontFamily:"'Orbitron','Impact',sans-serif", fontWeight:900,
      fontSize:size, color,
      WebkitTextStroke:`3px #000`,
      textShadow:`0 0 20px ${shadowColor}, 0 0 40px ${shadowColor}`,
      animation:'animeTextSlam 300ms cubic-bezier(0.34,1.56,0.64,1) forwards',
      whiteSpace:'nowrap',
    }}>{text}</div>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  FLOATING COIN/DAMAGE TEXT                                         */
/* ────────────────────────────────────────────────────────────────── */
export const FloatingText = ({ text, x, y, color = '#FFD700', onDone }) => {
  injectAnimeKF();
  useEffect(() => { const t = setTimeout(() => onDone?.(), 1000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:'fixed', left:x, top:y, zIndex:9998, pointerEvents:'none',
      fontFamily:"'Orbitron','Quicksand',sans-serif", fontWeight:900,
      fontSize:20, color,
      textShadow:`0 2px 8px ${color}88`,
      animation:'animeTextFloat 1000ms ease-out forwards',
      whiteSpace:'nowrap',
    }}>{text}</div>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  CAPTURE OVERLAY (full dramatic sequence)                          */
/* ────────────────────────────────────────────────────────────────── */
export const CaptureOverlay = ({ attackerColor = '#FF4500', onDone }) => {
  injectAnimeKF();
  useEffect(() => { const t = setTimeout(() => onDone?.(), 1600); return () => clearTimeout(t); }, [onDone]);
  return (
    <>
      {/* Dark battle overlay */}
      <div style={{ position:'fixed', inset:0, zIndex:9990, background:'rgba(0,0,0,0.55)', pointerEvents:'none', animation:'animeFlash 1600ms ease-in-out forwards' }} />
      {/* Impact kanji */}
      <div style={{
        position:'fixed', top:'40%', left:'50%', transform:'translate(-50%,-50%)',
        zIndex:9998, pointerEvents:'none',
        fontFamily:"'Orbitron','Impact',sans-serif", fontWeight:900,
        fontSize:72, color:'#FF2200',
        WebkitTextStroke:'4px #000',
        textShadow:'0 0 30px #FF4500, 0 0 60px #FF2200',
        animation:'animeCaptureKanji 1200ms cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>斬!</div>
      {/* Speed lines */}
      <SpeedLines cx="50%" cy="40%" count={16} duration={400} color="rgba(255,100,0,0.7)" />
    </>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  DICE ROLL EFFECTS                                                 */
/* ────────────────────────────────────────────────────────────────── */
export const DiceRollFlash = ({ value, onDone }) => {
  injectAnimeKF();
  const [phase, setPhase] = useState('flash'); // flash | lines | text

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('lines'), 100);
    const t2 = setTimeout(() => setPhase('text'), 250);
    const t3 = setTimeout(() => onDone?.(), value === 6 ? 2000 : 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [value, onDone]);

  if (value === 6) return (
    <>
      <ScreenFlash color="rgba(255,215,0,0.7)" duration={200} />
      <SpeedLines cx="50%" cy="50%" count={20} duration={500} color="rgba(255,215,0,0.8)" />
      <ImpactText text="6!! 🔥" x="50%" y="50%" color="#FFD700" shadowColor="#FF8C00" size={64} duration={1800} />
    </>
  );

  if (value === 1) return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:9997, background:'rgba(40,40,40,0.3)', pointerEvents:'none', animation:'animeFlash 500ms ease-out forwards' }} />
    </>
  );

  return phase === 'flash' ? (
    <ScreenFlash color="rgba(255,180,0,0.25)" duration={150} />
  ) : null;
};

/* ────────────────────────────────────────────────────────────────── */
/*  WIN SCREEN ELEMENTS                                               */
/* ────────────────────────────────────────────────────────────────── */
export const WinFireworks = ({ color = '#FFD700' }) => {
  injectAnimeKF();
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9985, pointerEvents:'none', overflow:'hidden' }}>
      {Array.from({length:20}).map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          bottom:0, left:`${5+i*4.8}%`,
          width:4, height:4, borderRadius:'50%',
          background:`hsl(${i*18},100%,60%)`,
          animation:`animeGoldenBurst ${1+Math.random()}s ${Math.random()*2}s infinite ease-out`,
        }} />
      ))}
      {/* Golden flame columns */}
      {[10,30,50,70,90].map((x,i) => (
        <div key={i} style={{
          position:'absolute', bottom:0, left:`${x}%`,
          width:40, height:'60%',
          background:`linear-gradient(to top,${color},rgba(255,100,0,.4),transparent)`,
          filter:'blur(12px)',
          animation:`animePowerUp ${2+i*.3}s ${i*.2}s infinite ease-out`,
          opacity:.6,
        }} />
      ))}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  IDLE FLAME AURA (around pieces)                                   */
/* ────────────────────────────────────────────────────────────────── */
export const FlameAura = ({ color = '#FF4500', size = 40, active = true }) => {
  injectAnimeKF();
  if (!active) return null;
  return (
    <div style={{
      position:'absolute', inset:-(size * 0.3), borderRadius:'50%',
      background:`radial-gradient(circle,${color}44 20%,transparent 70%)`,
      animation:'animeFireAura 1s infinite ease-in-out',
      pointerEvents:'none', zIndex:1,
    }} />
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  SELECTED PIECE POWER-UP AURA                                      */
/* ────────────────────────────────────────────────────────────────── */
export const PowerUpAura = ({ color = '#FF4500' }) => {
  injectAnimeKF();
  return (
    <>
      {/* Energy lines shooting upward */}
      {[0,60,120,180,240,300].map((angle, i) => (
        <div key={i} style={{
          position:'absolute', bottom:'50%', left:'50%',
          width:2, height:30,
          background:`linear-gradient(to top,${color},transparent)`,
          transformOrigin:'bottom center',
          transform:`rotate(${angle}deg)`,
          animation:`animeEnergyLine .8s ${i*.1}s infinite ease-out`,
          pointerEvents:'none',
        }} />
      ))}
      {/* Outer glow ring */}
      <div style={{
        position:'absolute', inset:-8, borderRadius:'50%',
        border:`2px solid ${color}`,
        boxShadow:`0 0 20px ${color}, inset 0 0 10px ${color}44`,
        animation:'animeFireAura .5s infinite ease-in-out',
        pointerEvents:'none',
      }} />
    </>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/*  HOOK: useAnimeEffects — manages queued effects                    */
/* ────────────────────────────────────────────────────────────────── */
export const useAnimeEffects = () => {
  const [effects, setEffects] = useState([]);
  const idRef = useRef(0);

  const trigger = useCallback((type, props = {}) => {
    const id = ++idRef.current;
    setEffects(prev => [...prev, { id, type, props }]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  }, []);

  const EffectsLayer = useCallback(() => (
    <>
      {effects.map(({ id, type, props }) => {
        const done = () => dismiss(id);
        switch (type) {
          case 'flash':    return <ScreenFlash key={id} onDone={done} {...props} />;
          case 'speed':    return <SpeedLines  key={id} onDone={done} {...props} />;
          case 'shock':    return <ShockwaveRing key={id} onDone={done} {...props} />;
          case 'impact':   return <ImpactText  key={id} onDone={done} {...props} />;
          case 'float':    return <FloatingText key={id} onDone={done} {...props} />;
          case 'capture':  return <CaptureOverlay key={id} onDone={done} {...props} />;
          case 'diceroll': return <DiceRollFlash key={id} onDone={done} {...props} />;
          default:         return null;
        }
      })}
    </>
  ), [effects, dismiss]);

  return { trigger, dismiss, EffectsLayer };
};
