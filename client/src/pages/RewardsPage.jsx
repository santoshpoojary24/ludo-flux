import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Coins, CheckCircle, Loader, CircleDashed } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const RewardsPage = () => {
  const navigate = useNavigate();
  const { user, token, updateUserProfile } = useGameStore();
  
  const [spinAvailable, setSpinAvailable] = useState(false);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [claimingKey, setClaimingKey] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/rewards/daily`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSpinAvailable(data.spin_available);
        setQuests(data.quests);
      }
    } catch (err) {
      console.error('Failed to fetch rewards', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (!spinAvailable) return;
    
    setSpinning(true);
    setError('');
    setSpinResult(null);
    
    // Fake spin animation delay
    setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/rewards/spin`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setSpinResult(data.message);
          setSpinAvailable(false);
          updateUserProfile({ coins: data.new_balance });
        } else {
          setError(data.error || 'Failed to spin');
        }
      } catch (err) {
        setError('Error spinning wheel');
      } finally {
        setSpinning(false);
      }
    }, 2000);
  };

  const claimQuest = async (quest) => {
    if (quest.current_value < quest.target_value || quest.is_claimed) return;
    
    setClaimingKey(quest.quest_key);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/rewards/claim-quest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quest_key: quest.quest_key })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Update local quest state
        setQuests(quests.map(q => q.quest_key === quest.quest_key ? { ...q, is_claimed: true } : q));
        updateUserProfile({ coins: data.new_balance });
      } else {
        setError(data.error || 'Failed to claim');
      }
    } catch (err) {
      setError('Error claiming quest');
    } finally {
      setClaimingKey(null);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20 pb-20 t-bg">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 rounded-3xl shadow-clay bg-clay-surface">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
            >
              <ArrowLeft size={20} className="t-text" />
            </button>
            <h1 className="text-2xl font-black t-text">Daily Rewards</h1>
          </div>
          
          <div className="px-4 py-2 rounded-2xl bg-yellow-500/10 text-yellow-600 font-bold flex items-center gap-2">
            <Coins size={20} />
            {user?.coins || 0}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Daily Spin Wheel Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2 t-text">
                <Gift size={24} className="text-primary" /> Daily Spin
              </h2>
              
              <div className="p-8 rounded-3xl shadow-clay bg-clay-surface flex flex-col items-center justify-center gap-6 min-h-[300px] text-center">
                <div className={`relative w-40 h-40 flex items-center justify-center ${spinning ? 'animate-spin' : ''}`}>
                  {/* Fake Wheel Visual */}
                  <div className="absolute inset-0 rounded-full border-8 border-primary/20 border-t-primary" style={{ transform: spinning ? 'none' : 'rotate(45deg)' }}></div>
                  <div className="absolute inset-2 rounded-full border-4 border-dashed border-primary/40"></div>
                  <Gift size={48} className={`text-primary ${spinning ? 'animate-pulse' : ''}`} />
                </div>
                
                <div className="flex flex-col gap-2 h-16 justify-center">
                  {spinResult ? (
                    <div className="text-lg font-black text-green-500 animate-bounce">
                      🎉 {spinResult} 🎉
                    </div>
                  ) : (
                    <p className="text-sm font-medium t-text opacity-70">
                      {spinAvailable ? 'Spin the wheel to win coins or rare cosmetics!' : 'Come back tomorrow for another spin!'}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSpin}
                  disabled={!spinAvailable || spinning}
                  className={`w-full py-3 rounded-xl shadow-clay font-black text-lg transition-all ${
                    !spinAvailable ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                    spinning ? 'bg-primary/50 text-white cursor-wait' :
                    'bg-primary text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {spinning ? 'Spinning...' : spinAvailable ? 'SPIN NOW!' : 'Already Spun'}
                </button>
              </div>
            </div>

            {/* Daily Quests Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2 t-text">
                <CheckCircle size={24} className="text-green-500" /> Daily Quests
              </h2>
              
              <div className="flex flex-col gap-4">
                {quests.map(quest => {
                  const isComplete = quest.current_value >= quest.target_value;
                  const percent = Math.min(100, Math.round((quest.current_value / quest.target_value) * 100));
                  
                  return (
                    <div key={quest.id} className="p-4 rounded-2xl shadow-clay bg-clay-surface flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{quest.description}</span>
                        <div className="flex items-center gap-1 font-bold text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded-lg text-sm">
                          <Coins size={14} /> {quest.reward_coins}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-bold opacity-50">
                          <span>Progress</span>
                          <span>{Math.min(quest.current_value, quest.target_value)} / {quest.target_value}</span>
                        </div>
                        <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-primary'}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => claimQuest(quest)}
                        disabled={!isComplete || quest.is_claimed || claimingKey === quest.quest_key}
                        className={`w-full py-2 mt-1 rounded-xl shadow-clay font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                          quest.is_claimed ? 'bg-green-500/20 text-green-600 cursor-default' :
                          !isComplete ? 'bg-black/5 t-text opacity-50 cursor-not-allowed' :
                          'bg-primary text-white hover:scale-105 active:scale-95'
                        }`}
                      >
                        {claimingKey === quest.quest_key ? <Loader size={16} className="animate-spin" /> : null}
                        {quest.is_claimed ? 'Claimed' : !isComplete ? 'In Progress' : 'Claim Reward'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default RewardsPage;
