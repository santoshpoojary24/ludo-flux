import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();
  const diffSeconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) return 'just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return new Date(value).toLocaleDateString();
};

const getInitials = (username = '') =>
  username
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const formatEventText = (event) => {
  const username = event.username || 'Friend';
  const payload = event.payload || {};

  switch (event.event_type || event.eventType) {
    case 'win':
      return `${username} won a match against ${Math.max((payload.players || 1) - 1, 1)} players`;
    case 'capture':
      return `${username} captured ${payload.count || 1} token${payload.count === 1 ? '' : 's'} in one game`;
    case 'spin':
      return `${username} spun the wheel and got ${payload.coins || 0} coins`;
    case 'badge':
      return `${username} earned the badge: ${payload.badgeName || 'New Badge'}`;
    default:
      return `${username} made progress in Ludo Flux`;
  }
};

const ActivityFeed = () => {
  const { token } = useGameStore();
  const { socket } = useSocket();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    let ignore = false;

    const loadFeed = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/feed?limit=20`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch feed');
        }

        const data = await response.json();
        if (!ignore) {
          setEvents(Array.isArray(data) ? data.slice(0, 20) : []);
        }
      } catch (error) {
        console.error('Failed to fetch feed', error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNewEvent = (event) => {
      setEvents((previous) => [event, ...previous].slice(0, 20));
    };

    socket.on('feed:new_event', onNewEvent);

    return () => {
      socket.off('feed:new_event', onNewEvent);
    };
  }, [socket]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            style={{
              height: 68,
              borderRadius: 18,
              background: 'var(--surface2)',
              boxShadow: 'var(--shadow-in)',
              animation: 'activity-pulse 1.6s ease-in-out infinite'
            }}
          />
        ))}
        <style>{`
          @keyframes activity-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.55; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        minHeight: 280
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18, fontWeight: 900 }}>
          Friend Activity
        </h3>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }}>
          Last 20 events
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
          paddingRight: 4
        }}
      >
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.article
              key={event.id || `${event.userUid}-${event.created_at}`}
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
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
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, var(--token-green), var(--accent))',
                  color: '#fff',
                  fontWeight: 900
                }}
              >
                {getInitials(event.username)}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    color: 'var(--text)',
                    fontSize: 13,
                    lineHeight: 1.45,
                    fontWeight: 700
                  }}
                >
                  {formatEventText(event)}
                </div>
                <div
                  style={{
                    marginTop: 5,
                    color: 'var(--text-muted)',
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4
                  }}
                >
                  {getRelativeTime(event.created_at)}
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {!events.length ? (
          <div
            style={{
              padding: '26px 18px',
              borderRadius: 18,
              background: 'var(--surface2)',
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontWeight: 700,
              boxShadow: 'var(--shadow-in)'
            }}
          >
            No recent friend activity yet.
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ActivityFeed;
