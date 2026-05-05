import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { DICE_SKINS } from '../../pages/CollectionPage';

/* ─── Pip grid positions (0–8 in a 3×3 grid) ─────────────────── */
const DOTS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
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

/* ─── One 3D cube face ──────────────────────────────────────────── */
const Face = ({ n, size, isSix, transform, skin }) => {
  const dots = DOTS[n] || [];

  const faceBackground = isSix
    ? 'linear-gradient(145deg, #fffde7, #ffe57f 45%, #ffd740)'
    : skin.faceGrad;

  const faceBoxShadow = isSix
    ? 'inset 0 2px 6px rgba(255,215,0,0.6), inset 0 -3px 6px rgba(160,100,0,0.4), 0 0 4px rgba(0,0,0,0.25)'
    : 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.15), 0 0 4px rgba(0,0,0,0.2)';

  const faceBorder = isSix
    ? '2px solid rgba(255,215,0,0.8)'
    : `2px solid ${skin.borderColor}`;

  const pipColor = isSix
    ? 'radial-gradient(circle at 35% 30%, #c47a00, #5c3200)'
    : `radial-gradient(circle at 35% 30%, ${skin.pipColor}, ${skin.pipColor}aa)`;

  return (
    <div style={{
      position: 'absolute', width: size, height: size,
      borderRadius: size * 0.18,
      background: faceBackground,
      boxShadow: faceBoxShadow,
      border: faceBorder,
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gridTemplateRows: 'repeat(3,1fr)',
      padding: Math.round(size * 0.12),
      gap: 3,
      backfaceVisibility: 'hidden',
      transform,
    }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dots.includes(i) && (
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: pipColor,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

const lblStyle = (color) => ({
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 12, fontWeight: 900, letterSpacing: 1.5,
  textTransform: 'uppercase', color,
  fontFamily: "'Quicksand', sans-serif",
});

/* ─── Main Dice Component ───────────────────────────────────────── */
const Dice = ({ value, isRolling, canRoll, onRoll }) => {
  const cosmetics = useGameStore((s) => s.cosmetics);
  const skinId    = cosmetics?.diceSkin || 'classic';
  const skin      = DICE_SKINS[skinId] || DICE_SKINS.classic;

  const [displayVal, setDisplayVal] = useState(value || 1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [jump, setJump]               = useState(0);
  const [rotation, setRotation]       = useState(() => getRotationForValue(value || 1));

  useEffect(() => {
    if (isRolling) {
      setJump(-8);
    } else if (value) {
      setDisplayVal(value);
      const finalRot = getRotationForValue(value);

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

      setJump([-8, -90, 0]);
      setIsAnimating(true);

      const t = setTimeout(() => {
        setIsAnimating(false);
        setJump(0);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [isRolling, value]);

  const size    = 68;
  const half    = size / 2;
  const isSix   = displayVal === 6;
  const glowClr = isSix ? '#FFD700' : 'var(--accent)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, marginTop: 8 }}>

      <div
        onClick={() => canRoll && !isRolling && onRoll?.()}
        style={{ width: size, height: size, perspective: 900, cursor: canRoll ? 'pointer' : 'default', position: 'relative' }}
      >
        {/* Skin label (small badge) */}
        {skinId !== 'classic' && (
          <div style={{
            position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
            background: skin.faceGrad, border: `1px solid ${skin.borderColor}`,
            borderRadius: 99, padding: '1px 7px',
            fontSize: 9, fontWeight: 800, color: skin.pipColor,
            fontFamily: "'Quicksand',sans-serif", letterSpacing: 1,
            whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
          }}>
            {skin.name}
          </div>
        )}

        {/* Pulsing "can roll" halo */}
        {canRoll && !isRolling && (
          <motion.div
            animate={{ opacity: [0.25, 0.65, 0.25], scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -14, borderRadius: '50%',
              background: `radial-gradient(circle, ${glowClr}55, transparent 70%)`,
              zIndex: 0, pointerEvents: 'none',
            }}
          />
        )}

        {/* Ground shadow */}
        <motion.div
          animate={{
            scaleX: isAnimating ? [1, 0.45, 1] : isRolling ? 0.85 : 1,
            opacity: isAnimating ? [0.7, 0.15, 0.7] : isRolling ? 0.4 : 0.65,
          }}
          transition={{ duration: Array.isArray(jump) ? 0.9 : 0.25 }}
          style={{
            position: 'absolute', bottom: -12, left: '8%', right: '8%', height: 18,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 75%)',
            filter: 'blur(4px)', zIndex: 0, pointerEvents: 'none',
          }}
        />

        {/* 3D cube */}
        <motion.div
          animate={{ rotateX: rotation.x, rotateY: rotation.y, y: jump }}
          transition={{
            rotateX: { type: 'spring', stiffness: 58, damping: 11 },
            rotateY: { type: 'spring', stiffness: 58, damping: 11 },
            y: Array.isArray(jump)
              ? { duration: 0.9, times: [0, 0.38, 1], ease: 'easeInOut' }
              : { type: 'spring', stiffness: 220, damping: 22 },
          }}
          whileHover={canRoll && !isRolling ? { scale: 1.1, y: -6 } : {}}
          whileTap={canRoll && !isRolling ? { scale: 0.88 } : {}}
          style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', zIndex: 1 }}
        >
          <Face n={1} size={size} isSix={isSix} skin={skin} transform={`translateZ(${half}px)`} />
          <Face n={6} size={size} isSix={isSix} skin={skin} transform={`rotateY(180deg) translateZ(${half}px)`} />
          <Face n={2} size={size} isSix={isSix} skin={skin} transform={`rotateY(90deg) translateZ(${half}px)`} />
          <Face n={5} size={size} isSix={isSix} skin={skin} transform={`rotateY(-90deg) translateZ(${half}px)`} />
          <Face n={3} size={size} isSix={isSix} skin={skin} transform={`rotateX(90deg) translateZ(${half}px)`} />
          <Face n={4} size={size} isSix={isSix} skin={skin} transform={`rotateX(-90deg) translateZ(${half}px)`} />
        </motion.div>
      </div>

      {/* Status label */}
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div key="r" initial={{ opacity: 0, y: 4 }} animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }} style={lblStyle('#a78bfa')}>
            Rolling…
          </motion.div>
        ) : canRoll ? (
          <motion.div key="tap" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={lblStyle(glowClr)}>
            <motion.span animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
              🎲
            </motion.span>
            &nbsp;Tap to Roll
          </motion.div>
        ) : value ? (
          <motion.div key={`v${value}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: [0.7, 1.15, 1], opacity: 1 }}
            transition={{ duration: 0.35 }} style={lblStyle(isSix ? '#FFD700' : 'var(--text-muted)')}>
            {isSix ? '✨ Six! Roll again' : `Rolled ${value}`}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Dice;