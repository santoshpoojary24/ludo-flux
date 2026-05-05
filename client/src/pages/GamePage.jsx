import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { SOCKET_EVENTS } from '../shared/socketEvents.js';
import LudoBoard from '../components/board/LudoBoard';
import Dice from '../components/board/Dice';
import ChatDrawer from '../components/chat/ChatDrawer';
import Scoreboard from '../components/ui/Scoreboard';
import FriendsList from '../components/dashboard/FriendsList';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, MessageCircle, Users, Share2, RotateCw, Trophy, Mic, MicOff, Bot, Volume2, VolumeX, UserPlus, QrCode, Settings, Palette
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let strictModeLeaveTimeout = null;

const GamePage = () => {
  const {
    roomCode: storeRoomCode,
    user,
    gameState,
    setGameState,
    setRoomAndState,
    resetGame,
    addToast,
    settings,
    toggleSettings,
    toggleTheme
  } = useGameStore();

  const { socket } = useSocket();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRollingAnim, setIsRollingAnim] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [capturedMsg, setCapturedMsg] = useState(null);
  const [showStartAnim, setShowStartAnim] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const prevStatusRef = useRef(gameState?.status);

  // Critical: use refs to avoid stale closures in effects
  const roomCodeRef  = useRef(storeRoomCode);
  const startTimeRef = useRef(Date.now());
  const savedRef     = useRef(false); // prevent double-save

  // Keep roomCodeRef in sync with resolved room code
  const resolvedRoomCode = gameState?.roomCode || storeRoomCode;
  useEffect(() => {
    if (resolvedRoomCode) roomCodeRef.current = resolvedRoomCode;
  }, [resolvedRoomCode]);

  // Track game start to trigger animation
  useEffect(() => {
    if (prevStatusRef.current === 'waiting' && gameState?.status === 'playing') {
      setShowStartAnim(true);
      startTimeRef.current = Date.now(); // Reset timer on start
      setTimeout(() => setShowStartAnim(false), 2500);
    }
    prevStatusRef.current = gameState?.status;
  }, [gameState?.status]);

  // ── Socket event handlers ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !storeRoomCode || !user) return;

    if (strictModeLeaveTimeout) {
      clearTimeout(strictModeLeaveTimeout);
      strictModeLeaveTimeout = null;
    }

    // Join room — server resolves GLOBAL → GLOBAL-N for global matches
    socket.emit(SOCKET_EVENTS.ROOM_JOIN, {
      roomCode: storeRoomCode,
      user: { uid: user.uid, username: user.username, coins: user.coins, elo: user.elo }
    });

    const onRoomJoined = (state) => {
      if (state?.roomCode) roomCodeRef.current = state.roomCode;
      setRoomAndState(state);
    };

    const onStateUpdated = (state) => {
      setGameState(state);
      // Auto-save on win (once)
      if (state?.winner && !savedRef.current) {
        savedRef.current = true;
        saveMatch(state);
      }
    };

    const onDiceRolled = (state) => {
      setIsRollingAnim(false); // Instantly stop anticipating and let Dice.jsx play the physical roll
      setGameState(state);
    };

    const onPlayerJoined = ({ msg }) => addToast(msg || 'A player joined', 'success');
    const onPlayerLeft   = ({ msg }) => addToast(msg || 'A player left', 'info');

    socket.on(SOCKET_EVENTS.ROOM_JOINED,       onRoomJoined);
    socket.on(SOCKET_EVENTS.GAME_STATE_UPDATED, onStateUpdated);
    socket.on(SOCKET_EVENTS.GAME_DICE_ROLLED,   onDiceRolled);
    socket.on(SOCKET_EVENTS.PLAYER_JOINED,      onPlayerJoined);
    socket.on(SOCKET_EVENTS.PLAYER_LEFT,        onPlayerLeft);

    return () => {
      strictModeLeaveTimeout = setTimeout(() => {
        socket.emit(SOCKET_EVENTS.ROOM_LEAVE, {
          roomCode: roomCodeRef.current,
          uid: user.uid
        });
      }, 500);

      socket.off(SOCKET_EVENTS.ROOM_JOINED,       onRoomJoined);
      socket.off(SOCKET_EVENTS.GAME_STATE_UPDATED, onStateUpdated);
      socket.off(SOCKET_EVENTS.GAME_DICE_ROLLED,   onDiceRolled);
      socket.off(SOCKET_EVENTS.PLAYER_JOINED,      onPlayerJoined);
      socket.off(SOCKET_EVENTS.PLAYER_LEFT,        onPlayerLeft);
    };
  }, [socket, storeRoomCode]); // ← NO user/setters in deps to prevent re-join loop

  // ── Save match history ─────────────────────────────────────────────────────
  const saveMatch = (state) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/matches/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        roomCode: roomCodeRef.current,
        winner: state.winner,
        players: state.players || [],
        duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        gameMode: state.gameMode || 'Classic'
      })
    })
    .then(res => res.json())
    .then(data => console.log('[saveMatch] Success:', data))
    .catch((err) => console.error('[saveMatch] Error:', err));
  };

  // ── Game actions ──────────────────────────────────────────────────────────
  const handleRollDice = useCallback(() => {
    if (!socket || !user) return;
    setIsRollingAnim(true); // Optimistically show anticipating state
    socket.emit(SOCKET_EVENTS.GAME_ROLL_DICE, {
      roomCode: roomCodeRef.current,
      uid: user.uid
    });
  }, [socket, user]);

  const handleMoveToken = useCallback((color, tokenIndex) => {
    if (!socket || !user) return;
    socket.emit(SOCKET_EVENTS.GAME_MOVE_TOKEN, {
      roomCode: roomCodeRef.current,
      color,
      tokenIndex,
      uid: user.uid
    });
  }, [socket, user]);

  const handleStartGame = useCallback(() => {
    if (!socket || !user) return;
    socket.emit(SOCKET_EVENTS.GAME_START, {
      roomCode: roomCodeRef.current,
      uid: user.uid
    });
  }, [socket, user]);

  const handleFillBots = useCallback(() => {
    if (!socket || !user) return;
    socket.emit(SOCKET_EVENTS.GAME_FILL_BOTS, {
      roomCode: roomCodeRef.current,
      uid: user.uid,
      difficulty: settings.botDifficulty || 'medium'
    });
  }, [socket, user, settings.botDifficulty]);

  const handleRematch = useCallback(() => {
    if (!socket) return;
    savedRef.current = false;
    socket.emit(SOCKET_EVENTS.GAME_REMATCH, { roomCode: roomCodeRef.current });
  }, [socket]);

  const handleToggleMic = useCallback(() => {
    setIsMuted(m => {
      const next = !m;
      // Enable voice on first unmute (lazy — only asks for mic permission then)
      if (!next) setVoiceEnabled(true);
      socket?.emit(SOCKET_EVENTS.GAME_TOGGLE_MIC, {
        roomCode: roomCodeRef.current,
        uid: user?.uid,
        isMuted: next
      });
      return next;
    });
  }, [socket, user]);

  // ── Voice chat (WebRTC) ────────────────────────────────────────────────────
  // voiceEnabled flips to true on first unmute — lazy init getUserMedia
  const { isSpeaking } = useVoiceChat(
    socket,
    resolvedRoomCode,
    user,
    isMuted,
    voiceEnabled,
    isSpeakerMuted ? 0 : (settings.voiceVolume ?? 80)
  );

  // ── Speaker toggle — mute/unmute all remote audio instantly ───────────────
  const handleToggleSpeaker = useCallback(() => {
    setIsSpeakerMuted(m => {
      const next = !m;
      document.querySelectorAll('audio[id^="audio-"]').forEach(el => {
        el.volume = next ? 0 : (settings.voiceVolume ?? 80) / 100;
      });
      return next;
    });
  }, [settings.voiceVolume]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInviteFriend = (friend) => {
    if (!socket || !resolvedRoomCode) return;
    socket.emit('challenge:send', { 
      toUid: friend.uid, 
      stake: 0, 
      mode: gameState?.gameMode || 'Private Match',
      roomCode: resolvedRoomCode
    });
    addToast(`Invite sent to ${friend.username}!`, 'info');
    setIsInviteModalOpen(false);
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const isBotGame      = resolvedRoomCode?.startsWith('BOT-');
  const isPassAndPlay  = resolvedRoomCode?.startsWith('LOCAL-');

  // Find ME in the players list
  const myPlayer  = gameState?.players?.find(p => p.uid === user?.uid && !p.isBot);
  const myColor   = myPlayer?.color ?? null;

  const isHost    = gameState?.host === user?.uid;
  const turnColor = gameState?.turn;

  // For Pass & Play: any local player's turn counts
  const turnPlayer = gameState?.players?.find(p => p.color === turnColor);
  const isMyTurn   = myColor !== null && (
    turnColor === myColor ||
    (isPassAndPlay && turnPlayer?.isLocal === true)
  );

  const diceValue = gameState?.diceValue ?? null;
  const canRoll   = isMyTurn
    && diceValue === null
    && !gameState?.winner
    && gameState?.status === 'playing';

  // Loading screen
  if (!gameState) {
    return (
      <div style={styles.loading}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={styles.spinner}
        />
        <p style={styles.loadingText}>Joining Room…</p>
      </div>
    );
  }

  const showMic    = !isBotGame && !isPassAndPlay;
  const playerCount = gameState.players?.filter(p => !p.isBot).length ?? 0;
  const botCount    = gameState.players?.filter(p => p.isBot).length ?? 0;

  return (
    <div style={styles.page}>
      {gameState.status === 'playing' && <Scoreboard startTime={startTimeRef.current} />}

      <AnimatePresence>
        {showStartAnim && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', pointerEvents: 'none'
            }}
          >
            <div style={{
              fontSize: 'clamp(40px, 10vw, 80px)', fontWeight: 900,
              color: 'var(--accent)', textShadow: '0 0 40px var(--accent), 0 8px 16px rgba(0,0,0,0.5)',
              textTransform: 'uppercase', fontStyle: 'italic',
              WebkitTextStroke: '2px white'
            }}>
              Game Start!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={resetGame} style={styles.iconBtn} title="Leave game">
            <ArrowLeft size={20} />
          </button>
          <button onClick={toggleSettings} style={styles.iconBtn} title="Settings">
            <Settings size={18} />
          </button>
          <button onClick={toggleTheme} style={styles.iconBtn} title="Toggle Theme">
            <Palette size={18} />
          </button>
        </div>

        <div style={styles.roomInfo}>
          <span style={styles.roomLabel}>ROOM</span>
          <span style={styles.roomCode}>{resolvedRoomCode}</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {showMic && (
            <>
              {/* Mic toggle */}
              <button
                onClick={handleToggleMic}
                title={isMuted ? 'Unmute mic' : 'Mute mic'}
                style={{
                  ...styles.iconBtn,
                  background: isMuted ? 'var(--surface)' : 'var(--token-green)',
                  color: isMuted ? 'var(--text-muted)' : '#fff',
                  boxShadow: isSpeaking
                    ? '0 0 0 3px #4ade80, 0 0 12px #4ade8088'
                    : styles.iconBtn.boxShadow,
                  transition: 'box-shadow 0.1s, background 0.2s',
                }}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Speaker toggle */}
              <button
                onClick={handleToggleSpeaker}
                title={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
                style={{
                  ...styles.iconBtn,
                  background: isSpeakerMuted ? 'var(--token-red)' : 'var(--surface)',
                  color: isSpeakerMuted ? '#fff' : 'var(--text-muted)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {isSpeakerMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </>
          )}
          {settings.showChatInGame && (
            <button onClick={() => setIsChatOpen(v => !v)} style={styles.iconBtn} title="Chat">
              <MessageCircle size={18} />
            </button>
          )}

        </div>
      </div>

      {/* ── Turn Banner ── */}
      {gameState.status === 'playing' && !gameState.winner && (
        <motion.div
          key={turnColor}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.turnBanner,
            borderLeft: `4px solid var(--token-${turnColor})`,
            background: `linear-gradient(90deg, var(--token-${turnColor})18, transparent)`
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: `var(--token-${turnColor})`,
              boxShadow: `0 0 10px var(--token-${turnColor})`
            }}
          />
          <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text)' }}>
            {isMyTurn
              ? '🎯 Your Turn — ' + (diceValue ? 'Pick a token' : 'Roll the dice!')
              : `${turnPlayer?.isBot ? 'Bot ' + turnColor : turnPlayer?.username || turnColor}'s Turn`}
          </span>
        </motion.div>
      )}

      {/* ── Board ── */}
      <div style={styles.boardWrap}>
        <LudoBoard onMoveToken={handleMoveToken} myColor={myColor} />
      </div>

      {/* ── Dice & Controls ── */}
      <div style={styles.controls}>

        {/* WAITING state */}
        {gameState.status === 'waiting' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={styles.waitingCard}>
            <Users size={34} style={{ color: 'var(--accent)', marginBottom: 6 }} />
            <div style={styles.waitTitle}>Waiting for Players</div>
            <div style={styles.waitSub}>{playerCount}/4 Human · {botCount} Bot{botCount !== 1 ? 's' : ''}</div>

            {/* Slot dots */}
            <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
              {['red','green','yellow','blue'].map(c => {
                const p = gameState.players?.find(pl => pl.color === c);
                return (
                  <div key={c} style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: p ? `var(--token-${c})` : 'var(--surface2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 14, color: '#fff',
                    boxShadow: p ? `0 4px 12px var(--token-${c})55` : 'none',
                    border: '2px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s'
                  }}>
                    {p ? (p.isBot ? '🤖' : (p.username?.[0]?.toUpperCase() || '?')) : ''}
                  </div>
                );
              })}
            </div>

            {isHost && (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={handleFillBots} style={styles.secBtn}>
                  <Bot size={16} /> Add Bots
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  style={{ ...styles.secBtn, background: 'var(--token-blue)' }}
                >
                  <UserPlus size={16} />
                </button>
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  style={{ ...styles.secBtn, background: 'var(--token-green)' }}
                  title="Show QR Code"
                >
                  <QrCode size={16} />
                </button>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}?room=${resolvedRoomCode}`;
                    navigator.clipboard.writeText(link);
                    addToast('Invite link copied!', 'success');
                  }}
                  style={styles.secBtn}
                  title="Copy room link"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={handleStartGame}
                  disabled={gameState.players?.length < 2}
                  style={{ ...styles.priBtn, opacity: gameState.players?.length < 2 ? 0.5 : 1 }}
                >
                  Start ▶
                </button>
              </div>
            )}
            {!isHost && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>
                Waiting for host to start…
              </p>
            )}
          </motion.div>
        )}

        {/* PLAYING state */}
        {gameState.status === 'playing' && (
          <AnimatePresence mode="wait">
            {gameState.winner ? (
              <motion.div
                key="winner"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
              >
                <div style={{
                  ...styles.winCard,
                  borderColor: `var(--token-${gameState.winner})`,
                  boxShadow: `0 0 40px var(--token-${gameState.winner})44, var(--shadow-out)`
                }}>
                  <Trophy size={52} style={{ color: `var(--token-${gameState.winner})`, marginBottom: 8 }} />
                  <div style={{ fontWeight: 900, fontSize: 26, color: 'var(--text)', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {gameState.winner} Wins!
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>
                    {gameState.players?.find(p => p.color === gameState.winner)?.username || gameState.winner}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={resetGame} style={styles.secBtn}>
                    <ArrowLeft size={15} /> Menu
                  </button>
                  {isHost && (
                    <button onClick={handleRematch} style={styles.priBtn}>
                      <RotateCw size={15} /> Rematch
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
              >
                <Dice
                  value={diceValue}
                  isRolling={isRollingAnim}
                  canRoll={canRoll}
                  onRoll={handleRollDice}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Emote bar ── */}
      {settings.showEmotes && !gameState.winner && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 10 }}>
          <div style={styles.emoteBar}>
            {['👋','😂','🔥','👏','😱','🎲'].map(e => (
              <button
                key={e}
                onClick={() => socket?.emit(SOCKET_EVENTS.EMOTE_SEND, {
                  roomCode: resolvedRoomCode, emoji: e, uid: user?.uid
                })}
                style={styles.emoteBtn}
                onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.35)'}
                onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} roomCode={resolvedRoomCode} />

      {/* Floating emotes */}
      <EmoteOverlay socket={socket} />

      {/* ── Invite Modal ── */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--surface)', padding: 24, borderRadius: 24, width: '90%', maxWidth: 400, maxHeight: '80vh', overflowY: 'auto', boxShadow: 'var(--shadow-out)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Invite Friends</h3>
                <button onClick={() => setIsInviteModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
              <FriendsList 
                inviteMode={true} 
                onInvite={handleInviteFriend} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── QR Code Modal ── */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--surface)', padding: 24, borderRadius: 24, width: '90%', maxWidth: 300, textAlign: 'center', boxShadow: 'var(--shadow-out)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Scan to Join</h3>
                <button onClick={() => setIsQrModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
              </div>
              <div style={{ background: '#fff', padding: 16, borderRadius: 16, display: 'inline-block' }}>
                <QRCodeCanvas 
                  value={`${window.location.origin}?room=${resolvedRoomCode}`} 
                  size={200} 
                  level="H" 
                />
              </div>
              <p style={{ marginTop: 20, fontWeight: 700, color: 'var(--text-muted)', fontSize: 14 }}>
                Room Code: <span style={{ color: 'var(--text)' }}>{resolvedRoomCode}</span>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Floating emote overlay ────────────────────────────────────────────────────
const EmoteOverlay = ({ socket }) => {
  const [emotes, setEmotes] = useState([]);
  useEffect(() => {
    if (!socket) return;
    const onEmote = (d) => {
      const id = `${Date.now()}-${Math.random()}`;
      setEmotes(prev => [...prev, { ...d, id, x: 10 + Math.random() * 80 }]);
      setTimeout(() => setEmotes(prev => prev.filter(e => e.id !== id)), 3200);
    };
    socket.on(SOCKET_EVENTS.EMOTE_RECEIVED, onEmote);
    return () => socket.off(SOCKET_EVENTS.EMOTE_RECEIVED, onEmote);
  }, [socket]);

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:60, overflow:'hidden' }}>
      <AnimatePresence>
        {emotes.map(e => (
          <motion.div
            key={e.id}
            initial={{ y: '95vh', x: `${e.x}vw`, opacity: 0, scale: 0.4 }}
            animate={{ y: '-10vh', opacity: [0, 1, 1, 0], scale: [0.4, 2, 2, 1] }}
            transition={{ duration: 3, ease: 'easeOut' }}
            style={{ position: 'absolute', fontSize: 36 }}
          >
            {e.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    display: 'flex', flexDirection: 'column', minHeight: '100vh',
    background: 'var(--bg)', overflow: 'hidden', position: 'relative'
  },
  loading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)'
  },
  spinner: {
    width: 48, height: 48, borderRadius: '50%',
    border: '5px solid var(--accent)', borderTopColor: 'transparent'
  },
  loadingText: {
    marginTop: 20, fontWeight: 900, color: 'var(--text-muted)',
    fontSize: 13, letterSpacing: 3, textTransform: 'uppercase'
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', zIndex: 10
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: 'var(--surface)',
    border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-out)',
    color: 'var(--text)', transition: 'transform 0.15s, box-shadow 0.15s',
    flexShrink: 0
  },
  roomInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  roomLabel: { fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 3, textTransform: 'uppercase', opacity: 0.6 },
  roomCode: { fontWeight: 900, fontSize: 16, color: 'var(--accent)', letterSpacing: 1 },
  turnBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 16px', marginHorizontal: 16,
    borderRadius: 12, margin: '0 16px 4px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  boardWrap: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '4px 8px', flex: '0 0 auto'
  },
  controls: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 16px', flex: 1, justifyContent: 'center'
  },
  waitingCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, padding: '24px 28px', borderRadius: 24,
    background: 'var(--surface)', boxShadow: 'var(--shadow-out)'
  },
  waitTitle: { fontWeight: 900, fontSize: 18, color: 'var(--text)' },
  waitSub: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 },
  winCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '24px 32px', borderRadius: 24, background: 'var(--surface)',
    border: '3px solid', animation: 'none'
  },
  priBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '12px 24px', borderRadius: 18, border: 'none',
    background: 'var(--accent)', color: '#fff', fontWeight: 900,
    fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.2)'
  },
  secBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '12px 20px', borderRadius: 18, border: 'none',
    background: 'var(--surface2)', color: 'var(--text)', fontWeight: 900,
    fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-out)'
  },
  emoteBar: {
    display: 'flex', gap: 2, background: 'var(--surface)',
    padding: '6px 10px', borderRadius: 999, boxShadow: 'var(--shadow-out)'
  },
  emoteBtn: {
    width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer',
    borderRadius: '50%', fontSize: 19, display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'transform 0.15s'
  }
};

export default GamePage;