import React from 'react';
import { motion } from 'framer-motion';

/* ─── Jewel colour palette per player ───────────────────────────── */
const COLOR_MAP = {
  red: {
    base:      '#C0392B',
    mid:       'hsl(348,75%,50%)',
    highlight: 'hsl(348,90%,72%)',
    shadow:    'hsl(348,80%,18%)',
    rim:       'hsl(348,60%,26%)',
    glow:      'rgba(192,57,43,0.8)',
    css:       'var(--token-red)',
  },
  green: {
    base:      '#1A7A4A',
    mid:       'hsl(152,65%,38%)',
    highlight: 'hsl(152,75%,60%)',
    shadow:    'hsl(152,70%,12%)',
    rim:       'hsl(152,50%,20%)',
    glow:      'rgba(26,122,74,0.8)',
    css:       'var(--token-green)',
  },
  yellow: {
    base:      '#B8860B',
    mid:       'hsl(40,90%,50%)',
    highlight: 'hsl(45,100%,72%)',
    shadow:    'hsl(36,85%,20%)',
    rim:       'hsl(36,65%,26%)',
    glow:      'rgba(184,134,11,0.8)',
    css:       'var(--token-yellow)',
  },
  blue: {
    base:      '#1A4A8A',
    mid:       'hsl(220,80%,45%)',
    highlight: 'hsl(220,90%,70%)',
    shadow:    'hsl(220,85%,16%)',
    rim:       'hsl(220,60%,22%)',
    glow:      'rgba(26,74,138,0.8)',
    css:       'var(--token-blue)',
  },
};

const Token = ({
  color = 'red',
  onClick,
  clickable = false,
  selected = false,
  boardRotation = 0,
  size = 26,
}) => {
  const t = COLOR_MAP[color] || COLOR_MAP.red;
  const sz = typeof size === 'number' ? `${size}px` : size;

  return (
    <motion.div
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: selected ? 1.25 : 1,
        opacity: 1,
        rotate: -boardRotation,
        y: selected ? -6 : 0,
      }}
      whileHover={clickable && !selected ? { scale: 1.18, y: -5 } : {}}
      whileTap={clickable ? { scale: 0.88 } : {}}
      transition={{
        type: 'spring', stiffness: 380, damping: 22,
        rotate: { duration: 0.35, ease: 'easeOut' },
      }}
      className={!clickable && !selected ? 'token-idle' : ''}
      style={{
        width: sz, height: sz,
        position: 'relative',
        cursor: clickable ? 'pointer' : 'default',
        zIndex: selected ? 20 : clickable ? 10 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transformOrigin: 'center bottom',
        filter: selected
          ? `drop-shadow(0 0 8px ${t.glow}) drop-shadow(0 0 16px ${t.glow})`
          : clickable
          ? `drop-shadow(0 0 6px ${t.glow}) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`
          : 'none',
      }}
    >
      {/* ── Main gem body ──────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 38% 36%,
          ${t.highlight} 0%,
          ${t.mid}       32%,
          ${t.base}      60%,
          ${t.shadow}    85%,
          ${t.rim}       100%)`,
        boxShadow: `
          inset 0 2px 4px rgba(255,255,255,0.6),
          inset 0 -2px 4px rgba(0,0,0,0.4),
          0 4px 8px rgba(0,0,0,0.5),
          0 2px 3px rgba(0,0,0,0.3)
        `,
        border: `1.5px solid ${t.rim}`,
      }} />

      {/* ── Specular highlight ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '11%', left: '13%',
        width: '34%', height: '28%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.72) 0%, transparent 100%)',
        transform: 'rotate(-20deg)', pointerEvents: 'none',
      }} />

      {/* ── Centre gem dot ─────────────────────────────────────────── */}
      <div style={{
        width: '28%', height: '28%', borderRadius: '50%', position: 'relative', zIndex: 1,
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), ${t.shadow}99)`,
        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.1)',
      }} />

      {/* ── Clickable pulse ring ───────────────────────────────────── */}
      {clickable && !selected && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -5, borderRadius: '50%', zIndex: -1,
            background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Selected: bright white halo pulsing ───────────────────── */}
      {selected && (
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -7, borderRadius: '50%', zIndex: -1,
            background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, transparent 65%)',
            boxShadow: `0 0 12px 4px ${t.glow}`,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
};

export default Token;
