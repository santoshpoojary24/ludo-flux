import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Pip positions (0–8 in 3×3 grid) ──────────────────────────── */
const DOTS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const FACE_ROT = {
  1: { x: 0,    y: 0   },
  2: { x: 0,    y: -90 },
  3: { x: -90,  y: 0   },
  4: { x: 90,   y: 0   },
  5: { x: 0,    y: 90  },
  6: { x: 0,    y: 180 },
};

const TUMBLE = [
  { x: 90,  y: 45  }, { x: 180, y: 90  }, { x: 270, y: 135 },
  { x: 45,  y: 180 }, { x: 135, y: 270 }, { x: 225, y: 45  },
  { x: 315, y: 90  }, { x: 90,  y: 315 }, { x: 180, y: 180 },
  { x: 270, y: 270 }, { x: 360, y: 90  }, { x: 450, y: 360 },
];

const SIZE = 72;
const HALF = SIZE / 2;

/* ─── Six sparkle stars (CSS-only, 6 elements max) ─────────────── */
const SixSparkle = () => (
  <div style={{ position: 'absolute', inset: -32, pointerEvents: 'none', zIndex: 10 }}>
    {Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * 360;
      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale:   [0, 1.2, 0],
            x: Math.cos((angle * Math.PI) / 180) * 48,
            y: Math.sin((angle * Math.PI) / 180) * 48,
          }}
          transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 10, height: 10,
            marginTop: -5, marginLeft: -5,
            clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
            background: 'linear-gradient(135deg,#FFD700,#FFF)',
            filter: 'drop-shadow(0 0 4px #FFD700)',
          }}
        />
      );
    })}
  </div>
);

