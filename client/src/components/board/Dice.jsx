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

/* ─── Map value → final cube rotations ─────────────────────────── */
const FACE_ROT = {
  1: { x: 0,    y: 0   },
  2: { x: 0,    y: -90 },
  3: { x: -90,  y: 0   },
  4: { x: 90,   y: 0   },
  5: { x: 0,    y: 90  },
  6: { x: 0,    y: 180 },
};

/* ─── Random tumble rotations for mid-roll ──────────────────────── */
const TUMBLE = [
  { x: 90,  y: 45  }, { x: 180, y: 90  }, { x: 270, y: 135 },
  { x: 45,  y: 180 }, { x: 135, y: 270 }, { x: 225, y: 45  },
  { x: 315, y: 90  }, { x: 90,  y: 315 }, { x: 180, y: 180 },
  { x: 270, y: 270 }, { x: 360, y: 90  }, { x: 450, y: 360 },
];

const SIZE = 72;
const HALF = SIZE / 2;

/* ─── Single face ───────────────────────────────────────────────── */
const Face = ({ n, transform, playerColor }) => {
  const isSix = n === 6;
  const dots = DOTS[n] || [];

  const faceBase = isSix
    ? 'linear-gradient(145deg, #fff8e1, #ffe082 50%, #ffd54f)'
    : 'linear-gradient(145deg, #FFFFF8, #EDE8D8)';

  return (
    <div style={{
      position: 'absolute',
      width: SIZE, height: SIZE,
      borderRadius: SIZE * 0.14,
      background: faceBase,
      border: isSix ? '1.5px solid rgba(255,200,0,0.6)' : '1px solid rgba(0,0,0,0.12)',
      boxShadow: isSix
        ? 'inset 0 2px 5px rgba(255,255,255,0.9), inset 0 -2px 5px rgba(160,100,0,0.25)'
        : 'inset 0 2px 5px rgba(255,255,255,0.95), inset 0 -2px 5px rgba(0,0,0,0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gridTemplateRows: 'repeat(3,1fr)',
      padding: SIZE * 0.14,
      gap: 4,
      transform,
      backfaceVisibility: 'hidden',
    }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dots.includes(i) && (
            <div style={{
              width: '75%', height: '75%', borderRadius: '50%',
              background: isSix
                ? 'radial-gradient(circle at 35% 30%, #c47a00, #5c3200)'
                : 'radial-gradient(circle at 35% 30%, #3d3020, #1a1208)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.15)',
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
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | pickup | tumble | land | flash
  const [scale, setScale] = useState(1);
  const [translateY, setTranslateY] = useState(0);
  const [glowOpacity, setGlowOpacity] = useState(0);
  const [displayVal, setDisplayVal] = useState(value || 1);
  const tumbleRef = useRef(null);
  const phaseRef = useRef(null);

  /* Cancel all running timers */
  const clearAll = () => {
    if (tumbleRef.current) clearInterval(tumbleRef.current);
    if (phaseRef.current) clearTimeout(phaseRef.current);
  };

  useEffect(() => {
    if (isRolling && phase === 'idle') {
      /* Phase 1 — Pickup: 0–100ms */
      setPhase('pickup');
      setScale(1.3);
      setTranslateY(-10);

      phaseRef.current = setTimeout(() => {
        /* Phase 2 — Tumble: 100–580ms, rapid rotation every 60ms */
        setPhase('tumble');
        let t = 0;
        tumbleRef.current = setInterval(() => {
          const r = TUMBLE[Math.floor(Math.random() * TUMBLE.length)];
          const speed = Math.max(1, 1 - t / 480); // ease-out
          setRotX(prev => prev + r.x * speed);
          setRotY(prev => prev + r.y * speed);
          t += 60;
        }, 60);
        phaseRef.current = setTimeout(() => clearAll(), 480);
      }, 100);
    }
  }, [isRolling]);

  useEffect(() => {
    if (!isRolling && value && phase !== 'idle') {
      /* Phase 3 — Land: snap to correct face */
      clearAll();
      setPhase('land');
      const final = FACE_ROT[value] || FACE_ROT[1];

      /* Accumulate 2 extra full spins to avoid snap-back */
      setRotX(prev => {
        const diff = ((final.x - prev % 360) % 360 + 540) % 360 - 180;
        return prev + diff + 720;
      });
      setRotY(prev => {
        const diff = ((final.y - prev % 360) % 360 + 540) % 360 - 180;
        return prev + diff + 720;
      });
      setScale(1.05);
      setTranslateY(-4);

      phaseRef.current = setTimeout(() => {
        /* Squish land */
        setScale(0.95);
        setTranslateY(0);
        setDisplayVal(value);

        phaseRef.current = setTimeout(() => {
          /* Settle */
          setScale(1);
          /* Phase 4 — Flash */
          setPhase('flash');
          setGlowOpacity(1);
          phaseRef.current = setTimeout(() => {
            setGlowOpacity(0);
            setPhase('idle');
          }, 250);
        }, 120);
      }, 130);
    }
  }, [isRolling, value]);

  /* Cleanup on unmount */
  useEffect(() => () => clearAll(), []);

  const isSix = displayVal === 6;
  const isDisabled = !canRoll && !isRolling;
  const transitionStr = phase === 'tumble'
    ? 'transform 0.06s linear'
    : phase === 'land'
    ? 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)'
    : 'transform 0.12s ease-out';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 8 }}>

      {/* ── Wrapper: click target + glow halo ────────────────────── */}
      <div
        onClick={() => canRoll && !isRolling && onRoll?.()}
        style={{
          width: SIZE, height: SIZE,
          perspective: 1000,
          cursor: canRoll && !isRolling ? 'pointer' : 'default',
          position: 'relative',
          opacity: isDisabled ? 0.4 : 1,
          filter: isDisabled ? 'grayscale(0.6)' : 'none',
          transition: 'opacity 0.3s, filter 0.3s',
        }}
      >
        {/* Can-roll pulsing halo */}
        {canRoll && !isRolling && (
          <motion.div
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -16, borderRadius: '50%',
              background: `radial-gradient(circle, ${isSix ? '#FFD700' : playerColor}66, transparent 70%)`,
              pointerEvents: 'none', zIndex: 0,
            }}
          />
        )}

        {/* Result flash overlay */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: SIZE * 0.2,
          background: `radial-gradient(circle, ${playerColor}88, transparent 70%)`,
          opacity: glowOpacity,
          transition: 'opacity 0.25s ease-out',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Ground shadow */}
        <div style={{
          position: 'absolute', bottom: -14, left: '10%', right: '10%', height: 14,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 75%)',
          filter: 'blur(4px)',
          transform: `scaleX(${phase === 'tumble' ? 0.5 : 1}) scaleY(${phase === 'tumble' ? 0.4 : 0.9})`,
          opacity: phase === 'tumble' ? 0.2 : 0.65,
          transition: 'transform 0.3s, opacity 0.3s',
          pointerEvents: 'none',
        }} />

        {/* ── 3D Cube ───────────────────────────────────────────── */}
        <div
          style={{
            width: '100%', height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateY(${translateY}px)`,
            transition: transitionStr,
            zIndex: 1,
          }}
        >
          <Face n={1} transform={`translateZ(${HALF}px)`} />
          <Face n={6} transform={`rotateY(180deg) translateZ(${HALF}px)`} />
          <Face n={2} transform={`rotateY(90deg) translateZ(${HALF}px)`} />
          <Face n={5} transform={`rotateY(-90deg) translateZ(${HALF}px)`} />
          <Face n={3} transform={`rotateX(90deg) translateZ(${HALF}px)`} />
          <Face n={4} transform={`rotateX(-90deg) translateZ(${HALF}px)`} />
        </div>
      </div>

      {/* ── Status label ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div key="rolling"
            initial={{ opacity: 0 }} animate={{ opacity: [0.5,1,0.5] }} exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            style={lblStyle('#a78bfa')}
          >
            🎲 Rolling…
          </motion.div>
        ) : canRoll ? (
          <motion.div key="tap"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={lblStyle(isSix ? '#FFD700' : 'var(--accent)')}
          >
            <motion.span animate={{ scale:[1,1.3,1], rotate:[0,15,-15,0] }} transition={{ repeat: Infinity, duration: 1.4 }}>🎲</motion.span>
            &nbsp;Tap to Roll
          </motion.div>
        ) : value ? (
          <motion.div key={`v${value}`}
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale:[0.7,1.2,1], opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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