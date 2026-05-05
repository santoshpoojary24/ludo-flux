import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../shared/socketEvents.js';

const COLOR_HEX = { red: 'var(--token-red)', green: 'var(--token-green)', yellow: 'var(--token-yellow)', blue: 'var(--token-blue)' };

const tokensHome = (tokens) => tokens?.filter(t => t.position === 56).length || 0;

const Scoreboard = ({ startTime }) => {
  const { gameState, user, roomCode } = useGameStore();
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pings, setPings] = useState({}); // uid → ms
  const pingInterval = useRef(null);

  // ── Elapsed timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    let id;
    if (gameState?.status === 'playing' && !gameState?.winner) {
      // Start or resume timer
      id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(id);
  }, [startTime, gameState?.status, gameState?.winner]);

  // ── Ping measurement ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;
    const rc = gameState?.roomCode || roomCode;
    let ts;
    const measure = () => {
      ts = Date.now();
      socket.emit(SOCKET_EVENTS.GAME_PING, { roomCode: rc, uid: user.uid, ts });
    };
    const onPong = ({ uid, ts: sent }) => {
      if (uid === user.uid) setPings(p => ({ ...p, [uid]: Date.now() - sent }));
    };
    socket.on(SOCKET_EVENTS.GAME_PONG, onPong);
    pingInterval.current = setInterval(measure, 5000);
    measure();
    return () => { clearInterval(pingInterval.current); socket.off(SOCKET_EVENTS.GAME_PONG, onPong); };
  }, [socket, user, roomCode, gameState?.roomCode]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const colors = ['red', 'green', 'yellow', 'blue'];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', top: 76, right: 16, zIndex: 300,
          background: 'var(--surface)', border: 'none', borderRadius: 'var(--radius-pill)',
          padding: '6px 14px', fontWeight: 900, fontSize: 13, cursor: 'pointer',
          boxShadow: 'var(--shadow-out)', color: 'var(--text)', display: 'flex',
          alignItems: 'center', gap: 6, fontFamily: 'var(--font)',
        }}
      >
        📊 <span style={{ fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</span>
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 220,
              background: 'var(--surface)', zIndex: 250,
              boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', padding: 16, gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>📊 Scores</span>
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>⏱ {mm}:{ss}</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {colors.map(color => {
                const player = gameState?.players?.find(p => p.color === color);
                const home = tokensHome(gameState?.tokens?.[color]);
                const isActive = gameState?.turn === color;
                const isMe = player?.uid === user?.uid;
                const ping = pings[player?.uid];

                return (
                  <div key={color} style={{
                    background: 'var(--surface2)',
                    borderRadius: 'var(--radius)',
                    padding: '10px 12px',
                    border: isActive ? `2px solid ${COLOR_HEX[color]}` : '2px solid transparent',
                    transition: 'border 0.3s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: COLOR_HEX[color],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: '#fff', fontSize: 13,
                        boxShadow: isActive ? `0 0 0 3px ${COLOR_HEX[color]}55` : 'none',
                        transition: 'box-shadow 0.3s',
                      }}>
                        {player ? (player.isBot ? '🤖' : player.username?.[0]?.toUpperCase() || '?') : '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text)' }}>
                          {player ? (player.isBot ? `Bot ${color}` : player.username) : 'Empty'}
                          {isMe && <span style={{ color: 'var(--accent)', marginLeft: 4 }}>(you)</span>}
                        </div>
                        {ping !== undefined && (
                          <div style={{ fontSize: 10, color: ping < 80 ? '#4ade80' : ping < 200 ? '#facc15' : '#f87171', fontWeight: 700 }}>
                            {ping}ms
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tokens home pips */}
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: i < home ? COLOR_HEX[color] : 'var(--border)',
                          border: '2px solid rgba(255,255,255,0.3)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 700 }}>
                      {home}/4 home
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Scoreboard;
