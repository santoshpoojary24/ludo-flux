import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Pip grid positions (0–8 in a 3×3 grid) ─────────────────── */
const DOTS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/* ─── Colour a face based on value for "golden 6" effect ───────── */
const faceStyle = (isSix, size) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: size * 0.18,
  /* Parchment-ivory for normal faces, gold shimmer for 6 */
  background: isSix
    ? 'linear-gradient(145deg, #fffde7, #ffe57f 45%, #ffd740)'
    : 'linear-gradient(145deg, #fefefe, #e8ecf0)',
  boxShadow: isSix
    ? 'inset 0 2px 6px rgba(255,215,0,0.6), inset 0 -3px 6px rgba(160,100,0,0.4), 0 0 4px rgba(0,0,0,0.25)'
    : 'inset 0 2px 6px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.12), 0 0 4px rgba(0,0,0,0.2)',
  border: isSix
    ? '2px solid rgba(255,215,0,0.8)'
    : '2px solid rgba(255,255,255,0.95)',
  display: 'grid',
  gridTemplateColumns: 'repeat(3,1fr)',
  gridTemplateRows: 'repeat(3,1fr)',
  padding: Math.round(size * 0.12),
  gap: 3,
  backfaceVisibility: 'hidden',
});

const dotStyle = (isSix) => ({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  /* Dark amber pips for gold face; deep navy for normal */
  background: isSix
    ? 'radial-gradient(circle at 35% 30%, #c47a00, #5c3200)'
    : 'radial-gradient(circle at 35% 30%, #334155, #0f172a)',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
});

