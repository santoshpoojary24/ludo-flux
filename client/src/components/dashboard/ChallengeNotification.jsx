import React from 'react';
import { motion } from 'framer-motion';

const ChallengeNotification = ({ challenge, onAccept, onDecline }) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 28, y: -12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 24, y: -8 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: 'min(360px, calc(100vw - 32px))',
        zIndex: 1200,
        padding: 16,
        borderRadius: 22,
        background: 'var(--surface)',
        boxShadow: '0 18px 44px rgba(15, 23, 42, 0.18)',
        border: '1px solid rgba(148, 163, 184, 0.22)'
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, var(--accent), var(--token-blue))',
            color: '#fff',
            fontWeight: 900,
            fontSize: 18
          }}
        >
          {challenge.fromUsername?.[0]?.toUpperCase() || '?'}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: 'var(--text)', fontWeight: 900, fontSize: 15 }}>
            Incoming challenge
          </div>
          <div
            style={{
              marginTop: 4,
              color: 'var(--text-muted)',
              fontSize: 13,
              lineHeight: 1.45,
              fontWeight: 700
            }}
          >
            {challenge.fromUsername} invited you to a {challenge.mode} match for {challenge.stake} coins.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button
          onClick={onDecline}
          style={{
            flex: 1,
            border: 'none',
            borderRadius: 14,
            padding: '11px 14px',
            background: 'var(--surface2)',
            color: 'var(--text)',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-in)'
          }}
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          style={{
            flex: 1,
            border: 'none',
            borderRadius: 14,
            padding: '11px 14px',
            background: 'var(--token-green)',
            color: '#fff',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 12px 28px rgba(34,197,94,0.22)'
          }}
        >
          Accept
        </button>
      </div>
    </motion.aside>
  );
};

export default ChallengeNotification;
