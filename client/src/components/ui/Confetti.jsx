import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate N confetti particles
const Confetti = ({ count = 80 }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,         // start x %
            delay: Math.random() * 1.5,      // stagger
            drift: (Math.random() - 0.5) * 200, // horizontal drift px
            size: 6 + Math.random() * 8,
            color: ['#f87171', '#4ade80', '#facc15', '#3b82f6', '#c084fc', '#fb923c', '#f472b6'][Math.floor(Math.random() * 7)],
            rotation: Math.random() * 720,
            duration: 2 + Math.random() * 2,
            shape: Math.random() > 0.5 ? 'circle' : 'rect',
        }))
    , [count]);

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
                    animate={{ y: '110vh', x: `calc(${p.x}vw + ${p.drift}px)`, opacity: 0, rotate: p.rotation, scale: [1, 1.3, 0.6] }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.shape === 'circle' ? p.size : p.size * 0.6,
                        borderRadius: p.shape === 'circle' ? '50%' : 2,
                        background: p.color,
                        boxShadow: `0 2px 4px ${p.color}88`,
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;
