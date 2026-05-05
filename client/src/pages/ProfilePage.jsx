import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Edit3, Save, X, Trophy, Coins, Camera } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import AvatarSelector from '../components/ui/AvatarSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProfilePage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token, addToast, updateUserProfile } = useGameStore();
  const targetUid = uid || currentUser?.uid;
  const isOwnProfile = !uid || uid === currentUser?.uid;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const fetchProfile = async () => {
    if (!targetUid) return;
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [profileRes, statsRes, matchesRes] = await Promise.all([
        fetch(`${API_URL}/api/profile/${targetUid}/summary`, { headers }),
        fetch(`${API_URL}/api/profile/${targetUid}/stats`, { headers }),
        fetch(`${API_URL}/api/profile/${targetUid}/matches?limit=10`, { headers })
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (matchesRes.ok) setMatches((await matchesRes.json()).items || []);
    } catch (err) {
      addToast?.('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetUid, token]);

  const updateStatus = async () => {
    if (!isOwnProfile) return;
    try {
      const res = await fetch(`${API_URL}/api/profile/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statusMessage: newStatus })
      });
      if (res.ok) {
        setProfile(prev => ({ ...prev, statusMessage: newStatus }));
        updateUserProfile({ statusMessage: newStatus });
        addToast('Status updated', 'success');
        setEditingStatus(false);
      } else {
        addToast('Update failed', 'error');
      }
    } catch (err) {
      addToast('Update failed', 'error');
    }
  };

  const updateUsername = async () => {
    if (!isOwnProfile) return;
    if (!/^[A-Za-z0-9_]{3,20}$/.test(newUsername)) {
      setUsernameError('3-20 letters, numbers, underscores only');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/username`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateUserProfile({ username: newUsername });
      addToast('Username changed! -200 coins', 'success');
      setEditingUsername(false);
      fetchProfile(); // refresh
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-muted">Profile not found</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-accent rounded-xl font-bold">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Banner */}
      <div className={`h-48 w-full relative bg-gradient-to-r from-${profile.bannerTint || 'blue'}-500 to-${profile.bannerTint || 'blue'}-700`}>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-white backdrop-blur-md"
        >
          <ArrowLeft size={20} />
        </button>
        {isOwnProfile && (
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-white backdrop-blur-md">
            <Settings size={20} />
          </button>
        )}
      </div>

      {/* Profile header */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="bg-surface rounded-3xl p-6 shadow-out border border-border">
          <div className="flex items-end gap-4 mb-6">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full border-4 border-surface shadow-lg flex items-center justify-center font-black"
                style={{
                  background: profile.avatarConfig?.bgColor
                    ? `${profile.avatarConfig.bgColor}33`
                    : 'linear-gradient(135deg, var(--accent, #6366f1), var(--token-blue, #3b82f6))',
                  fontSize: profile.avatarConfig?.icon ? '2.5rem' : '2rem',
                  color: profile.avatarConfig?.bgColor || 'white',
                  border: profile.avatarConfig?.bgColor
                    ? `3px solid ${profile.avatarConfig.bgColor}`
                    : undefined,
                }}
              >
                {profile.avatarConfig?.icon || (
                  <span className="text-white text-4xl">
                    {profile.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold border-2 border-surface hover:scale-110 transition-transform"
                >
                  <Camera size={14} />
                </button>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-text">{profile.username}</h1>
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setNewUsername(profile.username);
                      setEditingUsername(true);
                    }}
                    className="p-1 rounded-full bg-surface2"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm font-bold text-text-muted">UID: {profile.uid}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold bg-surface2 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Coins size={12} /> {profile.coins ?? currentUser?.coins}
                </span>
                <span className="text-xs font-bold bg-surface2 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Trophy size={12} /> ELO {profile.elo ?? currentUser?.elo}
                </span>
              </div>
            </div>
          </div>

          {/* Status with edit */}
          <div className="bg-surface2 rounded-2xl p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Status</span>
              {isOwnProfile && !editingStatus && (
                <button
                  onClick={() => {
                    setNewStatus(profile.statusMessage || '');
                    setEditingStatus(true);
                  }}
                  className="text-accent"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            {editingStatus ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  maxLength="60"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-surface text-text"
                  autoFocus
                />
                <button onClick={updateStatus} className="px-3 py-2 bg-token-green rounded-xl">
                  <Save size={16} />
                </button>
                <button onClick={() => setEditingStatus(false)} className="px-3 py-2 bg-token-red rounded-xl">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p className="text-text font-medium italic mt-1">"{profile.statusMessage || 'No status set'}"</p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface2 p-3 rounded-2xl text-center">
              <div className="text-accent font-black text-xl">{stats?.winRate || 0}%</div>
              <div className="text-[10px] font-bold uppercase">Win Rate</div>
            </div>
            <div className="bg-surface2 p-3 rounded-2xl text-center">
              <div className="text-token-green font-black text-xl">{stats?.totalWins || 0}</div>
              <div className="text-[10px] font-bold uppercase">Wins</div>
            </div>
            <div className="bg-surface2 p-3 rounded-2xl text-center">
              <div className="text-token-blue font-black text-xl">{stats?.totalMatchesPlayed || 0}</div>
              <div className="text-[10px] font-bold uppercase">Matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent matches */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-black mb-3">Recent Matches</h2>
        <div className="space-y-2">
          {matches.slice(0, 5).map(match => (
            <div key={match.id} className="bg-surface rounded-2xl p-3 flex justify-between items-center">
              <span className="font-bold text-text-muted">{match.gameMode}</span>
              <span className={`font-black ${match.result === 'win' ? 'text-token-green' : 'text-token-red'}`}>
                {match.result.toUpperCase()}
              </span>
              <span className="text-xs text-text-muted">{new Date(match.playedAt).toLocaleDateString()}</span>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="text-center text-text-muted py-8">No matches yet</div>
          )}
        </div>
      </div>

      {/* Username edit modal */}
      <AnimatePresence>
        {editingUsername && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-surface rounded-3xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-black mb-4">Change Username</h3>
              <p className="text-sm text-text-muted mb-2">Cost: 200 coins</p>
              <input
                type="text"
                value={newUsername}
                onChange={e => {
                  setNewUsername(e.target.value);
                  setUsernameError('');
                }}
                className="w-full p-3 rounded-xl bg-surface2 mb-2"
                placeholder="New username"
              />
              {usernameError && <p className="text-token-red text-sm mb-2">{usernameError}</p>}
              <div className="flex gap-3">
                <button onClick={updateUsername} className="flex-1 py-3 bg-accent rounded-xl font-black">
                  Save
                </button>
                <button onClick={() => setEditingUsername(false)} className="flex-1 py-3 bg-surface2 rounded-xl font-black">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar selector modal */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatar={profile?.avatarConfig}
        onAvatarSelected={(config) => {
          updateUserProfile({ avatarConfig: config });
          fetchProfile();
        }}
      />
    </div>
  );
};

export default ProfilePage;