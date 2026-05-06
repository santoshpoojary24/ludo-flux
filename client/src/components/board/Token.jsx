import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { TOKEN_SKINS } from '../../pages/CollectionPage';

/* ─── Jewel base colors (always used as base hue per player) ─── */
const PLAYER_HUES = {
  red:    { h: 348, s: 80 },
  green:  { h: 152, s: 70 },
  yellow: { h: 40,  s: 85 },
  blue:   { h: 220, s: 85 },
};

/* ─── Build theme from player color + skin overlay ───────────── */
const buildTheme = (color, skinId) => {
  const { h, s } = PLAYER_HUES[color] || PLAYER_HUES.red;
  const skin = TOKEN_SKINS[skinId] || TOKEN_SKINS.jewel;

  // Skin-specific color override (use skin's color slot for this player)
  const playerIndex = ['red','green','yellow','blue'].indexOf(color);
  const skinColor = skin.colors[playerIndex] || skin.colors[0];

  if (skinId === 'jewel') {
    // Original jewel gem look
    return {
      base:      `hsl(${h}, ${s}%, 42%)`,
      mid:       `hsl(${h}, ${s - 5}%, 55%)`,
      highlight: `hsl(${h}, ${s + 10}%, 72%)`,
      shadow:    `hsl(${h}, ${s}%, 22%)`,
      rim:       `hsl(${h}, ${s - 20}%, 30%)`,
      glow:      `hsla(${h}, ${s}%, 40%, 0.7)`,
    };
  }

  // Other skins use their defined hex colors
  return {
    base:      skinColor,
    mid:       skinColor + 'cc',
    highlight: skinColor + '88',
    shadow:    skinColor + '44',
    rim:       skinColor + '66',
    glow:      skinColor + 'bb',
  };
};

/* ─── Skin-specific shape/style overlays ─────────────────────── */
const getSkinStyle = (skinId) => {
  switch (skinId) {
    case 'crystal':
      return { borderRadius: '50%', filter: 'brightness(1.15) saturate(1.3)' };
    case 'fire':
      return { borderRadius: '50% 50% 40% 40% / 55% 55% 45% 45%', filter: 'brightness(1.1)' };
    case 'metal':
      return { borderRadius: '30%', filter: 'brightness(1.05) contrast(1.1)' };
    case 'knight':
      return { borderRadius: '50%', filter: 'sepia(0.3) brightness(0.9)' };
    case 'emoji':
      return { borderRadius: '50%', filter: 'brightness(1.2) saturate(1.4)' };
    default:
      return { borderRadius: '50%' };
  }
};

/* ─── Emoji skin special centre icon ─────────────────────────── */
const EMOJI_ICONS = { red: '😤', green: '😎', yellow: '😄', blue: '😮' };

const Token = ({
  color = 'red',
  onClick,
  clickable = false,
  boardRotation = 0,
  size = 26,
}) => {
  const cosmetics = useGameStore((s) => s.cosmetics);
  const skinId    = cosmetics?.tokenSkin || 'jewel';
  const theme     = buildTheme(color, skinId);
  const skinStyle = getSkinStyle(skinId);
  const tokenSize = typeof size === 'number' ? `${size}px` : size;

  const hoverVariant = {
    scale: 1.22, y: -5,
    filter: `drop-shadow(0 0 10px ${theme.glow}) drop-shadow(0 6px 12px rgba(0,0,0,0.5))`,
  };
  const tapVariant = {
    scale: 0.88, y: 0,
    filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.4))`,
  };

  const isPawn = skinId === 'jewel';

  return (
    <motion.div
      onClick={onClick}
      whileHover={clickable ? hoverVariant : {}}
      whileTap={clickable ? tapVariant : {}}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: -boardRotation }}
      transition={{
        type: 'spring', stiffness: 380, damping: 22,
        rotate: { duration: 0.35, ease: 'easeOut' },
      }}
      className={!clickable ? 'token-idle' : ''}
      style={{
        width: tokenSize, height: tokenSize,
        position: 'relative',
        cursor: clickable ? 'pointer' : 'default',
        zIndex: clickable ? 10 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transformOrigin: 'center',
      }}
    >
      {isPawn ? (
        /* ── Ludo King pawn shape ─────────────────────────────────────── */
        <div style={{ position:'relative', width:'62%', height:'80%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end' }}>
          {/* Head — round gem ball */}
          <div style={{
            width:'58%', height:'38%',
            borderRadius:'50%',
            background:`radial-gradient(circle at 35% 30%, ${theme.highlight} 0%, ${theme.mid} 45%, ${theme.base} 70%, ${theme.shadow} 100%)`,
            boxShadow:`inset 2px 2px 5px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.45), 0 0 8px ${theme.glow}`,
            border:`1.5px solid ${theme.rim}`,
            position:'relative', flexShrink:0,
          }}>
            {/* Shine dot */}
            <div style={{ position:'absolute', top:'18%', left:'20%', width:'28%', height:'24%', borderRadius:'50%', background:'rgba(255,255,255,0.6)' }} />
          </div>
          {/* Neck */}
          <div style={{
            width:'22%', height:'14%',
            background:`linear-gradient(180deg, ${theme.mid} 0%, ${theme.base} 100%)`,
            flexShrink:0,
          }} />
          {/* Base — wide skirt */}
          <div style={{
            width:'100%', height:'44%',
            borderRadius:'50% 50% 28% 28% / 55% 55% 30% 30%',
            background:`linear-gradient(180deg, ${theme.base} 0%, ${theme.shadow} 100%)`,
            boxShadow:`0 4px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.28)`,
            border:`1.5px solid ${theme.rim}`,
            flexShrink:0,
          }}>
            <div style={{ position:'absolute', top:'5%', left:'12%', right:'12%', height:'35%', borderRadius:'50%', background:'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
      ) : (
        <>
          {/* ── Main body ─────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: skinStyle.borderRadius,
            filter: skinStyle.filter || 'none',
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
          }} />
          {/* ── Specular highlight ─────────────────────────────────────── */}
          <div style={{
            position: 'absolute', top: '12%', left: '14%',
            width: '32%', height: '28%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 100%)',
            transform: 'rotate(-20deg)', pointerEvents: 'none',
          }} />
          {/* ── Centre detail ──────────────────────────────────────────── */}
          {skinId === 'emoji' ? (
            <div style={{ position: 'relative', zIndex: 1, fontSize: `calc(${tokenSize} * 0.42)`, lineHeight: 1, userSelect: 'none' }}>
              {EMOJI_ICONS[color] || '😊'}
            </div>
          ) : (
            <div style={{
              width: '30%', height: '30%', borderRadius: skinStyle.borderRadius === '30%' ? '20%' : '50%',
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), ${theme.shadow}88)`,
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.12)',
              position: 'relative', zIndex: 1,
            }} />
          )}
        </>
      )}

      {/* ── Clickable pulsing glow ring ────────────────────────────── */}
      {clickable && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -5, borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
            zIndex: -1, pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
};

export default Token;
