import React from 'react';
import { motion } from 'framer-motion';

/* ─── Gem-tone color palette per player (jewel aesthetic) ─── */
const COLOR_MAP = {
  red: {
    base: 'hsl(348, 80%, 42%)',          // Deep Ruby
    mid: 'hsl(348, 75%, 55%)',
    highlight: 'hsl(348, 90%, 72%)',
    shadow: 'hsl(348, 80%, 22%)',
    rim: 'hsl(348, 60%, 30%)',
    glow: 'rgba(180, 30, 60, 0.7)',
  },
  green: {
    base: 'hsl(152, 70%, 28%)',          // Deep Emerald
    mid: 'hsl(152, 65%, 40%)',
    highlight: 'hsl(152, 75%, 60%)',
    shadow: 'hsl(152, 70%, 14%)',
    rim: 'hsl(152, 50%, 22%)',
    glow: 'rgba(20, 130, 70, 0.7)',
  },
  yellow: {
    base: 'hsl(40, 85%, 38%)',           // Rich Gold
    mid: 'hsl(40, 90%, 52%)',
    highlight: 'hsl(45, 100%, 72%)',
    shadow: 'hsl(36, 85%, 22%)',
    rim: 'hsl(36, 65%, 28%)',
    glow: 'rgba(200, 150, 20, 0.7)',
  },
  blue: {
    base: 'hsl(220, 85%, 32%)',          // Royal Sapphire
    mid: 'hsl(220, 80%, 48%)',
    highlight: 'hsl(220, 90%, 70%)',
    shadow: 'hsl(220, 85%, 18%)',
    rim: 'hsl(220, 60%, 26%)',
    glow: 'rgba(20, 60, 180, 0.7)',
  },
};

/**
 * Premium 3D Jewel-tone Token Component
 * - Layered radial gradients for a gem-cut 3D appearance
 * - Idle bobbing animation via CSS class (prefers-reduced-motion safe)
 * - Pulsing glow ring when clickable
 */
const Token = ({
  color = 'red',
  onClick,
  clickable = false,
  boardRotation = 0,
  size = 26,
}) => {
  const theme = COLOR_MAP[color] || COLOR_MAP.red;
  const tokenSize = typeof size === 'number' ? `${size}px` : size;

  /* Hover lift + glow when clickable */
  const hoverVariant = {
    scale: 1.22,
    y: -5,
    filter: `drop-shadow(0 0 10px ${theme.glow}) drop-shadow(0 6px 12px rgba(0,0,0,0.5))`,
  };

  const tapVariant = {
    scale: 0.88,
    y: 0,
    filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.4))`,
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={clickable ? hoverVariant : {}}
      whileTap={clickable ? tapVariant : {}}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        rotate: -boardRotation,
      }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 22,
        rotate: { duration: 0.35, ease: 'easeOut' },
      }}
      /* Token bobbing: CSS class with @keyframes tokenBob defined in index.css */
      className={!clickable ? 'token-idle' : ''}
      style={{
        width: tokenSize,
        height: tokenSize,
        position: 'relative',
        cursor: clickable ? 'pointer' : 'default',
        zIndex: clickable ? 10 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center',
        /* Respect prefers-reduced-motion */
        animationPlayState: 'running',
      }}
    >
      {/* ── Outer rim (darkest layer — gives depth) ───────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 38%,
            ${theme.highlight} 0%,
            ${theme.mid} 35%,
            ${theme.base} 60%,
            ${theme.shadow} 85%,
            ${theme.rim} 100%)`,
          boxShadow: `
            inset 3px 3px 6px rgba(255,255,255,0.35),
            inset -3px -3px 6px rgba(0,0,0,0.5),
            0 6px 16px rgba(0,0,0,0.45),
            0 2px 4px rgba(0,0,0,0.3)
          `,
          border: `1.5px solid ${theme.rim}`,
        }}
      />

      {/* ── Inner specular highlight (top-left gem sparkle) ───────── */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '14%',
          width: '32%',
          height: '28%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 100%)`,
          transform: 'rotate(-20deg)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Centre gem facet dot ───────────────────────────────────── */}
      <div
        style={{
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), ${theme.shadow}88)`,
          boxShadow: `inset 1px 1px 2px rgba(0,0,0,0.4)`,
          border: `1px solid rgba(255,255,255,0.12)`,
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* ── Clickable pulsing glow ring (framer-motion) ───────────── */}
      {clickable && (
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.75, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: -5,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
};

export default Token;
