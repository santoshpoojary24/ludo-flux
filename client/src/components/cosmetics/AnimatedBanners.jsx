import React from 'react';

export const AnimatedBanner = ({ bannerId }) => {
  let background = 'linear-gradient(90deg, #222, #111)';
  if (bannerId === 'banner_inferno') background = 'linear-gradient(90deg, #FF4500, #8B0000)';
  if (bannerId === 'banner_plasma') background = 'linear-gradient(90deg, #00BFFF, #8A2BE2)';
  if (bannerId === 'banner_void') background = 'linear-gradient(90deg, #4B0082, #000000)';

  return (
    <div style={{
      width: '100%', height: '100%',
      background,
      backgroundSize: '200% 200%',
      animation: 'gradientShift 3s ease infinite'
    }}>
      <style>{`@keyframes gradientShift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }`}</style>
    </div>
  );
};
