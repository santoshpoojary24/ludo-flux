import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const COLOR_HEX = {
  red: '#ef4444', green: '#22c55e', yellow: '#eab308', blue: '#3b82f6',
};
const RESULT_META = {
  win:  { label: '🏆 WIN',  bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
  loss: { label: '💔 LOSS', bg: 'rgba(239,68,68,0.10)',  color: '#ef4444' },
  unknown: { label: '—', bg: 'var(--surface2)', color: 'var(--text-muted)' },
};

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); setError('Not logged in'); return; }

    fetch(`${API_URL}/api/matches/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Server error');
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) setMatches(data);
        else setError('Could not load history.');
      })
      .catch(() => setError('Could not load match history. Play a game first!'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid var(--accent)', borderTopColor: 'transparent' }}
      />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
      {error}
    </div>
  );

  if (matches.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🎲</div>
      No matches yet — play a game to see your history!
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
        RECENT MATCHES
      </h2>
      {matches.map((match, i) => {
        const resultMeta = RESULT_META[match.result] || RESULT_META.unknown;
        const winnerColor = COLOR_HEX[match.winner] || '#94a3b8';
        const mins = Math.floor((match.duration_seconds || 0) / 60);
        const secs = (match.duration_seconds || 0) % 60;
        const playedAt = match.played_at
          ? new Date(match.played_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '—';

        return (
          <motion.div
            key={match.id || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: resultMeta.bg,
              borderRadius: 18,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: 'var(--shadow-out)',
              border: `1.5px solid ${match.result === 'win' ? 'rgba(34,197,94,0.25)' : match.result === 'loss' ? 'rgba(239,68,68,0.15)' : 'transparent'}`,
            }}
          >
            {/* Winner color badge */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: winnerColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: `0 4px 12px ${winnerColor}55`,
            }}>
              {match.winner ? '🏆' : '🎲'}
            </div>

            {/* Match info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ textTransform: 'capitalize' }}>{match.winner || '?'}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>won</span>
                <span style={{ padding: '2px 8px', borderRadius: 99, background: resultMeta.bg, color: resultMeta.color, fontSize: 10, fontWeight: 900, border: `1px solid ${resultMeta.color}44` }}>
                  {resultMeta.label}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {match.gameMode} · {match.players?.join(', ') || '—'}
              </div>
            </div>

            {/* Time & ELO */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>{mins}m {secs}s</div>
              {match.eloDelta !== 0 && (
                <div style={{ fontSize: 11, fontWeight: 900, color: match.eloDelta > 0 ? '#22c55e' : '#ef4444', marginTop: 2 }}>
                  {match.eloDelta > 0 ? '+' : ''}{match.eloDelta} ELO
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{playedAt}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MatchHistory;
