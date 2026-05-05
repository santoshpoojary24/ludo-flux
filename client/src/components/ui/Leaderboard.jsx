import React, { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Leaderboard = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/leaderboard`)
            .then(res => res.json())
            .then(data => {
                setPlayers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading leaderboard...</div>;
    }

    if (players.length === 0) {
        return <div className="text-center py-8 text-text-muted">No players yet</div>;
    }

    return (
        <div className="bg-surface rounded-3xl p-4 shadow-out">
            <h3 className="text-xl font-black flex items-center gap-2 mb-4">
                <Trophy size={24} /> Global Leaderboard
            </h3>
            <div className="space-y-2">
                {players.map((player, idx) => (
                    <div key={player.uid} className="flex items-center gap-3 p-3 bg-surface2 rounded-xl">
                        <div className="w-8 font-black text-lg">{idx + 1}</div>
                        <div className="flex-1">
                            <div className="font-bold">{player.username}</div>
                            <div className="text-xs text-text-muted">ELO {player.elo}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-black text-accent">{player.winRate}%</div>
                            <div className="text-xs text-text-muted">{player.total_matches} matches</div>
                        </div>
                        {idx === 0 && <Medal className="text-token-yellow" size={20} />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;