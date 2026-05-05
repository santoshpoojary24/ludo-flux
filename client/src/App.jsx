// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import GamePage from './pages/GamePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import RewardsPage from './pages/RewardsPage';
import { useGameStore } from './store/gameStore';
import ToastContainer from './components/ui/ToastContainer';
import SettingsPanel from './components/ui/SettingsPanel';
import ThemeSelector from './components/ui/ThemeSelector';
import { useSocket } from './hooks/useSocket';
import { SOCKET_EVENTS } from './shared/socketEvents.js';
import { Palette, Settings } from 'lucide-react';

/* ── Smooth page transition wrapper ─────────────────────────────── */
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    style={{ width: '100%', minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);


function App() {
  const { token, user, roomCode, logout, setRoomCode, theme, updateUserProfile, toggleSettings, isSettingsOpen } = useGameStore();
  const settings = useGameStore((state) => state.settings);
  const { socket } = useSocket();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // ── Validate persisted token on startup ──────────────────────────────────
  useEffect(() => {
    const validate = async () => {
      if (token) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) {
            // Token invalid or expired — force logout
            logout();
          } else {
            const data = await res.json();
            // Refresh user data from server (coins, elo, etc.)
            updateUserProfile(data.user);
          }
        } catch {
          // Network error — keep the session, try again later
        }
      }
      setAuthChecked(true);
    };
    validate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user && socket) {
      socket.emit('presence:identify', { uid: user.uid, username: user.username });
    }
  }, [user, socket]);

  useEffect(() => {
    if (!socket || !user) return undefined;

    const onAvatarUpdated = ({ uid, avatarConfig }) => {
      if (uid === user.uid) updateUserProfile({ avatarConfig });
    };
    const onStatusUpdated = ({ uid, statusMessage }) => {
      if (uid === user.uid) updateUserProfile({ statusMessage });
    };

    socket.on(SOCKET_EVENTS.PROFILE_AVATAR_UPDATED, onAvatarUpdated);
    socket.on(SOCKET_EVENTS.PROFILE_STATUS_UPDATED, onStatusUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.PROFILE_AVATAR_UPDATED, onAvatarUpdated);
      socket.off(SOCKET_EVENTS.PROFILE_STATUS_UPDATED, onStatusUpdated);
    };
  }, [socket, updateUserProfile, user]);

  useEffect(() => {
    if (token && !user) logout();
  }, [token, user, logout]);

  useEffect(() => {
    import('./utils/soundEngine').then(({ setBGM }) => {
      setBGM(settings.bgMusicEnabled, settings.masterVolume);
    });
  }, [settings.bgMusicEnabled, settings.masterVolume]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room && token && user && !roomCode) {
      setRoomCode(room.toUpperCase());
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [token, user, roomCode, setRoomCode, location.pathname]);

  const isAuthenticated = token && user;

  // Don't render anything until we've verified the stored token
  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh', width: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{
          fontSize: 52, animation: 'spin 1s linear infinite'
        }}>🎲</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen t-bg relative">
      <ToastContainer />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => useGameStore.getState().closeSettings()} />
      <ThemeSelector />

      {isAuthenticated && !roomCode ? (
        <div style={{ position: 'fixed', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 100 }}>
          <button
            onClick={() => useGameStore.getState().toggleTheme()}
            className="w-10 h-10 rounded-full flex justify-center items-center shadow-clay text-lg bg-clay-surface border-none cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            aria-label="Theme"
          >
            <Palette size={20} />
          </button>
          <button
            onClick={() => useGameStore.getState().toggleSettings()}
            className="w-10 h-10 rounded-full flex justify-center items-center shadow-clay text-lg bg-clay-surface border-none cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      ) : null}

      {!isAuthenticated ? (
        <AuthPage />
      ) : roomCode ? (
        <GamePage />
      ) : (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/player/:uid" element={<PageWrapper><ProfilePage /></PageWrapper>} />
          <Route path="/shop" element={<PageWrapper><ShopPage /></PageWrapper>} />
          <Route path="/rewards" element={<PageWrapper><RewardsPage /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      )}
    </div>
  );
}

export default App;