import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, X, Trophy, Coins, Camera, Swords, Clock, Star, BarChart2, Award, Settings, Grid } from 'lucide-react';

import { useGameStore } from '../store/gameStore';

import AvatarSelector from '../components/ui/AvatarSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mini tab button
const Tab = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    flex: 1, padding: '10px 4px', border: 'none', borderRadius: 12, cursor: 'pointer',
    fontFamily: "'Quicksand', sans-serif", fontWeight: 800, fontSize: 12,
    background: active ? 'linear-gradient(135deg,#B8860B,#FFD700)' : 'transparent',
    color: active ? '#1A120B' : '#A08060', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  }}>
    {icon}{label}
  </button>
);

const RANK_TIERS = [
  { name: 'Bronze',   min: 0,    color: '#CD7F32', icon: '🥉' },
  { name: 'Silver',   min: 700,  color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold',     min: 900,  color: '#FFD700', icon: '🥇' },
  { name: 'Platinum', min: 1100, color: '#E5E4E2', icon: '💎' },
  { name: 'Diamond',  min: 1400, color: '#B9F2FF', icon: '👑' },
  { name: 'Flux',     min: 2000, color: '#FF6B9D', icon: '⚡' },
];

const getRank = (elo = 0) =>
  [...RANK_TIERS].reverse().find(t => elo >= t.min) || RANK_TIERS[0];

const StatCard = ({ value, label, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,215,0,0.15)',
      borderRadius: 16, padding: '14px 10px', textAlign: 'center',
      backdropFilter: 'blur(8px)',
    }}
  >
    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 22, color: color || '#FFD700' }}>{value}</div>
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: '#A08060', marginTop: 4, textTransform: 'uppercase', fontFamily: "'Quicksand', sans-serif" }}>{label}</div>
  </motion.div>
);

