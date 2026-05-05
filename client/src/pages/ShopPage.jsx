import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingCart, Coins, Star, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { DICE_SKINS, BOARD_SKINS, TOKEN_SKINS } from './CollectionPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ── Shop catalogue (merges collection skins with price/rarity) ── */
const SHOP_ITEMS = [
  // Dice
  { id: 'dice_obsidian', cat: 'dice',  skinKey: 'obsidian', cosmeticKey: 'diceSkin',  price: 0,    rarity: 'free',      label: 'Obsidian Dice' },
  { id: 'dice_ruby',     cat: 'dice',  skinKey: 'ruby',     cosmeticKey: 'diceSkin',  price: 800,  rarity: 'rare',      label: 'Ruby Dice' },
  { id: 'dice_sapphire', cat: 'dice',  skinKey: 'sapphire', cosmeticKey: 'diceSkin',  price: 800,  rarity: 'rare',      label: 'Sapphire Dice' },
  { id: 'dice_emerald',  cat: 'dice',  skinKey: 'emerald',  cosmeticKey: 'diceSkin',  price: 1200, rarity: 'epic',      label: 'Emerald Dice' },
  { id: 'dice_gold',     cat: 'dice',  skinKey: 'gold',     cosmeticKey: 'diceSkin',  price: 2500, rarity: 'legendary', label: 'Gold Crown Dice' },
  // Board
  { id: 'board_marble',    cat: 'board', skinKey: 'marble',    cosmeticKey: 'boardSkin', price: 600,  rarity: 'rare',      label: 'White Marble Board' },
  { id: 'board_cosmic',    cat: 'board', skinKey: 'cosmic',    cosmeticKey: 'boardSkin', price: 1500, rarity: 'epic',      label: 'Cosmic Board' },
  { id: 'board_jade',      cat: 'board', skinKey: 'jade',      cosmeticKey: 'boardSkin', price: 1000, rarity: 'rare',      label: 'Jade Temple Board' },
  { id: 'board_neon',      cat: 'board', skinKey: 'neon',      cosmeticKey: 'boardSkin', price: 2000, rarity: 'epic',      label: 'Neon Grid Board' },
  { id: 'board_parchment', cat: 'board', skinKey: 'parchment', cosmeticKey: 'boardSkin', price: 500,  rarity: 'common',    label: 'Ancient Scroll Board' },
  // Tokens
  { id: 'token_knight',  cat: 'tokens', skinKey: 'knight',  cosmeticKey: 'tokenSkin', price: 700,  rarity: 'rare',      label: 'Chess Knight Tokens' },
  { id: 'token_crystal', cat: 'tokens', skinKey: 'crystal', cosmeticKey: 'tokenSkin', price: 1800, rarity: 'epic',      label: 'Crystal Orb Tokens' },
  { id: 'token_fire',    cat: 'tokens', skinKey: 'fire',    cosmeticKey: 'tokenSkin', price: 2200, rarity: 'legendary', label: 'Flame Tokens' },
  { id: 'token_metal',   cat: 'tokens', skinKey: 'metal',   cosmeticKey: 'tokenSkin', price: 1000, rarity: 'rare',      label: 'Metal Crown Tokens' },
  { id: 'token_emoji',   cat: 'tokens', skinKey: 'emoji',   cosmeticKey: 'tokenSkin', price: 400,  rarity: 'common',    label: 'Emoji Crew Tokens' },
];

const RARITY = {
  free:      { color: '#4ade80', label: 'FREE',      bg: 'rgba(74,222,128,0.12)' },
  common:    { color: '#A08060', label: 'COMMON',    bg: 'rgba(160,128,96,0.12)' },
  rare:      { color: '#60a5fa', label: 'RARE',      bg: 'rgba(96,165,250,0.12)' },
  epic:      { color: '#a78bfa', label: 'EPIC',      bg: 'rgba(167,139,250,0.12)' },
  legendary: { color: '#FFD700', label: 'LEGENDARY', bg: 'rgba(255,215,0,0.12)' },
};

const CATS = [
  { id: 'all',    label: 'All',    icon: '🛒' },
  { id: 'dice',   label: 'Dice',   icon: '🎲' },
  { id: 'board',  label: 'Board',  icon: '🏁' },
  { id: 'tokens', label: 'Tokens', icon: '♟️' },
];

