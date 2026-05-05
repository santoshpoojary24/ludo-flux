import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChallengeModal = ({ friend, onClose, onSend }) => {
    const [stake, setStake] = useState(100);
    const [mode, setMode] = useState('Classic');

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
            }}
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                style={{ 
                    width: '100%', maxWidth: 360, background: 'var(--surface)', 
                    borderRadius: 28, padding: 30, boxShadow: 'var(--shadow-out)',
                    display: 'flex', flexDirection: 'column', gap: 24
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: 22, color: 'var(--text)', fontFamily: 'var(--font)' }}>Challenge</h3>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>Invite <b>{friend.username}</b> to a match</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 13, color: 'var(--text-muted)' }}>
                        <span>COIN STAKE</span>
                        <span style={{ color: 'var(--token-yellow)' }}>🪙 {stake}</span>
                    </div>
                    <input 
                        type="range" min="0" max="500" step="50" 
                        value={stake} onChange={e => setStake(parseInt(e.target.value))}
                        style={{ width: '100%', height: 6, borderRadius: 3, appearance: 'none', background: 'var(--surface2)', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-muted)' }}>GAME MODE</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['Classic', 'Quick'].map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                style={{ 
                                    flex: 1, padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                                    fontWeight: 900, fontSize: 12, transition: 'all 0.2s',
                                    background: mode === m ? 'var(--accent)' : 'var(--surface2)',
                                    color: mode === m ? '#fff' : 'var(--text-muted)',
                                    boxShadow: mode === m ? '0 4px 12px rgba(var(--accent-rgb), 0.3)' : 'none'
                                }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button 
                        onClick={onClose}
                        style={{ flex: 1, padding: '16px', borderRadius: 16, border: 'none', background: 'var(--surface2)', color: 'var(--text)', fontWeight: 900, cursor: 'pointer' }}
                    >CANCEL</button>
                    <button 
                        onClick={() => onSend({ toUid: friend.uid, stake, mode })}
                        style={{ flex: 2, padding: '16px', borderRadius: 16, border: 'none', background: 'var(--token-green)', color: '#fff', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 16px rgba(34,197,94,0.3)' }}
                    >SEND CHALLENGE</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChallengeModal;
