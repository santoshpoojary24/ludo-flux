import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Eye, EyeOff, User, Mail, Lock, Zap, Shield, Trophy, Swords } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ── Floating particle for the background ─────────────────────── */
const Particle = ({ style }) => (
  <motion.div
    animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
    style={style}
  />
);

const AuthPage = () => {
  const [mode, setMode] = useState('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { setUser } = useGameStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'guest') {
        const res = await fetch(`${API_URL}/api/auth/guest`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUser(data.user, data.token);
      } else if (mode === 'login') {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUser(data.user, data.token);
      } else {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error);
        setUser(loginData.user, loginData.token);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '15px 16px 15px 46px',
    borderRadius: 14,
    border: '1.5px solid rgba(255,215,0,0.2)',
    background: 'rgba(255,255,255,0.04)',
    color: '#FFF5E1',
    fontSize: 15,
    fontWeight: 600,
    outline: 'none',
    fontFamily: "'Quicksand', sans-serif",
    transition: 'border-color 0.25s, box-shadow 0.25s',
    boxSizing: 'border-box',
    backdropFilter: 'blur(6px)',
  };

  const modes = [
    { key: 'guest',    label: '⚡ Guest'   },
    { key: 'login',    label: 'Sign In'    },
    { key: 'register', label: 'Register'  },
  ];

  const features = [
    { icon: <Swords size={14} />, text: 'Live Multiplayer' },
    { icon: <Trophy size={14} />, text: 'ELO Rankings'     },
    { icon: <Shield size={14} />, text: 'Real-time Chat'   },
    { icon: <Zap size={14} />,   text: '3D Dice Physics'  },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      /* Dark wood-grain parchment bg matching the board */
      background: 'linear-gradient(160deg, #1A120B 0%, #0D0805 55%, #1A120B 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Ambient gem glow blobs ──────────────────────────────── */}
      {[
        { w:500, h:500, top:'-15%', left:'-15%', color:'hsl(348,72%,34%)' },
        { w:400, h:400, bottom:'-12%', right:'-12%', color:'hsl(220,80%,28%)' },
        { w:300, h:300, top:'40%', right:'5%', color:'hsl(40,80%,32%)' },
        { w:250, h:250, bottom:'25%', left:'8%', color:'hsl(152,65%,22%)' },
      ].map((b, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
          style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: b.w, height: b.h, top: b.top, left: b.left, bottom: b.bottom, right: b.right,
            background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      ))}

      {/* ── Floating dice particles ─────────────────────────────── */}
      {['🎲','♟️','⭐','🎯'].map((emoji, i) => (
        <Particle key={i} style={{
          position: 'absolute', fontSize: 20 + i * 4,
          top: `${15 + i * 20}%`, left: `${5 + i * 22}%`,
          opacity: 0.15, pointerEvents: 'none', userSelect: 'none',
        }} />
      ))}

      {/* ── Main card ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: '100%',
          maxWidth: 430,
          background: 'rgba(40,29,20,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 28,
          boxShadow: `
            0 0 0 1px rgba(255,215,0,0.2),
            0 0 40px rgba(255,215,0,0.08),
            0 32px 64px rgba(0,0,0,0.7)
          `,
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(255,215,0,0.15)',
        }}
      >
        {/* Top gold line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 2,
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
          borderRadius: 999,
        }} />

        {/* ── Logo / Title ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotateY: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 64, lineHeight: 1, marginBottom: 10, display: 'inline-block', transformStyle: 'preserve-3d' }}
          >
            🎲
          </motion.div>
          <h1 style={{
            margin: 0, fontFamily: "'Cinzel', serif",
            fontSize: 32, fontWeight: 900, letterSpacing: 5,
            background: 'linear-gradient(135deg, #FFD700, #FFF8DC 50%, #B8860B)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
          }}>
            Ludo Flux
          </h1>
          <p style={{ margin: '8px 0 0', color: '#A08060', fontSize: 12, fontWeight: 600, fontFamily: "'Quicksand', sans-serif", letterSpacing: 2 }}>
            THE ULTIMATE LUDO EXPERIENCE
          </p>
        </div>

        {/* ── Feature badges ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          {features.map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,215,0,0.08)',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: 20, padding: '4px 10px',
              fontSize: 10, fontWeight: 700, color: '#FFD700',
              fontFamily: "'Quicksand', sans-serif",
              letterSpacing: 0.5,
            }}>
              {f.icon} {f.text}
            </div>
          ))}
        </div>

        {/* ── Mode switcher ────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 16, padding: 4, gap: 4,
          border: '1px solid rgba(255,215,0,0.12)',
        }}>
          {modes.map(m => (
            <motion.button
              key={m.key}
              onClick={() => { setMode(m.key); setError(''); }}
              whileTap={{ scale: 0.96 }}
              style={{
                flex: 1, padding: '11px 4px', borderRadius: 12, border: 'none',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 800, fontSize: 12, cursor: 'pointer', letterSpacing: 0.5,
                background: mode === m.key
                  ? 'linear-gradient(135deg, #B8860B, #FFD700)'
                  : 'transparent',
                color: mode === m.key ? '#1A120B' : '#A08060',
                transition: 'all 0.25s',
                boxShadow: mode === m.key ? '0 4px 14px rgba(255,215,0,0.35)' : 'none',
              }}
            >
              {m.label}
            </motion.button>
          ))}
        </div>

        {/* ── Form ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {mode === 'guest' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(255,215,0,0.06)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: 16, padding: 20, textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#FFD700', fontSize: 14, marginBottom: 6 }}>
                  Quick Play
                </div>
                <div style={{ color: '#A08060', fontSize: 12, fontWeight: 600, fontFamily: "'Quicksand', sans-serif", lineHeight: 1.6 }}>
                  Jump straight into the action. No sign-up required — create an account later to save your progress.
                </div>
              </motion.div>
            )}

            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#A08060', pointerEvents: 'none' }} />
                <input
                  type="text" placeholder="Choose a username" required
                  style={inputStyle}
                  value={username} onChange={e => setUsername(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,215,0,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,215,0,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            {mode !== 'guest' && (
              <>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#A08060', pointerEvents: 'none' }} />
                  <input
                    type="email" placeholder="Email address" required
                    style={inputStyle}
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={e => { e.target.style.borderColor = 'rgba(255,215,0,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,215,0,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#A08060', pointerEvents: 'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="Password" required
                    style={{ ...inputStyle, paddingRight: 46 }}
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={e => { e.target.style.borderColor = 'rgba(255,215,0,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,215,0,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A08060', padding: 0, display: 'flex' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </>
            )}

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  style={{
                    background: 'rgba(180,30,60,0.15)',
                    border: '1px solid rgba(180,30,60,0.4)',
                    borderRadius: 10, padding: '10px 14px',
                    color: '#f87171', fontWeight: 700, fontSize: 13, textAlign: 'center',
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 12px 32px rgba(255,215,0,0.45)' } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              style={{
                width: '100%', padding: '17px', borderRadius: 16, border: 'none',
                background: loading
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #8B6000, #FFD700 50%, #B8860B)',
                color: loading ? '#A08060' : '#1A120B',
                fontFamily: "'Cinzel', serif",
                fontWeight: 900, fontSize: 14, letterSpacing: 2,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(255,215,0,0.3)',
                transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                textTransform: 'uppercase',
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #A08060', borderTopColor: '#FFD700' }}
                />
              ) : (
                mode === 'guest' ? '⚡ Play as Guest'
                  : mode === 'login' ? '→ Enter the Arena'
                  : '✦ Create Account'
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        <p style={{ margin: 0, textAlign: 'center', fontSize: 10, color: '#5a4030', fontWeight: 600, fontFamily: "'Quicksand', sans-serif", letterSpacing: 1 }}>
          BY PLAYING YOU AGREE TO OUR TERMS OF SERVICE
        </p>

        {/* Bottom gold line */}
        <div style={{
          position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)',
          borderRadius: 999,
        }} />
      </motion.div>
    </div>
  );
};

export default AuthPage;
