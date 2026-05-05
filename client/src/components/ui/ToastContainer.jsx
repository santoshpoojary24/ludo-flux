import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const TYPE_STYLES = {
  info:    { bg: '#1e293b', icon: 'ℹ️' },
  success: { bg: '#15803d', icon: '✅' },
  capture: { bg: '#c2410c', icon: '💥' },
  warning: { bg: '#b45309', icon: '⚠️' },
  six:     { bg: '#7c3aed', icon: '🎲' },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useGameStore();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(t => {
          const style = TYPE_STYLES[t.type] || TYPE_STYLES.info;
          return (
            <motion.div
              key={t.id}
              initial={{ y: -28, opacity: 0, scale: 0.88 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -24, opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => removeToast(t.id)}
              style={{
                background: style.bg,
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 40,
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 0.4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                pointerEvents: 'auto',
                maxWidth: '90vw',
              }}
            >
              <span>{style.icon}</span>
              <span>{t.msg}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