/* ── Mini previews ─────────────────────────────────────────────── */
const Preview = ({ cat, skinKey }) => {
  if (cat === 'dice') {
    const s = DICE_SKINS[skinKey];
    if (!s) return null;
    return (
      <div style={{ width: 52, height: 52, borderRadius: 12, background: s.faceGrad, border: `1.5px solid ${s.borderColor}`, boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.4)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)', padding: 7, gap: 3 }}>
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            {[0,2,4,6,8].includes(i) && <div style={{ width: 8, height: 8, borderRadius:'50%', background: s.pipColor }} />}
          </div>
        ))}
      </div>
    );
  }
  if (cat === 'board') {
    const s = BOARD_SKINS[skinKey];
    if (!s) return null;
    return (
      <div style={{ width: 52, height: 52, borderRadius: 12, background: s.bg, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)', gap: 2, padding: 7 }}>
        {Array.from({length:9},(_,i) => (
          <div key={i} style={{ borderRadius: 2, background: [0,2,6,8].includes(i) ? 'rgba(255,255,255,0.18)' : i===4 ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.05)' }} />
        ))}
      </div>
    );
  }
  if (cat === 'tokens') {
    const s = TOKEN_SKINS[skinKey];
    if (!s) return null;
    return (
      <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(0,0,0,0.3)', display: 'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap: 3, padding: 8 }}>
        {s.colors.slice(0,4).map((c,i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius:'50%', background: `radial-gradient(circle at 35% 35%,${c}ee,${c}66)`, border: `1.5px solid ${c}88` }} />
        ))}
      </div>
    );
  }
  return null;
};

