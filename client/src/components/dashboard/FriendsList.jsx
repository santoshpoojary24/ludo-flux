import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';
import ChallengeModal from './ChallengeModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STATUS_META = {
  online: {
    color: '#22c55e',
    label: 'Online'
  },
  ingame: {
    color: '#f59e0b',
    label: 'In Game'
  },
  offline: {
    color: '#94a3b8',
    label: 'Offline'
  }
};

const STATUS_ORDER = {
  online: 0,
  ingame: 1,
  offline: 2
};

const getInitials = (username = '') =>
  username
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';

const FriendsListSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {[1, 2, 3].map((row) => (
      <div
        key={row}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 18,
          background: 'var(--surface2)',
          boxShadow: 'var(--shadow-in)',
          animation: 'friends-pulse 1.6s ease-in-out infinite'
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <div style={{ width: '42%', height: 12, borderRadius: 999, background: 'var(--border)' }} />
          <div style={{ width: '28%', height: 10, borderRadius: 999, background: 'var(--border)' }} />
        </div>
      </div>
    ))}
    <style>{`
      @keyframes friends-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.55; }
      }
    `}</style>
  </div>
);

const FriendsList = ({ reloadKey = 0, onDeleteFriend }) => {
  const { token, setRoomCode, addToast } = useGameStore();
  const { socket } = useSocket();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const fetchFriends = React.useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/friends`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load friends');
      }

      const data = await response.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch friends', error);
      addToast('Could not load friends', 'warning');
    } finally {
      setLoading(false);
    }
  }, [addToast, token]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends, reloadKey]);

  useEffect(() => {
    if (!socket) return undefined;

    const onStatusChange = ({ uid, status }) => {
      setFriends((previous) =>
        previous.map((friend) => (friend.uid === uid ? { ...friend, status } : friend))
      );

      if (status === 'ingame' || status === 'offline') {
        fetchFriends();
      }
    };

    socket.on('friend:status_change', onStatusChange);

    return () => {
      socket.off('friend:status_change', onStatusChange);
    };
  }, [fetchFriends, socket]);

  const sortedFriends = [...friends].sort((left, right) => {
    const statusDelta = (STATUS_ORDER[left.status] ?? 99) - (STATUS_ORDER[right.status] ?? 99);
    if (statusDelta !== 0) return statusDelta;
    return left.username.localeCompare(right.username);
  });

  const handleChallengeSend = ({ toUid, stake, mode }) => {
    if (!socket) return;

    socket.emit('challenge:send', { toUid, stake, mode });
    addToast('Challenge sent', 'info');
    setSelectedFriend(null);
  };

  const handleDeleteFriend = async (friendUid, friendName) => {
    if (!window.confirm(`Remove ${friendName} from your friends list?`)) return;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/friends/${friendUid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete friend');
      }

      addToast(`${friendName} removed`, 'success');
      if (onDeleteFriend) {
        onDeleteFriend(friendUid);
      } else {
        fetchFriends(); // refresh list
      }
    } catch (error) {
      console.error('Delete friend error:', error);
      addToast('Could not delete friend', 'error');
    }
  };

  if (loading) {
    return <FriendsListSkeleton />;
  }

  if (!friends.length) {
    return (
      <div
        style={{
          padding: '28px 18px',
          borderRadius: 18,
          textAlign: 'center',
          background: 'var(--surface2)',
          color: 'var(--text-muted)',
          fontWeight: 700,
          boxShadow: 'var(--shadow-in)'
        }}
      >
        No friends added yet.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedFriends.map((friend) => {
          const statusMeta = STATUS_META[friend.status] || STATUS_META.offline;
          const canChallenge = friend.status === 'online';
          const canJoin = friend.status === 'ingame' && friend.canJoin && friend.roomCode;

          return (
            <div
              key={friend.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 18,
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-out)'
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, var(--accent), var(--token-blue))',
                    color: '#fff',
                    fontWeight: 900,
                    letterSpacing: 0.5
                  }}
                >
                  {getInitials(friend.username)}
                </div>
                <span
                  title={statusMeta.label}
                  style={{
                    position: 'absolute',
                    right: 1,
                    bottom: 1,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: statusMeta.color,
                    border: '2px solid var(--surface)'
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 900,
                    color: 'var(--text)',
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {friend.username}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 4,
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: 700,
                    flexWrap: 'wrap'
                  }}
                >
                  <span>{friend.uid}</span>
                  <span style={{ color: statusMeta.color }}>{statusMeta.label}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {canChallenge ? (
                  <button
                    onClick={() => setSelectedFriend(friend)}
                    style={{
                      border: 'none',
                      borderRadius: 12,
                      padding: '10px 14px',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 11,
                      cursor: 'pointer',
                      boxShadow: '0 10px 24px rgba(0,0,0,0.12)'
                    }}
                  >
                    Challenge
                  </button>
                ) : null}

                {friend.status === 'ingame' ? (
                  canJoin ? (
                    <button
                      onClick={() => setRoomCode(friend.roomCode)}
                      style={{
                        border: 'none',
                        borderRadius: 12,
                        padding: '10px 14px',
                        background: 'var(--token-green)',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: 11,
                        cursor: 'pointer',
                        boxShadow: '0 10px 24px rgba(34,197,94,0.2)'
                      }}
                    >
                      Join
                    </button>
                  ) : (
                    <span
                      style={{
                        padding: '9px 12px',
                        borderRadius: 12,
                        background: 'var(--surface2)',
                        color: 'var(--text-muted)',
                        fontWeight: 800,
                        fontSize: 11,
                        boxShadow: 'var(--shadow-in)'
                      }}
                    >
                      Private room
                    </span>
                  )
                ) : null}

                <button
                  onClick={() => handleDeleteFriend(friend.uid, friend.username)}
                  style={{
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 14px',
                    background: 'var(--token-red)',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: 11,
                    cursor: 'pointer',
                    boxShadow: '0 10px 24px rgba(239,68,68,0.2)'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedFriend ? (
          <ChallengeModal
            friend={selectedFriend}
            onClose={() => setSelectedFriend(null)}
            onSend={handleChallengeSend}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default FriendsList;