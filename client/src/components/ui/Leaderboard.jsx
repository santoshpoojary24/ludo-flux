import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const RANK_TIERS = [
  { name: 'Bronze',   min: 0,    color: '#CD7F32', icon: '🥉' },
  { name: 'Silver',   min: 700,  color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold',     min: 900,  color: '#FFD700', icon: '🥇' },
  { name: 'Platinum', min: 1100, color: '#E5E4E2', icon: '💎' },
  { name: 'Diamond',  min: 1400, color: '#B9F2FF', icon: '👑' },
  { name: 'Flux',     min: 2000, color: '#FF6B9D', icon: '⚡' },
];

const getRank = (elo = 0) =>
  [...RANK_TIERS].reverse().find(t => elo >= t.min) || RANK_TIERS[0];

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign:'center', padding:'32px 0', color:'#A08060', fontFamily:"'Quicksand',sans-serif" }}>Loading ranks...</div>;
  }

  if (players.length === 0) {
    return <div style={{ textAlign:'center', padding:'32px 0', color:'#A08060', fontFamily:"'Quicksand',sans-serif", fontStyle:'italic' }}>No ranked players yet.</div>;
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-out)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontWeight: 900, color: '#FFD700', fontSize: 20, letterSpacing: 1, textAlign: 'center', fontFamily: "'Cinzel', serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Trophy size={22} color="#FFD700" /> GLOBAL RANKS
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {players.map((player, idx) => {
          const rank = getRank(player.elo);
          return (
            <motion.div key={player.uid}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: idx === 0 ? 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.02))' : 'rgba(255,255,255,0.03)',
                borderRadius: 16, border: `1px solid ${idx === 0 ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)'}`,
                boxShadow: idx === 0 ? '0 0 20px rgba(255,215,0,0.1)' : 'none'
              }}
            >
              {/* Rank Position */}
              <div style={{ width: 28, fontSize: 18, fontWeight: 900, color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#A08060', fontFamily: "'Cinzel', serif", textAlign: 'center' }}>
                {idx + 1}
              </div>

              {/* Rank Badge & Name */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, filter: `drop-shadow(0 0 6px ${rank.color}44)` }}>{rank.icon}</span>
                  <div style={{ fontWeight: 900, fontSize: 15, color: '#FFF5E1', fontFamily: "'Quicksand', sans-serif" }}>{player.username}</div>
                  {idx === 0 && <Medal color="#FFD700" size={14} style={{ marginLeft: 4 }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <div style={{ fontSize: 11, color: rank.color, fontWeight: 800, fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{rank.name}</div>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ fontSize: 11, color: '#A08060', fontWeight: 700, fontFamily: "'Quicksand', sans-serif" }}>ELO {player.elo}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ fontWeight: 900, color: '#4ade80', fontSize: 13, fontFamily: "'Quicksand', sans-serif" }}>{player.winRate}% Win</div>
                <div style={{ fontSize: 10, color: '#7A5C40', fontWeight: 700, fontFamily: "'Quicksand', sans-serif" }}>{player.total_matches} matches</div>
              </div>

              {/* Inspect Button */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/profile/${player.uid}`)}
                style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 12, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#FFD700', fontWeight: 800, fontSize: 11, fontFamily: "'Quicksand', sans-serif", letterSpacing: 1 }}
                title="Inspect Profile"
              >
                <Eye size={14} /> INSPECT
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;