import React from 'react';
import { motion } from 'framer-motion';

const COLOR_MAP = {
  red: { 
    base: 'hsl(0, 85%, 60%)', 
    highlight: 'hsl(0, 85%, 75%)', 
    shadow: 'hsl(0, 85%, 40%)',
    glow: 'rgba(239, 68, 68, 0.5)'
  },
  green: { 
    base: 'hsl(140, 70%, 50%)', 
    highlight: 'hsl(140, 70%, 65%)', 
    shadow: 'hsl(140, 70%, 35%)',
    glow: 'rgba(34, 197, 94, 0.5)'
  },
  yellow: { 
    base: 'hsl(45, 95%, 55%)', 
    highlight: 'hsl(45, 95%, 70%)', 
    shadow: 'hsl(45, 95%, 35%)',
    glow: 'rgba(234, 179, 8, 0.5)'
  },
  blue: { 
    base: 'hsl(215, 90%, 55%)', 
    highlight: 'hsl(215, 90%, 70%)', 
    shadow: 'hsl(215, 90%, 35%)',
    glow: 'rgba(59, 130, 246, 0.5)'
  },
};

/**
 * Premium Claymorphic Token Component
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

  const hoverVariant = {
    scale: 1.15,
    y: -4,
    filter: `drop-shadow(0 8px 12px ${theme.glow})`,
  };

  const tapVariant = {
    scale: 0.9,
    y: 0,
    filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`,
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
        rotate: -boardRotation 
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        rotate: { duration: 0.4, ease: 'easeOut' }
      }}
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
      }}
    >
      {/* Main Body (Claymorphic) */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${theme.highlight}, ${theme.base} 60%, ${theme.shadow})`,
          boxShadow: `
            inset 2px 2px 4px rgba(255,255,255,0.4),
            inset -2px -2px 4px rgba(0,0,0,0.3),
            0 4px 8px rgba(0,0,0,0.25)
          `,
          border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Inner Decorative Ring */}
        <div
          style={{
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Interactive Pulse / Glow */}
      {clickable && (
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`,
            zIndex: -1,
          }}
        />
      )}
    </motion.div>
  );
};

export default Token;
