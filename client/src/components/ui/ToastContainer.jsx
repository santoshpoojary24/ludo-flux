import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const TYPE_STYLES = {
  info:     { bg: 'linear-gradient(135deg,#1e293b,#334155)',             icon: 'ℹ️',  border: 'rgba(148,163,184,0.3)'  },
  success:  { bg: 'linear-gradient(135deg,#14532d,#15803d)',             icon: '✅',  border: 'rgba(74,222,128,0.35)'  },
  capture:  { bg: 'linear-gradient(135deg,#7f1d1d,#c2410c)',             icon: '💥',  border: 'rgba(248,113,113,0.45)' },
  warning:  { bg: 'linear-gradient(135deg,#78350f,#b45309)',             icon: '⚠️',  border: 'rgba(251,191,36,0.4)'   },
  six:      { bg: 'linear-gradient(135deg,#4c1d95,#7c3aed)',             icon: '🎲',  border: 'rgba(167,139,250,0.4)'  },
  safe:     { bg: 'linear-gradient(135deg,#713f12,#B8860B)',             icon: '⭐',  border: 'rgba(255,215,0,0.5)'    },
  home:     { bg: 'linear-gradient(135deg,#14532d,#065f46)',             icon: '🏠',  border: 'rgba(52,211,153,0.4)'   },
  skip:     { bg: 'linear-gradient(135deg,#1f2937,#374151)',             icon: '⏭️', border: 'rgba(156,163,175,0.3)'  },
  turnlost: { bg: 'linear-gradient(135deg,#374151,#4b5563)',             icon: '😅',  border: 'rgba(209,213,219,0.25)' },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useGameStore();

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 10000,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none', alignItems: 'flex-end',
    }}>
      <AnimatePresence initial={false}>
        {toasts.map((t, index) => {
          const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ x: '110%', opacity: 0 }}
              animate={{ x: 0,     opacity: 1 }}
              exit={{    x: '110%', opacity: 0 }}
              transition={{
                enter: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                exit:  { duration: 0.2,  ease: [0.55, 0, 1, 0.45] },
                layout: { duration: 0.2 },
              }}
              onClick={() => removeToast(t.id)}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 40,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: 0.3,
                boxShadow: `0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px ${s.border}`,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                pointerEvents: 'auto',
                maxWidth: '88vw',
                backdropFilter: 'blur(8px)',
                fontFamily: "'Quicksand', sans-serif",
                willChange: 'transform, opacity',
              }}
            >
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
              >
                {s.icon}
              </motion.span>
              <span>{t.msg}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
