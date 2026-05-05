import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import {
  Play,
  History,
  Users,
  User,
  Settings,
  Palette,
  Coins,
  Plus,
  Copy,
  ChevronRight,
  Gamepad2,
  Bot,
  Globe,
  RotateCw,
  Trophy,
  QrCode,
  Gift,
  ShoppingCart
} from 'lucide-react';
import SpinWheel from '../components/ui/SpinWheel';
import MatchHistory from '../components/ui/MatchHistory';
import FriendsList from '../components/dashboard/FriendsList';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ChallengeNotification from '../components/dashboard/ChallengeNotification';
import Leaderboard from '../components/ui/Leaderboard';
import LocalGameSetup from '../components/ui/LocalGameSetup';
import QRScannerModal from '../components/dashboard/QRScannerModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Dashboard = () => {
  const { user, setRoomCode, updateUserCoins, addToast } = useGameStore();
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [friendsReloadKey, setFriendsReloadKey] = useState(0);
  const [friendUidInput, setFriendUidInput] = useState('');
  const [friendError, setFriendError] = useState('');
  const [showLocalSetup, setShowLocalSetup] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!socket) return undefined;

    const onIncoming = (challenge) => setIncomingChallenge(challenge);
    const onAccepted = ({ roomCode }) => setRoomCode(roomCode);
    const onDeclined = () => addToast?.('Challenge declined', 'warning');
    const onExpired = ({ reason }) => {
      setIncomingChallenge(null);
      if (reason === 'timeout') {
        addToast?.('Challenge timed out', 'warning');
      }
    };

    socket.on('challenge:incoming', onIncoming);
    socket.on('challenge:accepted', onAccepted);
    socket.on('challenge:declined', onDeclined);
    socket.on('challenge:expired', onExpired);

    return () => {
      socket.off('challenge:incoming', onIncoming);
      socket.off('challenge:accepted', onAccepted);
      socket.off('challenge:declined', onDeclined);
      socket.off('challenge:expired', onExpired);
    };
  }, [addToast, setRoomCode, socket]);

  const coins = user?.coins || 0;

  const handleAddFriend = async (event) => {
    event.preventDefault();
    setFriendError('');
    if (!friendUidInput.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/friends/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ friendUid: friendUidInput.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        setFriendError(data.error);
        return;
      }

      setFriendUidInput('');
      setFriendsReloadKey((value) => value + 1);
      addToast?.('Friend added', 'success');
    } catch (error) {
      setFriendError('Network error');
    }
  };

  const deleteFriend = async (friendUid) => {
    if (!confirm('Remove this friend?')) return;
    try {
      const res = await fetch(`${API_URL}/api/friends/${friendUid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        addToast('Friend removed', 'success');
        setFriendsReloadKey(k => k + 1);
      } else {
        addToast('Failed to delete friend', 'error');
      }
    } catch (err) {
      addToast('Failed to delete friend', 'error');
    }
  };

  const handleLocalGame = (players) => {
    // Store local players in gameStore and create room
    const roomId = `LOCAL-${Date.now()}`;
    // We'll store the players list somewhere – for now, pass via gameStore
    useGameStore.getState().setLocalPlayers(players);
    setRoomCode(roomId);
    setShowLocalSetup(false);
  };

  const tabs = [
    { id: 'home', icon: <Play size={20} />, label: 'Play' },
    { id: 'history', icon: <History size={20} />, label: 'History' },
    { id: 'friends', icon: <Users size={20} />, label: 'Friends' },
    { id: 'leaderboard', icon: <Trophy size={20} />, label: 'Rank' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: 440, margin: '0 auto', paddingBottom: 88 }}>
      <div
        style={{
          padding: '20px 20px 16px',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-out)',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          zIndex: 10
        }}
      >
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'transparent',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: user?.avatarConfig?.bgColor
                ? `${user.avatarConfig.bgColor}33`
                : 'linear-gradient(135deg, var(--token-blue), var(--accent))',
              border: user?.avatarConfig?.bgColor
                ? `3px solid ${user.avatarConfig.bgColor}`
                : '3px solid var(--surface2)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
              fontSize: user?.avatarConfig?.icon ? 26 : 22,
              color: user?.avatarConfig?.bgColor || '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            {user?.avatarConfig?.icon || user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 17, lineHeight: 1.2 }}>
              {user?.username || 'Guest'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>
              UID: {user?.uid}
            </div>
            <div
              style={{
                marginTop: 4,
                background: 'var(--surface2)',
                borderRadius: 40,
                padding: '2px 10px',
                display: 'inline-block',
                fontWeight: 900,
                color: 'var(--token-yellow)',
                fontSize: 13,
                boxShadow: 'var(--shadow-in)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Coins size={14} /> {coins.toLocaleString()}
            </div>
          </div>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activeTab === 'home' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 8 }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/shop')}
                style={{ background: 'linear-gradient(135deg, var(--token-blue), #3b82f6)', color: 'white', border: 'none', borderRadius: 24, padding: '16px 8px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', boxShadow: 'var(--shadow-out)', fontSize: 13 }}
              >
                <ShoppingCart size={18} /> Shop
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/rewards')}
                style={{ background: 'linear-gradient(135deg, var(--token-yellow), #eab308)', color: 'white', border: 'none', borderRadius: 24, padding: '16px 8px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', boxShadow: 'var(--shadow-out)', fontSize: 13 }}
              >
                <Gift size={18} /> Rewards
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/collection')}
                style={{ background: 'linear-gradient(135deg,#B8860B,#FFD700)', color: '#1A120B', border: 'none', borderRadius: 24, padding: '16px 8px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', boxShadow: 'var(--shadow-out)', fontSize: 13 }}
              >
                🎨 Skins
              </motion.button>
            </div>


            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Game Modes
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                {
                  icon: <Bot />,
                  label: 'Solo vs Bot',
                  sublabel: 'Practice offline',
                  color: 'var(--token-red)',
                  onClick: () => setRoomCode(`BOT-${Date.now().toString(36).toUpperCase()}`)
                },
                {
                  icon: <Users />,
                  label: 'Pass & Play',
                  sublabel: 'Local multiplayer',
                  color: 'var(--token-green)',
                  onClick: () => setShowLocalSetup(true)
                },
                {
                  icon: <Users />,
                  label: 'Create Room',
                  sublabel: 'Invite friends',
                  color: 'var(--token-blue)',
                  onClick: () => setRoomCode(`PRIV-${Math.random().toString(36).slice(2,6).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`)
                },
                {
                  icon: <Globe />,
                  label: 'Global Match',
                  sublabel: '100 coins',
                  color: 'var(--token-yellow)',
                  onClick: () => {
                    if (coins < 100) {
                      addToast?.('Not enough coins! Need 100 coins.', 'warning');
                      return;
                    }
                    // Deduct coins optimistically
                    const newCoins = coins - 100;
                    updateUserCoins(newCoins);
                    fetch(`${API_URL}/api/auth/coins`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({ coins: newCoins })
                    }).catch(console.error);
                    addToast?.('Finding a global match...', 'info');
                    // 'GLOBAL' tells server to find/create a GLOBAL-N room
                    setRoomCode('GLOBAL');
                  }
                }
              ].map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={item.onClick}
                  style={{
                    background: 'var(--surface)',
                    border: 'none',
                    borderRadius: 24,
                    padding: '20px 12px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-out)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${item.color}, rgba(255,255,255,0.2))`,
                    display: 'grid', placeItems: 'center', fontSize: 24,
                    boxShadow: `0 8px 16px ${item.color}44`,
                    color: '#fff'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 13, letterSpacing: 0.5 }}>{item.label}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 10, opacity: 0.8 }}>{item.sublabel}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 20, boxShadow: 'var(--shadow-out)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 900, color: 'var(--accent)', fontSize: 16, textAlign: 'center' }}>Join A Room</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  maxLength={16}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', background: 'var(--surface2)', color: 'var(--text)', fontWeight: 900, fontSize: 16, textAlign: 'center', outline: 'none', letterSpacing: 3, boxShadow: 'var(--shadow-in)' }}
                />
                <button
                  onClick={() => setIsScannerOpen(true)}
                  style={{ padding: '12px', borderRadius: 14, border: 'none', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-out)' }}
                  title="Scan QR Code"
                >
                  <QrCode size={18} />
                </button>
                <button
                  onClick={() => {
                    const normalizedCode = joinCode.trim().toUpperCase();
                    if (!normalizedCode) return;
                    setRoomCode(normalizedCode);
                    setJoinCode('');
                  }}
                  style={{ padding: '12px 20px', borderRadius: 14, border: 'none', background: 'var(--token-green)', color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  GO <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div style={{ minHeight: 300 }}>
              <ActivityFeed />
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'history' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <MatchHistory />
          </motion.div>
        ) : null}

        {activeTab === 'friends' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow-out)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 900, color: 'var(--accent)', fontSize: 18, letterSpacing: 1, textAlign: 'center' }}>
              Friends
            </h3>

            <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 900, color: 'var(--text)', letterSpacing: 1, fontSize: 13 }}>
                MY UID: <span style={{ color: 'var(--accent)' }}>{user?.uid}</span>
              </div>
              <button
                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 900, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => navigator.clipboard?.writeText(user?.uid || '')}
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            <form onSubmit={handleAddFriend} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Enter Friend UID"
                  value={friendUidInput}
                  onChange={(event) => setFriendUidInput(event.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: 'none', background: 'var(--surface2)', color: 'var(--text)', outline: 'none', fontWeight: 700 }}
                />
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 12, border: 'none', background: 'var(--token-green)', color: '#fff', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={18} /> Add
                </button>
              </div>
              {friendError ? <div style={{ color: 'var(--token-red)', fontSize: 12, fontWeight: 700, textAlign: 'center' }}>{friendError}</div> : null}
            </form>

            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <FriendsList reloadKey={friendsReloadKey} onDeleteFriend={deleteFriend} />
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'leaderboard' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Leaderboard />
          </motion.div>
        ) : null}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 440, background: 'var(--surface)', boxShadow: '0 -8px 24px rgba(0,0,0,0.08)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '12px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 20 }}>
        {tabs.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => {
              if (id === 'profile') {
                navigate('/profile');
                return;
              }
              setActiveTab(id);
            }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 16, border: 'none', cursor: 'pointer', background: activeTab === id || (id === 'profile' && window.location.pathname === '/profile') ? 'var(--surface2)' : 'transparent', boxShadow: activeTab === id ? 'var(--shadow-out)' : 'none', color: activeTab === id || (id === 'profile' && window.location.pathname === '/profile') ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {icon}
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showSpinWheel ? (
          <SpinWheel
            onClose={() => setShowSpinWheel(false)}
            onReward={(prize) => {
              const newCoins = coins + prize;
              updateUserCoins(newCoins);
              setShowSpinWheel(false);
              fetch(`${API_URL}/api/auth/coins`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ coins: newCoins, reward: prize })
              }).catch(console.error);
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showLocalSetup && (
          <LocalGameSetup
            onStart={handleLocalGame}
            onClose={() => setShowLocalSetup(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {incomingChallenge ? (
          <ChallengeNotification
            challenge={incomingChallenge}
            onAccept={() => {
              socket.emit('challenge:accept', { challengeId: incomingChallenge.id });
              setIncomingChallenge(null);
            }}
            onDecline={() => {
              socket.emit('challenge:decline', { challengeId: incomingChallenge.id });
              setIncomingChallenge(null);
            }}
          />
        ) : null}
      </AnimatePresence>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(decodedText) => {
          setIsScannerOpen(false);
          // Extract room code if it's a full URL
          if (decodedText.includes('?room=')) {
            const url = new URL(decodedText);
            const room = url.searchParams.get('room');
            if (room) setRoomCode(room.toUpperCase());
          } else {
            setRoomCode(decodedText.trim().toUpperCase());
          }
        }}
      />
    </div>
  );
};

export default Dashboard;