/* ─── One 3D cube face ──────────────────────────────────────────── */
const Face = ({ n, size, isSix, transform }) => {
  const dots = DOTS[n] || [];
  return (
    <div style={{ ...faceStyle(isSix, size), transform }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dots.includes(i) && (
            <div style={dotStyle(isSix)} />
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Map dice value → final rotations ─────────────────────────── */
const getRotationForValue = (val) => {
  switch (val) {
    case 1: return { x: 0,   y: 0   };
    case 2: return { x: 0,   y: -90 };
    case 3: return { x: -90, y: 0   };
    case 4: return { x: 90,  y: 0   };
    case 5: return { x: 0,   y: 90  };
    case 6: return { x: 0,   y: 180 };
    default: return { x: 0,  y: 0   };
  }
};

/**
 * Premium 3D Dice Component
 * - Full 6-face CSS 3D cube with perspective
 * - Roll: 720° tumble (rotateX + rotateY) with spring easing
 * - Landing: ground shadow swells + recedes (60fps via transform/opacity only)
 * - Golden face for 6 (jewel aesthetic)
 * - Glow ring pulses when it's the player's turn
 */
const Dice = ({ value, isRolling, canRoll, onRoll }) => {
  const [displayVal, setDisplayVal] = useState(value || 1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [jump, setJump] = useState(0);
  const [rotation, setRotation] = useState(() => getRotationForValue(value || 1));

  useEffect(() => {
    if (isRolling) {
      /* Tiny anticipation lift when waiting for server */
      setJump(-8);
    } else if (value) {
      setDisplayVal(value);
      const finalRot = getRotationForValue(value);

      /* Accumulate 2 extra full spins so it never snaps backwards */
      setRotation(prev => {
        const snapTo = (cur, tgt) => {
          const diff = ((tgt - cur) % 360 + 540) % 360 - 180;
          return cur + diff;
        };
        const dirX = Math.random() > 0.5 ? 1 : -1;
        const dirY = Math.random() > 0.5 ? 1 : -1;
        return {
          x: snapTo(prev.x, finalRot.x) + 720 * dirX,
          y: snapTo(prev.y, finalRot.y) + 720 * dirY,
        };
      });

      /* Arc jump: up → peak → land */
      setJump([-8, -90, 0]);
      setIsAnimating(true);

      const t = setTimeout(() => {
        setIsAnimating(false);
        setJump(0);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [isRolling, value]);

  const size = 68;
  const half = size / 2;
  const isSix = displayVal === 6;

  /* Glow colour: gold for 6, accent for others */
  const glowClr = isSix ? '#FFD700' : 'var(--accent)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, marginTop: 8 }}>

      {/* ── Outer clickable wrapper ───────────────────────────── */}
      <div
        onClick={() => canRoll && !isRolling && onRoll?.()}
        style={{
          width: size,
          height: size,
          perspective: 900,
          cursor: canRoll ? 'pointer' : 'default',
          position: 'relative',
        }}
      >
        {/* Pulsing "can roll" halo */}
        {canRoll && !isRolling && (
          <motion.div
            animate={{ opacity: [0.25, 0.65, 0.25], scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -14,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowClr}55, transparent 70%)`,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Ground shadow — swells during arc, fades at peak */}
        <motion.div
          animate={{
            scaleX: isAnimating ? [1, 0.45, 1] : isRolling ? 0.85 : 1,
            opacity: isAnimating ? [0.7, 0.15, 0.7] : isRolling ? 0.4 : 0.65,
          }}
          transition={{ duration: Array.isArray(jump) ? 0.9 : 0.25 }}
          style={{
            position: 'absolute',
            bottom: -12,
            left: '8%',
            right: '8%',
            height: 18,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 75%)',
            filter: 'blur(4px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* ── 3D cube ─────────────────────────────────────────── */}
        <motion.div
          animate={{
            rotateX: rotation.x,
            rotateY: rotation.y,
            y: jump,
          }}
          transition={{
            rotateX: { type: 'spring', stiffness: 58, damping: 11 },
            rotateY: { type: 'spring', stiffness: 58, damping: 11 },
            y: Array.isArray(jump)
              ? { duration: 0.9, times: [0, 0.38, 1], ease: 'easeInOut' }
              : { type: 'spring', stiffness: 220, damping: 22 },
          }}
          whileHover={canRoll && !isRolling ? { scale: 1.1, y: -6 } : {}}
          whileTap={canRoll && !isRolling ? { scale: 0.88 } : {}}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            zIndex: 1,
          }}
        >
          {/* Front  → 1 */}
          <Face n={1} size={size} isSix={isSix} transform={`translateZ(${half}px)`} />
          {/* Back   → 6 */}
          <Face n={6} size={size} isSix={isSix} transform={`rotateY(180deg) translateZ(${half}px)`} />
          {/* Right  → 2 */}
          <Face n={2} size={size} isSix={isSix} transform={`rotateY(90deg) translateZ(${half}px)`} />
          {/* Left   → 5 */}
          <Face n={5} size={size} isSix={isSix} transform={`rotateY(-90deg) translateZ(${half}px)`} />
          {/* Top    → 3 */}
          <Face n={3} size={size} isSix={isSix} transform={`rotateX(90deg) translateZ(${half}px)`} />
          {/* Bottom → 4 */}
          <Face n={4} size={size} isSix={isSix} transform={`rotateX(-90deg) translateZ(${half}px)`} />
        </motion.div>
      </div>

      {/* ── Status label ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div
            key="r"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={lblStyle('#a78bfa')}
          >
            Rolling…
          </motion.div>
        ) : canRoll ? (
          <motion.div
            key="tap"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={lblStyle(glowClr)}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            >
              🎲
            </motion.span>
            &nbsp;Tap to Roll
          </motion.div>
        ) : value ? (
          <motion.div
            key={`v${value}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: [0.7, 1.15, 1], opacity: 1 }}
            transition={{ duration: 0.35 }}
            style={lblStyle(isSix ? '#FFD700' : 'var(--text-muted)')}
          >
            {isSix ? '✨ Six! Roll again' : `Rolled ${value}`}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const lblStyle = (color) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color,
  fontFamily: "'Quicksand', sans-serif",
});

export default Dice;