const ProfilePage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token, addToast, updateUserProfile, toggleSettings } = useGameStore();

  const targetUid = uid || currentUser?.uid;
  const isOwnProfile = !uid || uid === currentUser?.uid;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const fetchProfile = async () => {
    if (!targetUid) return;
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Promise.allSettled so one failing endpoint doesn't block the whole page
      const [profileRes, statsRes, matchesRes, badgesRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/profile/${targetUid}/summary`, { headers }),
        fetch(`${API_URL}/api/profile/${targetUid}/stats`, { headers }),
        fetch(`${API_URL}/api/profile/${targetUid}/matches?limit=10`, { headers }),
        fetch(`${API_URL}/api/profile/${targetUid}/achievements`, { headers }),
      ]);
      if (profileRes.status === 'fulfilled' && profileRes.value.ok)
        setProfile(await profileRes.value.json());
      if (statsRes.status === 'fulfilled' && statsRes.value.ok)
        setStats(await statsRes.value.json());
      if (matchesRes.status === 'fulfilled' && matchesRes.value.ok)
        setMatches((await matchesRes.value.json()).items || []);
      if (badgesRes.status === 'fulfilled' && badgesRes.value.ok) {
        const bd = await badgesRes.value.json();
        setBadges(bd.items || []);
      }
    } catch {
      addToast?.('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { fetchProfile(); }, [targetUid, token]);

  const updateStatus = async () => {
    setStatusError('');
    try {
      const res = await fetch(`${API_URL}/api/profile/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statusMessage: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(p => ({ ...p, statusMessage: data.statusMessage ?? newStatus }));
        updateUserProfile({ statusMessage: data.statusMessage ?? newStatus });
        addToast('Bio updated! ✓', 'success');
        setEditingStatus(false);
      } else {
        setStatusError(data.error || 'Update failed');
      }
    } catch { setStatusError('Network error'); }
  };

  const updateUsername = async () => {
    setUsernameError('');
    if (!/^[A-Za-z0-9_]{3,20}$/.test(newUsername)) {
      setUsernameError('3–20 letters, numbers or underscores only'); return;
    }
    try {
      // The correct endpoint is PATCH /api/auth/username
      const res = await fetch(`${API_URL}/api/auth/username`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername })
      });
      const data = await res.json();
      if (!res.ok) { setUsernameError(data.error || 'Failed to change username'); return; }
      updateUserProfile({ username: newUsername });
      addToast('Username changed! -200 coins ✓', 'success');
      setEditingUsername(false);
      fetchProfile();
    } catch { setUsernameError('Network error — try again'); }
  };

  /* ── Loading ──────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#1A120B,#0D0805)' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} style={{ fontSize: 48 }}>🎲</motion.div>
      <p style={{ fontFamily: "'Cinzel', serif", color: '#FFD700', letterSpacing: 4, marginTop: 16, fontSize: 13 }}>LOADING PROFILE</p>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1A120B,#0D0805)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: '#A08060', fontFamily: "'Quicksand', sans-serif" }}>Profile not found</p>
      <button onClick={() => navigate('/')} style={{ padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(135deg,#B8860B,#FFD700)', color: '#1A120B', fontFamily: "'Cinzel', serif", fontWeight: 700, border: 'none', cursor: 'pointer' }}>Go Home</button>
    </div>
  );

  const rank = getRank(profile.elo ?? 0);
  const eloProgress = Math.min(100, ((profile.elo ?? 0) % 300) / 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1A120B 0%,#0D0805 55%,#1A120B 100%)', paddingBottom: 80, position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glow blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { top: '-10%', left: '-10%', color: 'hsl(348,60%,28%)', size: 400 },
          { bottom: '-5%', right: '-5%', color: 'hsl(220,70%,24%)', size: 350 },
        ].map((b, i) => (
          <div key={i} style={{ position: 'absolute', width: b.size, height: b.size, top: b.top, left: b.left, bottom: b.bottom, right: b.right, borderRadius: '50%', background: `radial-gradient(circle, ${b.color}, transparent 70%)`, filter: 'blur(60px)', opacity: 0.5 }} />
        ))}
      </div>

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 200, background: `linear-gradient(135deg, hsl(348,65%,24%) 0%, hsl(220,70%,22%) 50%, hsl(40,70%,28%) 100%)`, overflow: 'hidden' }}>
        {/* Shimmer overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent 0px, transparent 14px, rgba(255,215,0,0.03) 14px, rgba(255,215,0,0.03) 15px)' }} />

        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 16, left: 16, width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFD700' }}
        >
          <ArrowLeft size={20} />
        </motion.button>

        {/* Top-right: Rank badge + Collection + Settings */}
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOwnProfile && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                onClick={() => navigate('/collection')}
                title="Collection"
                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,215,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFD700' }}
              >
                <Grid size={16} />

              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                onClick={toggleSettings}
                title="Settings"
                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,215,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFD700' }}
              >
                <Settings size={16} />
              </motion.button>
            </>
          )}
          <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${rank.color}44`, borderRadius: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>{rank.icon}</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: rank.color, letterSpacing: 1 }}>{rank.name}</span>
          </div>
        </div>


        {/* Gold bottom divider */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)' }} />
      </div>

      {/* ── Profile Card ────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginTop: -60, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{ background: 'rgba(40,29,20,0.9)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,215,0,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.08)' }}
        >
          {/* Avatar + Name Row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'flex-end' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <motion.div
                whileHover={isOwnProfile ? { scale: 1.05 } : {}}
                style={{ width: 88, height: 88, borderRadius: '50%', border: `3px solid ${rank.color}`, boxShadow: `0 0 20px ${rank.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, background: `radial-gradient(circle at 38% 38%, ${profile.avatarConfig?.bgColor || '#8B6000'}55, ${profile.avatarConfig?.bgColor || '#3C2A1E'})` }}
              >
                {profile.avatarConfig?.icon || profile.username?.[0]?.toUpperCase()}
              </motion.div>
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAvatarSelector(true)}
                  style={{ position: 'absolute', bottom: -4, right: -4, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#B8860B,#FFD700)', border: '2px solid #1A120B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1A120B' }}
                >
                  <Camera size={13} />
                </motion.button>
              )}
            </div>

            {/* Name & info */}
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 900, color: '#FFF5E1' }}>{profile.username}</h1>
                {isOwnProfile && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setNewUsername(profile.username); setEditingUsername(true); }}
                    style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: '#FFD700', display: 'flex' }}
                  >
                    <Edit3 size={12} />
                  </motion.button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#5a4030', fontFamily: "'Quicksand', sans-serif", letterSpacing: 1.5, marginBottom: 8 }}>UID: {profile.uid}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#FFD700', fontFamily: "'Quicksand', sans-serif" }}>
                  <Coins size={12} /> {(profile.coins ?? currentUser?.coins ?? 0).toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#FFD700', fontFamily: "'Quicksand', sans-serif" }}>
                  <Trophy size={12} /> {profile.elo ?? 600} ELO
                </div>
              </div>
            </div>
          </div>

          {/* ELO Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#A08060', fontFamily: "'Quicksand', sans-serif", letterSpacing: 1 }}>RANK PROGRESS</span>
              <span style={{ fontSize: 10, color: rank.color, fontWeight: 700, fontFamily: "'Quicksand', sans-serif" }}>{rank.icon} {rank.name}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${eloProgress}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`, borderRadius: 999, boxShadow: `0 0 8px ${rank.color}88` }}
              />
            </div>
          </div>

          {/* Status */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '12px 14px', marginBottom: 16, border: '1px solid rgba(255,215,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#5a4030', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Quicksand', sans-serif" }}>Status</span>
              {isOwnProfile && !editingStatus && (
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setNewStatus(profile.statusMessage || ''); setEditingStatus(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFD700' }}>
                  <Edit3 size={13} />
                </motion.button>
              )}
            </div>
            {editingStatus ? (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input type="text" maxLength={60} value={newStatus}
                    onChange={e => { setNewStatus(e.target.value); setStatusError(''); }} autoFocus
                    placeholder="Write your bio (max 60 chars)…"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${statusError ? 'rgba(248,113,113,0.6)' : 'rgba(255,215,0,0.3)'}`, background: 'rgba(255,255,255,0.04)', color: '#FFF5E1', fontFamily: "'Quicksand', sans-serif", fontSize: 13, outline: 'none' }}
                  />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={updateStatus} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(15,110,55,0.5)', border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer', color: '#4ade80', display: 'flex' }}><Save size={15} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setEditingStatus(false); setStatusError(''); }} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(180,30,60,0.3)', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer', color: '#f87171', display: 'flex' }}><X size={15} /></motion.button>
                </div>
                {statusError && <p style={{ margin: 0, color: '#f87171', fontSize: 11, fontFamily: "'Quicksand', sans-serif" }}>{statusError}</p>}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#D2B48C', fontStyle: 'italic', fontSize: 13, fontFamily: "'Quicksand', sans-serif" }}>"{profile.statusMessage || 'Tap ✏️ to set your bio'}"</p>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <StatCard value={`${stats?.winRate ?? 0}%`}       label="Win Rate"  color="#FFD700"  delay={0.15} />
            <StatCard value={stats?.totalWins ?? 0}           label="Wins"      color="#4ade80"  delay={0.2}  />
            <StatCard value={stats?.totalMatchesPlayed ?? 0}  label="Matches"   color="#60a5fa"  delay={0.25} />
          </div>
        </motion.div>

        {/* ── Tabbed section ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} style={{ marginTop: 20 }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 4, gap: 4, border: '1px solid rgba(255,215,0,0.12)', marginBottom: 16 }}>
            <Tab active={activeTab==='stats'}    onClick={()=>setActiveTab('stats')}    icon={<BarChart2 size={12}/>} label="Stats"   />
            <Tab active={activeTab==='battles'}  onClick={()=>setActiveTab('battles')}  icon={<Swords size={12}/>}    label="Battles" />
            <Tab active={activeTab==='badges'}   onClick={()=>setActiveTab('badges')}   icon={<Award size={12}/>}     label="Badges"  />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label:'Total Play Time', value: stats?.totalPlayTimeFormatted || '0m', color:'#a78bfa' },
                    { label:'Avg Game Length', value: stats?.avgGameDurationFormatted || '—', color:'#60a5fa' },
                    { label:'Tokens Home',     value: stats?.totalTokensHome ?? 0,          color:'#4ade80' },
                    { label:'Times Captured',  value: stats?.totalTimesCaptured ?? 0,       color:'#f87171' },
                    { label:'Captures Made',   value: stats?.totalCapturesMade ?? 0,        color:'#FFD700' },
                    { label:'Sixes Rolled',    value: stats?.totalSixes ?? 0,               color:'#fb923c' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,215,0,0.1)', borderRadius:14, padding:'14px 12px' }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:20, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:'#A08060', marginTop:4, textTransform:'uppercase', fontFamily:"'Quicksand',sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'battles' && (
              <motion.div key="battles" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                {matches.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0', color:'#5a4030', fontFamily:"'Quicksand',sans-serif", fontStyle:'italic' }}>No battles yet — jump into the arena!</div>
                ) : matches.slice(0,8).map((match, i) => (
                  <motion.div key={match.id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                    style={{ background:'rgba(40,29,20,0.85)', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, border:`1px solid ${match.result==='win'?'rgba(74,222,128,0.2)':'rgba(248,113,113,0.1)'}` }}
                  >
                    <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                      <span style={{ fontFamily:"'Quicksand',sans-serif", fontWeight:700, color:'#D2B48C', fontSize:13 }}>{match.gameMode || 'Classic'}</span>
                      <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#5a4030', fontFamily:"'Quicksand',sans-serif" }}>
                        <Clock size={10}/> {new Date(match.playedAt).toLocaleDateString()}
                        {match.summary && <span style={{marginLeft:6}}>· {match.summary}</span>}
                      </span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {match.eloDelta != null && match.eloDelta !== 0 && (
                        <span style={{ fontSize:11, fontWeight:700, color:match.eloDelta>0?'#4ade80':'#f87171', fontFamily:"'Quicksand',sans-serif" }}>
                          {match.eloDelta>0?'+':''}{match.eloDelta}
                        </span>
                      )}
                      <span style={{ fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:11, color:match.result==='win'?'#4ade80':'#f87171', background:match.result==='win'?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)', padding:'4px 10px', borderRadius:8, letterSpacing:1 }}>
                        {match.result?.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'badges' && (
              <motion.div key="badges" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                {badges.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0', color:'#5a4030', fontFamily:"'Quicksand',sans-serif", fontStyle:'italic' }}>Play matches to earn badges!</div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {badges.map((b, i) => (
                      <motion.div key={b.badgeKey} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:i*0.04}}
                        title={b.description}
                        style={{ background: b.earnedAt ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)', border:`1px solid ${b.earnedAt?'rgba(255,215,0,0.25)':'rgba(255,255,255,0.06)'}`, borderRadius:14, padding:'14px 8px', textAlign:'center', opacity: b.earnedAt ? 1 : 0.4 }}
                      >
                        <div style={{ fontSize:28, marginBottom:6, filter: b.earnedAt ? 'none' : 'grayscale(1)' }}>{b.icon || '🏅'}</div>
                        <div style={{ fontSize:9, fontWeight:700, color: b.earnedAt ? '#FFD700' : '#5a4030', fontFamily:"'Quicksand',sans-serif", letterSpacing:0.5, lineHeight:1.3 }}>{b.name}</div>
                        {!b.earnedAt && b.target > 0 && (
                          <div style={{ marginTop:6, height:3, background:'rgba(255,255,255,0.06)', borderRadius:999, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${Math.min(100,(b.progress/b.target)*100)}%`, background:'rgba(255,215,0,0.4)', borderRadius:999 }} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Username Edit Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {editingUsername && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'rgba(40,29,20,0.97)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 24, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 0 0 1px rgba(255,215,0,0.1), 0 32px 64px rgba(0,0,0,0.8)' }}
            >
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: '#FFD700', margin: '0 0 6px' }}>Change Username</h3>
              <p style={{ color: '#A08060', fontSize: 12, fontFamily: "'Quicksand', sans-serif", marginBottom: 16 }}>Cost: 200 coins · 3–20 chars, no spaces</p>
              <input type="text" value={newUsername}
                onChange={e => { setNewUsername(e.target.value); setUsernameError(''); }}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: `1px solid ${usernameError ? 'rgba(248,113,113,0.6)' : 'rgba(255,215,0,0.25)'}`, background: 'rgba(255,255,255,0.04)', color: '#FFF5E1', fontFamily: "'Quicksand', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                placeholder="New username"
              />
              {usernameError && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 10, fontFamily: "'Quicksand', sans-serif" }}>{usernameError}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={updateUsername}
                  style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#B8860B,#FFD700)', color: '#1A120B', fontFamily: "'Cinzel', serif", fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                >Save</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { setEditingUsername(false); setUsernameError(''); }}
                  style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid rgba(255,215,0,0.2)', background: 'transparent', color: '#A08060', fontFamily: "'Quicksand', sans-serif", fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                >Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Avatar Selector ──────────────────────────────────────── */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatar={profile?.avatarConfig}
        onAvatarSelected={(config) => { updateUserProfile({ avatarConfig: config }); fetchProfile(); }}
      />
    </motion.div>
  );
};

export default ProfilePage;