/* ── Main Page ──────────────────────────────────────────────────── */
const ShopPage = () => {
  const navigate = useNavigate();
  const { user, token, addToast, updateUserCoins, cosmetics, setCosmetic } = useGameStore();
  const [cat, setCat]       = useState('all');
  const [buying, setBuying] = useState(null);

  const [owned, setOwned] = useState([]);

  useEffect(() => {
    const key = `lf_owned_skins_${user?.uid || 'guest'}`;
    try {
      setOwned(JSON.parse(localStorage.getItem(key) || '[]'));
    } catch {
      setOwned([]);
    }
  }, [user?.uid]);

  const saveOwned = (list) => {
    const key = `lf_owned_skins_${user?.uid || 'guest'}`;
    setOwned(list);
    localStorage.setItem(key, JSON.stringify(list));
  };

  const isOwned = (item) => item.rarity === 'free' || owned.includes(item.id);

  const handleBuy = async (item) => {
    if (isOwned(item)) {
      // Equip it
      setCosmetic(item.cosmeticKey, item.skinKey);
      addToast(`${item.label} equipped! ✓`, 'success');
      return;
    }
    if ((user?.coins || 0) < item.price) {
      addToast('Not enough coins! 💰', 'error');
      return;
    }
    setBuying(item.id);
    try {
      const res = await fetch(`${API_URL}/api/shop/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item_key: item.id }),
      });
      // Whether server supports it or not, unlock locally
      const newOwned = [...owned, item.id];
      saveOwned(newOwned);
      updateUserCoins((user?.coins || 0) - item.price);
      setCosmetic(item.cosmeticKey, item.skinKey);
      addToast(`${item.label} unlocked & equipped! 🎉`, 'success');
    } catch {
      // Offline fallback: still unlock locally
      const newOwned = [...owned, item.id];
      saveOwned(newOwned);
      updateUserCoins((user?.coins || 0) - item.price);
      setCosmetic(item.cosmeticKey, item.skinKey);
      addToast(`${item.label} unlocked! 🎉`, 'success');
    } finally {
      setBuying(null);
    }
  };

  const filtered = cat === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.cat === cat);
  const coins = user?.coins || 0;

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      transition={{ duration: 0.25 }}
      style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1A120B 0%,#0D0805 55%,#1A120B 100%)', paddingBottom: 40 }}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,215,0,0.12)', background:'rgba(26,18,11,0.95)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:20 }}>
        <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.92}} onClick={() => navigate(-1)}
          style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#FFD700', flexShrink:0 }}>
          <ArrowLeft size={18} />
        </motion.button>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:20, color:'#FFD700', letterSpacing:2 }}>SHOP</h1>
          <p style={{ margin:0, fontFamily:"'Quicksand',sans-serif", fontSize:11, color:'#A08060' }}>Unlock exclusive skins with coins</p>
        </div>
        {/* Coin balance */}
        <div style={{ background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.25)', borderRadius:99, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:14 }}>🪙</span>
          <span style={{ fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:15, color:'#FFD700' }}>{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display:'flex', gap:8, padding:'14px 16px 4px', overflowX:'auto' }}>
        {CATS.map(c => (
          <motion.button key={c.id} onClick={() => setCat(c.id)} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:99, border:'none', background: cat===c.id ? 'linear-gradient(135deg,#B8860B,#FFD700)' : 'rgba(40,29,20,0.85)', color: cat===c.id ? '#1A120B' : '#A08060', fontFamily:"'Quicksand',sans-serif", fontWeight:800, fontSize:13, cursor:'pointer', flexShrink:0, boxShadow: cat===c.id ? '0 4px 16px rgba(255,215,0,0.25)' : 'none', transition:'all 0.2s' }}>
            <span style={{fontSize:15}}>{c.icon}</span> {c.label}
          </motion.button>
        ))}
      </div>

      {/* Items grid */}
      <AnimatePresence mode="wait">
        <motion.div key={cat} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
          style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, padding:'12px 16px' }}>
          {filtered.map((item, i) => {
            const owned_   = isOwned(item);
            const equipped = cosmetics?.[item.cosmeticKey] === item.skinKey;
            const canAfford = coins >= item.price;
            const rar = RARITY[item.rarity] || RARITY.common;
            const isBuying = buying === item.id;

            return (
              <motion.div key={item.id}
                initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay:i*0.04}}
                whileHover={{scale:1.02, y:-2}} whileTap={{scale:0.98}}
                onClick={() => !isBuying && handleBuy(item)}
                style={{
                  borderRadius:20, overflow:'hidden', cursor: isBuying ? 'wait' : 'pointer',
                  border: `2px solid ${equipped ? '#FFD700' : owned_ ? 'rgba(74,222,128,0.35)' : canAfford ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.06)'}`,
                  background: equipped ? 'rgba(255,215,0,0.07)' : owned_ ? 'rgba(74,222,128,0.05)' : 'rgba(40,29,20,0.9)',
                  boxShadow: equipped ? '0 0 20px rgba(255,215,0,0.15)' : '0 4px 16px rgba(0,0,0,0.35)',
                  position:'relative', backdropFilter:'blur(8px)',
                }}>
                {/* Rarity ribbon */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background: `linear-gradient(90deg, transparent, ${rar.color}, transparent)` }} />

                <div style={{ padding:'14px 12px 12px' }}>
                  {/* Preview + rarity row */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <Preview cat={item.cat} skinKey={item.skinKey} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:13, color: equipped ? '#FFD700' : '#FFF5E1', marginBottom:4, lineHeight:1.3 }}>
                        {item.label}
                      </div>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:4, background: rar.bg, border:`1px solid ${rar.color}44`, borderRadius:99, padding:'2px 8px' }}>
                        {item.rarity === 'legendary' && <Star size={9} color={rar.color} fill={rar.color} />}
                        {item.rarity === 'epic' && <Zap size={9} color={rar.color} />}
                        <span style={{ fontSize:9, fontWeight:900, color: rar.color, letterSpacing:1 }}>{rar.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  {equipped ? (
                    <div style={{ width:'100%', padding:'9px', borderRadius:12, background:'linear-gradient(135deg,#B8860B,#FFD700)', color:'#1A120B', fontFamily:"'Quicksand',sans-serif", fontWeight:900, fontSize:12, textAlign:'center', letterSpacing:1 }}>
                      ✓ EQUIPPED
                    </div>
                  ) : owned_ ? (
                    <motion.div whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                      style={{ width:'100%', padding:'9px', borderRadius:12, background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'#4ade80', fontFamily:"'Quicksand',sans-serif", fontWeight:900, fontSize:12, textAlign:'center', cursor:'pointer', letterSpacing:1 }}>
                      Tap to Equip
                    </motion.div>
                  ) : item.rarity === 'free' ? (
                    <div style={{ width:'100%', padding:'9px', borderRadius:12, background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'#4ade80', fontFamily:"'Quicksand',sans-serif", fontWeight:900, fontSize:12, textAlign:'center', letterSpacing:1 }}>
                      FREE — Tap to Equip
                    </div>
                  ) : (
                    <motion.div whileHover={canAfford ? {scale:1.03} : {}} whileTap={canAfford ? {scale:0.97} : {}}
                      style={{ width:'100%', padding:'9px', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background: canAfford ? 'linear-gradient(135deg,#B8860B,#FFD700)' : 'rgba(255,255,255,0.05)', border: canAfford ? 'none' : '1px solid rgba(255,255,255,0.08)', color: canAfford ? '#1A120B' : '#5A4030', fontFamily:"'Quicksand',sans-serif", fontWeight:900, fontSize:12, cursor: canAfford ? 'pointer' : 'default', opacity: isBuying ? 0.7 : 1 }}>
                      {isBuying ? (
                        <span style={{fontSize:12}}>⏳ Buying…</span>
                      ) : (
                        <>
                          <span>🪙</span>
                          <span>{item.price.toLocaleString()}</span>
                          {!canAfford && <span style={{fontSize:10, opacity:0.6}}>— need more</span>}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Earn coins hint */}
      <div style={{ margin:'4px 16px 0', padding:'12px 16px', borderRadius:14, background:'rgba(255,215,0,0.04)', border:'1px solid rgba(255,215,0,0.12)', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{fontSize:20}}>💡</span>
        <div>
          <div style={{ fontFamily:"'Quicksand',sans-serif", fontWeight:800, fontSize:12, color:'#FFD700', marginBottom:2 }}>Earn more coins</div>
          <div style={{ fontFamily:"'Quicksand',sans-serif", fontSize:11, color:'#7A5C40' }}>Win games, spin daily rewards, complete achievements</div>
        </div>
        <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={() => navigate('/rewards')}
          style={{ marginLeft:'auto', padding:'7px 14px', borderRadius:99, background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.2)', color:'#FFD700', fontFamily:"'Quicksand',sans-serif", fontWeight:800, fontSize:11, cursor:'pointer', flexShrink:0 }}>
          Earn →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ShopPage;
