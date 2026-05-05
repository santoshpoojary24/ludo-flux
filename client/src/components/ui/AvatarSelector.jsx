import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Predefined cool avatars (emoji + color combinations)
const AVATAR_PRESETS = [
    { id: 'warrior',  name: 'Warrior', icon: '⚔️',  bg: 'bg-red-500',    color: '#f87171', outfitColor: 'red'    },
    { id: 'mage',     name: 'Mage',    icon: '🔮',  bg: 'bg-purple-500', color: '#a855f7', outfitColor: 'violet' },
    { id: 'archer',   name: 'Archer',  icon: '🏹',  bg: 'bg-green-500',  color: '#4ade80', outfitColor: 'green'  },
    { id: 'ninja',    name: 'Ninja',   icon: '🥷',  bg: 'bg-gray-700',   color: '#6b7280', outfitColor: 'blue'   },
    { id: 'pirate',   name: 'Pirate',  icon: '🏴‍☠️', bg: 'bg-amber-700',  color: '#d97706', outfitColor: 'peach'  },
    { id: 'robot',    name: 'Robot',   icon: '🤖',  bg: 'bg-cyan-500',   color: '#06b6d4', outfitColor: 'mint'   },
    { id: 'wizard',   name: 'Wizard',  icon: '🧙',  bg: 'bg-indigo-500', color: '#6366f1', outfitColor: 'violet' },
    { id: 'knight',   name: 'Knight',  icon: '🛡️',  bg: 'bg-slate-500',  color: '#64748b', outfitColor: 'blue'   },
    { id: 'dragon',   name: 'Dragon',  icon: '🐉',  bg: 'bg-orange-500', color: '#f97316', outfitColor: 'rose'   },
    { id: 'phoenix',  name: 'Phoenix', icon: '🔥',  bg: 'bg-rose-500',   color: '#f43f5e', outfitColor: 'rose'   },
    { id: 'elf',      name: 'Elf',     icon: '🧝',  bg: 'bg-emerald-500',color: '#10b981', outfitColor: 'mint'   },
    { id: 'dwarf',    name: 'Dwarf',   icon: '⛏️',  bg: 'bg-amber-800',  color: '#b45309', outfitColor: 'peach'  }
];

const AvatarSelector = ({ isOpen, onClose, currentAvatar, onAvatarSelected }) => {
    const { token, addToast } = useGameStore();
    const [selected, setSelected] = useState(currentAvatar?.bodyShape ? null : AVATAR_PRESETS[0]);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (preset) => {
        setSelected(preset);
        if (!token) {
            addToast('Please log in to change avatar', 'warning');
            return;
        }

        setLoading(true);
        try {
            const avatarConfig = {
                bodyShape: 'round',
                eyes: 'sparkle',
                mouth: 'smile',
                accessory: 'crown',
                outfitColor: preset.outfitColor,  // valid server value
                frame: 'gold',
                icon: preset.icon,               // emoji shown in UI
                bgColor: preset.color            // hex color shown in UI
            };
            const res = await fetch(`${API_URL}/api/profile/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ avatarConfig })
            });
            if (res.ok) {
                addToast('Avatar updated!', 'success');
                if (onAvatarSelected) onAvatarSelected(avatarConfig);
                onClose();
            } else {
                const err = await res.json();
                addToast(err.error || 'Failed to update avatar', 'error');
            }
        } catch (err) {
            addToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-surface rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-black">Choose Your Avatar</h2>
                            <button onClick={onClose} className="p-2 rounded-full bg-surface2"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {AVATAR_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handleSelect(preset)}
                                    className={`relative p-4 rounded-2xl transition-all ${selected?.id === preset.id ? 'ring-4 ring-accent scale-105' : 'hover:scale-105'
                                        } bg-surface2`}
                                    style={{ background: `${preset.color}20` }}
                                >
                                    <div className="text-5xl mb-2">{preset.icon}</div>
                                    <div className="font-bold text-sm">{preset.name}</div>
                                    {selected?.id === preset.id && (
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                            <Check size={14} color="white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {loading && <div className="text-center mt-4 text-accent font-bold">Saving...</div>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AvatarSelector;