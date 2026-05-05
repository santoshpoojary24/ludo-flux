import React from 'react';

export const AnimatedBackground = ({ bgId }) => {
  let background = 'transparent';
  if (bgId === 'bg_lava') background = 'linear-gradient(180deg, rgba(255,69,0,0.2), rgba(0,0,0,0.8))';
  if (bgId === 'bg_deepspace') background = 'linear-gradient(180deg, rgba(75,0,130,0.2), rgba(0,0,0,0.8))';
  if (bgId === 'bg_antigravity') background = 'linear-gradient(180deg, rgba(0,255,255,0.1), rgba(0,0,0,0.9))';

  if (background === 'transparent') return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      background, animation: 'bgPulse 5s alternate infinite'
    }}>
      <style>{`@keyframes bgPulse { from { opacity: 0.8; } to { opacity: 1; } }`}</style>
    </div>
  );
};
