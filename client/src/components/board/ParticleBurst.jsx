import React, { useEffect, useRef } from 'react';

/**
 * Lightweight canvas-based particle burst.
 * Renders 6-10 particles exploding from a point, then vanishes.
 *
 * @param {number} x - viewport X
 * @param {number} y - viewport Y
 * @param {string} color - base colour of particles
 * @param {number} count - particle count (default 8)
 * @param {function} onDone - called when animation finishes
 */
const ParticleBurst = ({ x, y, color = '#FFD700', count = 8, onDone }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const speed = 3 + Math.random() * 3;
      return {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        r: 4 + Math.random() * 4,
        alpha: 1,
        color,
      };
    });

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.vy    += 0.3;
        p.alpha -= 0.045;
        if (p.alpha <= 0) return;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      if (alive) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, y, color, count]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9000 }}
    />
  );
};

export default ParticleBurst;
