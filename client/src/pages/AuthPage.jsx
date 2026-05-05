import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Eye, EyeOff, User, Mail, Lock, Zap, Shield, Trophy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    padding: '14px 16px 14px 44px',
    borderRadius: 14,
    border: '1.5px solid var(--border)',
    background: 'var(--surface2)',
    color: 'var(--text)',
    fontSize: 15,
    fontWeight: 600,
    outline: 'none',
    boxShadow: 'var(--shadow-in)',
    fontFamily: 'var(--font)',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const features = [
    { icon: <Zap size={16} />, text: '3D Animated Dice' },
    { icon: <Trophy size={16} />, text: 'ELO Rankings' },
    { icon: <Shield size={16} />, text: 'Real-time Multiplayer' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated BG blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--token-blue) 0%, transparent 70%)', opacity: 0.08, top: -100, left: -100 }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, var(--token-red) 0%, transparent 70%)', opacity: 0.07, bottom: -80, right: -80 }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, var(--token-yellow) 0%, transparent 70%)', opacity: 0.07, top: '40%', right: '20%' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--surface)',
          borderRadius: 28,
          boxShadow: 'var(--shadow-out)',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          position: 'relative',
          zIndex: 1,
          border: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}
          >
            🎲
          </motion.div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900, letterSpacing: 3, color: 'var(--text)', fontFamily: 'var(--font)' }}>
            LUDO <span style={{ color: 'var(--accent)' }}>FLUX</span>
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
            The Ultimate Ludo Experience
          </p>
        </div>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {features.map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--surface2)', borderRadius: 20, padding: '4px 10px',
              fontSize: 11, fontWeight: 700, color: 'var(--accent)',
              boxShadow: 'var(--shadow-in)',
            }}>
              {f.icon} {f.text}
            </div>
          ))}
        </div>

        {/* Mode switcher */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 16, padding: 4, gap: 4, boxShadow: 'var(--shadow-in)' }}>
          {[
            { key: 'guest', label: '⚡ Guest' },
            { key: 'login', label: 'Sign In' },
            { key: 'register', label: 'Register' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setError(''); }}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 12, border: 'none',
                fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                background: mode === m.key ? 'var(--accent)' : 'transparent',
                color: mode === m.key ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s',
                boxShadow: mode === m.key ? '0 4px 12px rgba(59,130,246,0.4)' : 'none',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {mode === 'guest' && (
              <div style={{
                background: 'var(--surface2)', borderRadius: 16, padding: 20,
                textAlign: 'center', boxShadow: 'var(--shadow-in)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
                <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 15, marginBottom: 6 }}>
                  Quick Play — No Account Needed
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                  Jump right into the game. Create an account later to save your progress.
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text" placeholder="Username" required
                  style={inputStyle}
                  value={username} onChange={e => setUsername(e.target.value)}
                />
              </div>
            )}

            {mode !== 'guest' && (
              <>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email" placeholder="Email address" required
                    style={inputStyle}
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="Password" required
                    style={{ ...inputStyle, paddingRight: 44 }}
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '10px 14px',
                  color: 'var(--token-red)', fontWeight: 700, fontSize: 13, textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, var(--accent), var(--token-blue))',
                color: loading ? 'var(--text-muted)' : '#fff',
                fontWeight: 900, fontSize: 16, letterSpacing: 1, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(59,130,246,0.4)',
                transition: 'all 0.2s', fontFamily: 'var(--font)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--text-muted)', borderTopColor: 'transparent' }}
                />
              ) : (
                <>
                  {mode === 'guest' ? '⚡ Play as Guest' : mode === 'login' ? '→ Sign In' : '✓ Create Account'}
                </>
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        <p style={{ margin: 0, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
          By playing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
