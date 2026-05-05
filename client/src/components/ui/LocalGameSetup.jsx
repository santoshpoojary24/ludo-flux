import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users } from 'lucide-react';

const COLORS = ['red', 'green', 'yellow', 'blue'];
const COLOR_NAMES = {
    red: '🔴 Red',
    green: '🟢 Green',
    yellow: '🟡 Yellow',
    blue: '🔵 Blue'
};

const LocalGameSetup = ({ onStart, onClose }) => {
    const [players, setPlayers] = useState([
        { name: 'Player 1', color: 'red' },
        { name: 'Player 2', color: 'green' },
        { name: 'Player 3', color: 'yellow' },
        { name: 'Player 4', color: 'blue' }
    ]);

    const updatePlayer = (index, field, value) => {
        const updated = [...players];
        updated[index][field] = value;
        setPlayers(updated);
    };

    const startGame = () => {
        const names = players.map(p => p.name.trim());
        if (new Set(names).size !== names.length) {
            alert('Player names must be unique');
            return;
        }
        onStart(players);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-surface rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-black flex items-center gap-2">
                        <Users size={24} /> Local Game Setup
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full bg-surface2">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-4">
                    {players.map((player, idx) => (
                        <div key={idx} className="bg-surface2 rounded-2xl p-3">
                            <div className="flex gap-3 items-center">
                                <input
                                    type="text"
                                    value={player.name}
                                    onChange={e => updatePlayer(idx, 'name', e.target.value)}
                                    className="flex-1 p-2 rounded-xl bg-surface text-text font-bold"
                                    placeholder={`Player ${idx + 1}`}
                                />
                                <select
                                    value={player.color}
                                    onChange={e => updatePlayer(idx, 'color', e.target.value)}
                                    className="p-2 rounded-xl bg-surface font-bold"
                                    style={{ color: `var(--token-${player.color})` }}
                                >
                                    {COLORS.map(c => (
                                        <option key={c} value={c}>
                                            {COLOR_NAMES[c]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={startGame}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-token-green to-token-blue rounded-2xl font-black text-white text-lg shadow-lg"
                >
                    Start Local Game
                </button>
            </motion.div>
        </motion.div>
    );
};

export default LocalGameSetup;