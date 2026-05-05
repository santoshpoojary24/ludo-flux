import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedAvatarFrame = ({ frameId, initial, size = 88 }) => {
  let borderColor = '#FFD700';
  let glowColor = 'rgba(255,215,0,0.5)';
  
  if (frameId === 'frame_ember') { borderColor = '#FF4500'; glowColor = 'rgba(255,69,0,0.5)'; }
  if (frameId === 'frame_solar') { borderColor = '#FF8C00'; glowColor = 'rgba(255,140,0,0.5)'; }
  if (frameId === 'frame_galaxy') { borderColor = '#8A2BE2'; glowColor = 'rgba(138,43,226,0.5)'; }

  return (
    <motion.div
      style={{
        width: size, height: size, borderRadius: '50%',
        border: `4px solid ${borderColor}`,
        boxShadow: `0 0 20px ${glowColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4,
        background: `radial-gradient(circle at 38% 38%, ${borderColor}55, #111)`
      }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
    >
      <div style={{ transform: 'rotate(-360deg)', animation: 'counterRotate 10s linear infinite' }}>
        {initial}
      </div>
      <style>{`@keyframes counterRotate { to { transform: rotate(-360deg); } }`}</style>
    </motion.div>
  );
};
