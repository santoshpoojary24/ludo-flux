import { useEffect, useRef } from 'react';

const PLAYER_COLORS = ['#C0392B','#1A7A4A','#B8860B','#1A4A8A','#FFD700','#9B59B6'];

/**
 * Canvas-based confetti — zero DOM elements, GPU-composited only.
 * @param {boolean} active - start/stop confetti
 * @param {number}  duration - ms before auto-stopping (default 4500)
 */
const ConfettiCanvas = ({ active, duration = 4500 }) => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const stopRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => window.removeEventListener('resize', resize);
    }

    // Spawn particles
    const particles = Array.from({ length: 55 }, (_, i) => ({
      x:    Math.random() * canvas.width,
      y:    -Math.random() * canvas.height * 0.3,
      w:    6 + Math.random() * 9,
      h:    5 + Math.random() * 5,
      color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
      vx:   (Math.random() - 0.5) * 2.2,
      vy:   2.5 + Math.random() * 3,
      rot:  Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
      phase: Math.random() * Math.PI * 2,
      alpha: 1,
    }));

    let t = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t++;
      particles.forEach(p => {
        p.x   += p.vx + Math.sin(p.phase + t * 0.025) * 0.8;
        p.y   += p.vy;
        p.vy  += 0.045; // gravity
        p.rot += p.rotV;
        p.alpha = Math.max(0, 1 - (p.y / canvas.height) * 1.2);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        // Recycle off-screen
        if (p.y > canvas.height + 20) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
          p.alpha = 1;
        }
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    stopRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      // Fade out remaining
      const fade = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let anyVisible = false;
        particles.forEach(p => {
          p.alpha -= 0.025;
          if (p.alpha <= 0) return;
          anyVisible = true;
          p.y += p.vy;
          p.x += p.vx;
          p.rot += p.rotV;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (anyVisible) rafRef.current = requestAnimationFrame(fade);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
      fade();
    }, duration);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stopRef.current) clearTimeout(stopRef.current);
    };
  }, [active, duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default ConfettiCanvas;
