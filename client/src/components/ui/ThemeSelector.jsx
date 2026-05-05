import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const THEMES = [
  {
    id: 'clay',
    name: 'Clay',
    emoji: '🧸',
    desc: 'Soft pastel, warm shadows',
    preview: ['#FAF7F2', '#f87171', '#4ade80', '#facc15', '#3b82f6'],
  },
  {
    id: 'neon',
    name: 'Neon Night',
    emoji: '⚡',
    desc: 'Glowing dark cyberpunk',
    preview: ['#0D0D1A', '#ff4d6d', '#39ff14', '#ffe600', '#00eeff'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '🔲',
    desc: 'Clean flat white design',
    preview: ['#FFFFFF', '#ef4444', '#22c55e', '#eab308', '#3b82f6'],
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌿',
    desc: 'Earthy dark green wood',
    preview: ['#1B3A2D', '#E07B54', '#6DBF67', '#D4A843', '#5B9BD5'],
  },
  {
    id: 'retro',
    name: 'Retro Arcade',
    emoji: '🕹️',
    desc: 'Pixel-art purple arcade',
    preview: ['#1A0033', '#FF2222', '#22FF22', '#FFFF00', '#2222FF'],
  },
];

const ThemeSelector = () => {
  const { showTheme, toggleTheme, theme, setTheme } = useGameStore();

  if (!showTheme) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="panel-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={toggleTheme}
      >
        <motion.div
          className="panel-sheet clay-card"
          initial={{ scale: 0.92, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 460, padding: 28,
            display: 'flex', flexDirection: 'column', gap: 20,
            background: 'var(--surface)', borderRadius: 'var(--radius)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 22, color: 'var(--text)', fontFamily: 'var(--font)' }}>
              🎨 Choose Theme
            </h2>
            <button
              onClick={toggleTheme}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>

          {/* Theme cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {THEMES.map(t => {
              const isActive = theme === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setTheme(t.id); toggleTheme(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 'var(--radius)',
                    border: isActive ? '2.5px solid var(--accent)' : '2px solid var(--border)',
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'var(--surface2)',
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: isActive ? '0 0 0 4px rgba(59,130,246,0.15)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Color swatches */}
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {t.preview.map((c, i) => (
                      <div key={i} style={{
                        width: i === 0 ? 22 : 14, height: i === 0 ? 22 : 14,
                        borderRadius: '50%', background: c,
                        border: '2px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        marginTop: i === 0 ? 0 : 4,
                      }} />
                    ))}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font)' }}>
                      {t.emoji} {t.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>
                      {t.desc}
                    </div>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>
                      ✓
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThemeSelector;