/* ─── Single face ───────────────────────────────────────────────── */
const Face = ({ n, transform, redFlash }) => {
  const isSix  = n === 6;
  const dots   = DOTS[n] || [];
  const faceBase = isSix
    ? 'linear-gradient(145deg,#fff8e1,#ffe082 50%,#ffd54f)'
    : redFlash
    ? 'linear-gradient(145deg,#ffeeee,#ffc0c0)'
    : 'linear-gradient(145deg,#FFFFF8,#EDE8D8)';

  return (
    <div style={{
      position: 'absolute', width: SIZE, height: SIZE,
      borderRadius: SIZE * 0.14,
      background: faceBase,
      border: isSix ? '1.5px solid rgba(255,200,0,0.6)' : '1px solid rgba(0,0,0,0.12)',
      boxShadow: isSix
        ? 'inset 0 2px 5px rgba(255,255,255,0.9), inset 0 -2px 5px rgba(160,100,0,0.25)'
        : 'inset 0 2px 5px rgba(255,255,255,0.95), inset 0 -2px 5px rgba(0,0,0,0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)',
      padding: SIZE * 0.14, gap: 4,
      transform, backfaceVisibility: 'hidden',
    }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dots.includes(i) && (
            <div style={{
              width: '75%', height: '75%', borderRadius: '50%',
              background: isSix
                ? 'radial-gradient(circle at 35% 30%,#c47a00,#5c3200)'
                : 'radial-gradient(circle at 35% 30%,#3d3020,#1a1208)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5),0 1px 1px rgba(255,255,255,0.15)',
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

const lblStyle = (color) => ({
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
  textTransform: 'uppercase', color,
  fontFamily: "'Quicksand', sans-serif",
});

/* ─── Main Dice Component ───────────────────────────────────────── */
const Dice = ({ value, isRolling, canRoll, onRoll, playerColor = '#FFD700' }) => {
  const [rotX, setRotX]           = useState(0);
  const [rotY, setRotY]           = useState(0);
  const [phase, setPhase]         = useState('idle');
  const [scale, setScale]         = useState(1);
  const [translateY, setTY]       = useState(0);
  const [glowOpacity, setGlow]    = useState(0);
  const [displayVal, setDisplay]  = useState(value || 1);
  const [showSix, setShowSix]     = useState(false);
  const [redFlash, setRedFlash]   = useState(false);
  const [wiggle, setWiggle]       = useState(false);
  const tumbleRef = useRef(null);
  const phaseRef  = useRef(null);

  const clearAll = () => {
    if (tumbleRef.current) clearInterval(tumbleRef.current);
    if (phaseRef.current)  clearTimeout(phaseRef.current);
  };

  /* Phase 1 — Pickup */
  useEffect(() => {
    if (isRolling && phase === 'idle') {
      setPhase('pickup');
      setScale(1.3);
      setTY(-12);
      phaseRef.current = setTimeout(() => {
        setPhase('tumble');
        let t = 0;
        tumbleRef.current = setInterval(() => {
          const r     = TUMBLE[Math.floor(Math.random() * TUMBLE.length)];
          const speed = Math.max(0.3, 1 - t / 500);
          setRotX(p => p + r.x * speed);
          setRotY(p => p + r.y * speed);
          t += 70;
        }, 70);
        phaseRef.current = setTimeout(() => clearAll(), 500);
      }, 100);
    }
  }, [isRolling]);

  /* Phase 3 — Land + Phase 4 — Flash */
  useEffect(() => {
    if (!isRolling && value && phase !== 'idle') {
      clearAll();
      setPhase('land');
      const final = FACE_ROT[value] || FACE_ROT[1];
      setRotX(p => { const d = ((final.x - p % 360) % 360 + 540) % 360 - 180; return p + d + 720; });
      setRotY(p => { const d = ((final.y - p % 360) % 360 + 540) % 360 - 180; return p + d + 720; });
      setScale(1.08);
      setTY(-5);

      phaseRef.current = setTimeout(() => {
        setScale(0.92);
        setTY(0);
        setDisplay(value);

        phaseRef.current = setTimeout(() => {
          setScale(1);
          setGlow(1);
          setPhase('flash');

          /* Value-specific effects */
          if (value === 6) {
            setShowSix(true);
            setTimeout(() => setShowSix(false), 700);
          } else if (value === 1) {
            setRedFlash(true);
            setTimeout(() => setRedFlash(false), 200);
          }

          setTimeout(() => { setGlow(0); setPhase('idle'); }, 280);
        }, 130);
      }, 140);
    }
  }, [isRolling, value]);

  useEffect(() => () => clearAll(), []);

  const isSix    = displayVal === 6;
  const disabled = !canRoll && !isRolling;

  const transitionStr = phase === 'tumble'
    ? 'transform 0.07s linear'
    : phase === 'land'
    ? 'transform 0.16s cubic-bezier(0.34,1.56,0.64,1)'
    : 'transform 0.12s ease-out';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 8 }}>

      {/* ── Lucky-6 badge ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSix && (
          <motion.div
            initial={{ scale: 0, y: 20, opacity: 0 }}
            animate={{ scale: [0, 1.25, 1], y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'backOut' }}
            style={{
              position: 'absolute',
              top: -52,
              background: 'linear-gradient(135deg,#B8860B,#FFD700)',
              color: '#1A0A00', fontFamily: "'Cinzel',serif", fontWeight: 900,
              fontSize: 13, letterSpacing: 2, padding: '5px 14px',
              borderRadius: 99, whiteSpace: 'nowrap',
              boxShadow: '0 0 18px rgba(255,215,0,0.7)',
              zIndex: 20, pointerEvents: 'none',
            }}
          >
            ✨ LUCKY SIX!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Wrapper ──────────────────────────────────────────────── */}
      <div
        onClick={() => canRoll && !isRolling && onRoll?.()}
        style={{
          width: SIZE, height: SIZE, perspective: 1000,
          cursor: canRoll && !isRolling ? 'pointer' : 'default',
          position: 'relative',
          opacity: disabled ? 0.4 : 1,
          filter: disabled ? 'grayscale(0.6)' : 'none',
          transition: 'opacity 0.3s,filter 0.3s',
        }}
      >
        {/* Can-roll halo */}
        {canRoll && !isRolling && (
          <motion.div
            animate={{ opacity: [0.2, 0.65, 0.2], scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -16, borderRadius: '50%',
              background: `radial-gradient(circle,${isSix ? '#FFD700' : playerColor}66,transparent 70%)`,
              pointerEvents: 'none', zIndex: 0,
            }}
          />
        )}

        {/* Six sparkle burst */}
        {showSix && <SixSparkle />}

        {/* Result colour flash */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: SIZE * 0.2,
          background: `radial-gradient(circle,${isSix ? '#FFD70088' : playerColor + '88'},transparent 70%)`,
          opacity: glowOpacity,
          transition: 'opacity 0.28s ease-out',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Ground shadow */}
        <div style={{
          position: 'absolute', bottom: -14, left: '10%', right: '10%', height: 14,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse,rgba(0,0,0,0.55) 0%,transparent 75%)',
          filter: 'blur(4px)',
          transform: `scaleX(${phase === 'tumble' ? 0.5 : 1}) scaleY(${phase === 'tumble' ? 0.4 : 0.9})`,
          opacity: phase === 'tumble' ? 0.2 : 0.65,
          transition: 'transform 0.3s,opacity 0.3s',
          pointerEvents: 'none',
        }} />

        {/* Wiggle wrapper for triple-six */}
        <motion.div
          animate={wiggle ? { x: [-4, 4, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* ── 3D Cube ─────────────────────────────────────────── */}
          <div
            style={{
              width: '100%', height: '100%',
              position: 'relative', transformStyle: 'preserve-3d',
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateY(${translateY}px)`,
              transition: transitionStr,
              zIndex: 1,
            }}
          >
            <Face n={1} transform={`translateZ(${HALF}px)`}               redFlash={redFlash} />
            <Face n={6} transform={`rotateY(180deg) translateZ(${HALF}px)`} redFlash={redFlash} />
            <Face n={2} transform={`rotateY(90deg) translateZ(${HALF}px)`} redFlash={redFlash} />
            <Face n={5} transform={`rotateY(-90deg) translateZ(${HALF}px)`} redFlash={redFlash} />
            <Face n={3} transform={`rotateX(90deg) translateZ(${HALF}px)`} redFlash={redFlash} />
            <Face n={4} transform={`rotateX(-90deg) translateZ(${HALF}px)`} redFlash={redFlash} />
          </div>
        </motion.div>
      </div>

      {/* ── Status label ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div key="rolling"
            initial={{ opacity: 0 }} animate={{ opacity: [0.5,1,0.5] }} exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            style={lblStyle('#a78bfa')}
          >🎲 Rolling…</motion.div>
        ) : canRoll ? (
          <motion.div key="tap"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={lblStyle(isSix ? '#FFD700' : 'var(--accent)')}
          >
            <motion.span animate={{ scale:[1,1.3,1], rotate:[0,15,-15,0] }} transition={{ repeat:Infinity, duration:1.4 }}>🎲</motion.span>
            &nbsp;Tap to Roll
          </motion.div>
        ) : value ? (
          <motion.div key={`v${value}`}
            initial={{ scale:0.7, opacity:0 }} animate={{ scale:[0.7,1.2,1], opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.3 }}
            style={lblStyle(isSix ? '#FFD700' : 'var(--text-muted)')}
          >
            {isSix ? '✨ Six! Roll again' : `Rolled ${value}`}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Dice;