import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';

const EMOTES = ['👍', '😂', '😭', '🔥', '💀', '🎉', '😡', '🤯'];

const EmoteBar = ({ roomCode }) => {
    const { socket } = useSocket();
    const { user } = useGameStore();
    const [floatingEmotes, setFloatingEmotes] = useState([]);

    const sendEmote = (emoji) => {
        if (!socket) return;
        socket.emit('emote:send', { roomCode, emoji, uid: user?.uid });
        addFloating(emoji);
    };

    const addFloating = (emoji) => {
        const id = Date.now() + Math.random();
        const x = 20 + Math.random() * 60; // random x between 20-80%
        setFloatingEmotes(prev => [...prev, { id, emoji, x }]);
        setTimeout(() => {
            setFloatingEmotes(prev => prev.filter(e => e.id !== id));
        }, 2000);
    };

    // Listen for incoming emotes from other players
    React.useEffect(() => {
        if (!socket) return;
        const handler = ({ emoji, uid }) => {
            if (uid !== user?.uid) addFloating(emoji);
        };
        socket.on('emote:received', handler);
        return () => socket.off('emote:received', handler);
    }, [socket, user]);

    return (
        <>
            {/* Floating emotes */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60, overflow: 'hidden' }}>
                <AnimatePresence>
                    {floatingEmotes.map(({ id, emoji, x }) => (
                        <motion.div
                            key={id}
                            initial={{ y: '80vh', x: `${x}vw`, opacity: 1, scale: 0.5 }}
                            animate={{ y: '20vh', opacity: 0, scale: 2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.8, ease: 'easeOut' }}
                            style={{ position: 'absolute', fontSize: 40, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                        >
                            {emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Emote picker bar */}
            <div style={{
                display: 'flex',
                gap: 6,
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: 40,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
                {EMOTES.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => sendEmote(emoji)}
                        style={{
                            width: 36, height: 36,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'transparent',
                            fontSize: 20,
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.85)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </>
    );
};

export default EmoteBar;
