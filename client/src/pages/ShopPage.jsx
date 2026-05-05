import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Star, Zap, Package } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

// ── Existing dice/board/token skins
import { DICE_SKINS, BOARD_SKINS, TOKEN_SKINS } from './CollectionPage';

// ── New cosmetics data
import { BANNERS, AVATAR_FRAMES, BACKGROUNDS, RARITY } from '../data/cosmeticsData';

// ── Animated preview components
import { AnimatedBanner } from '../components/cosmetics/AnimatedBanners';
import { AnimatedAvatarFrame } from '../components/cosmetics/AnimatedAvatarFrames';
import { BACKGROUND_COMPONENTS } from '../components/cosmetics/AnimatedBackgrounds';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ─── Existing skin shop items ──────────────────────────────────── */
const SKIN_ITEMS = [
  { id:'dice_obsidian', cat:'dice',   skinKey:'obsidian', cosmeticKey:'diceSkin',  price:0,    rarity:'free',      label:'Obsidian Dice' },
  { id:'dice_ruby',     cat:'dice',   skinKey:'ruby',     cosmeticKey:'diceSkin',  price:800,  rarity:'rare',      label:'Ruby Dice' },
  { id:'dice_sapphire', cat:'dice',   skinKey:'sapphire', cosmeticKey:'diceSkin',  price:800,  rarity:'rare',      label:'Sapphire Dice' },
  { id:'dice_emerald',  cat:'dice',   skinKey:'emerald',  cosmeticKey:'diceSkin',  price:1200, rarity:'epic',      label:'Emerald Dice' },
  { id:'dice_gold',     cat:'dice',   skinKey:'gold',     cosmeticKey:'diceSkin',  price:2500, rarity:'legendary', label:'Gold Crown Dice' },
  { id:'board_marble',  cat:'board',  skinKey:'marble',   cosmeticKey:'boardSkin', price:600,  rarity:'rare',      label:'White Marble Board' },
  { id:'board_cosmic',  cat:'board',  skinKey:'cosmic',   cosmeticKey:'boardSkin', price:1500, rarity:'epic',      label:'Cosmic Board' },
  { id:'board_jade',    cat:'board',  skinKey:'jade',     cosmeticKey:'boardSkin', price:1000, rarity:'rare',      label:'Jade Temple Board' },
  { id:'board_neon',    cat:'board',  skinKey:'neon',     cosmeticKey:'boardSkin', price:2000, rarity:'epic',      label:'Neon Grid Board' },
  { id:'board_parchment',cat:'board', skinKey:'parchment',cosmeticKey:'boardSkin', price:500,  rarity:'common',    label:'Ancient Scroll Board' },
  { id:'token_knight',  cat:'tokens', skinKey:'knight',  cosmeticKey:'tokenSkin', price:700,  rarity:'rare',      label:'Chess Knight Tokens' },
  { id:'token_crystal', cat:'tokens', skinKey:'crystal', cosmeticKey:'tokenSkin', price:1800, rarity:'epic',      label:'Crystal Orb Tokens' },
  { id:'token_fire',    cat:'tokens', skinKey:'fire',    cosmeticKey:'tokenSkin', price:2200, rarity:'legendary', label:'Flame Tokens' },
  { id:'token_metal',   cat:'tokens', skinKey:'metal',   cosmeticKey:'tokenSkin', price:1000, rarity:'rare',      label:'Metal Crown Tokens' },
  { id:'token_emoji',   cat:'tokens', skinKey:'emoji',   cosmeticKey:'tokenSkin', price:400,  rarity:'common',    label:'Emoji Crew Tokens' },
];

/* ─── Category tabs ──────────────────────────────────────────────── */
const CATS = [
  { id:'all',       label:'All',         icon:'🛒' },
  { id:'banner',    label:'Banners',      icon:'🎌' },
  { id:'avatarFrame',label:'Avatar Rings', icon:'💫' },
  { id:'background',label:'Backgrounds',  icon:'🌌' },
  { id:'dice',      label:'Dice',         icon:'🎲' },
  { id:'board',     label:'Board',        icon:'🏁' },
  { id:'tokens',    label:'Tokens',       icon:'♟️' },
];

/* ─── Mini previews for existing skins ───────────────────────────── */
const SkinPreview = ({ cat, skinKey }) => {
  if (cat === 'dice') {
    const s = DICE_SKINS[skinKey]; if (!s) return null;
    return <div style={{ width:52, height:52, borderRadius:10, background:s.faceGrad, border:`1.5px solid ${s.borderColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎲</div>;
  }
  if (cat === 'board') {
    const s = BOARD_SKINS[skinKey]; if (!s) return null;
    return <div style={{ width:52, height:52, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏁</div>;
  }
  if (cat === 'tokens') {
    const s = TOKEN_SKINS[skinKey]; if (!s) return null;
    return (
      <div style={{ width:52, height:52, borderRadius:10, background:'rgba(0,0,0,0.3)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:3, padding:6 }}>
        {s.colors.slice(0,4).map((c,i) => <div key={i} style={{ width:16, height:16, borderRadius:'50%', background:`radial-gradient(circle at 35% 35%,${c}ee,${c}66)` }} />)}
      </div>
    );
  }
  return null;
};

/* ─── Background mini preview ──────────────────────────────────── */
const BgPreview = ({ bgId }) => {
  const style = {
    ember:       { background:'linear-gradient(to top,#FF4500,#1A1A1A)' },
    ocean:       { background:'linear-gradient(to bottom,#001233,#000814)' },
    lava:        { background:'linear-gradient(135deg,#3A0A00,#FF4500 80%)' },
    storm:       { background:'linear-gradient(to bottom,#050810,#1A2040)' },
    galaxy:      { background:'radial-gradient(ellipse at center,#1A1A4E,#050508)' },
    volcanic:    { background:'linear-gradient(to bottom,#3A0A00,#0A0000)' },
    antigravity: { background:'linear-gradient(135deg,#0A2040,#1A3050)' },
    inferno:     { background:'linear-gradient(to top,#FF1A00,#FF8C00,#FFD700)' },
    default:     { background:'linear-gradient(160deg,#1A120B,#0D0805)' },
  };
  const key = bgId.replace('bg_','');
  return <div style={{ width:52, height:52, borderRadius:10, ...(style[key] || style.default) }} />;
};

/* ─── Confirm Modal ──────────────────────────────────────────────── */
const ConfirmModal = ({ item, coins, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
  >
    <motion.div initial={{ scale:0.85, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.85, y:20 }}
      style={{ background:'rgba(15,10,5,0.98)', border:'1px solid rgba(255,215,0,0.3)', borderRadius:24, padding:28, maxWidth:320, width:'100%', textAlign:'center' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>🛒</div>
      <h3 style={{ margin:'0 0 8px', 'Cinzel',serif", fontWeight:900, color:'#FFD700', fontSize:16 }}>Confirm Purchase</h3>
      <p style={{ margin:'0 0 6px', 'Quicksand',sans-serif", fontSize:15, color:'#FFF5E1' }}>{item.label}</p>
      <p style={{ margin:'0 0 20px', 'Quicksand',sans-serif", fontSize:13, color:'#A08060' }}>
        🪙 {item.price.toLocaleString()} coins &nbsp;|&nbsp; Balance after: 🪙 {(coins - item.price).toLocaleString()}
      </p>
      <div style={{ display:'flex', gap:12 }}>
        <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={onCancel}
          style={{ flex:1, padding:'12px', borderRadius:14, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#A08060', sans-serif", fontWeight:700, cursor:'pointer', fontSize:14 }}>
          CANCEL
        </motion.button>
        <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={onConfirm}
          style={{ flex:1, padding:'12px', borderRadius:14, background:'linear-gradient(135deg,#B8860B,#FFD700)', border:'none', color:'#1A120B', sans-serif", fontWeight:900, cursor:'pointer', fontSize:14 }}>
          BUY 🪙 {item.price.toLocaleString()}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── Item Card ──────────────────────────────────────────────────── */
const ItemCard = ({ item, owned, equipped, coins, onBuy, onEquip, buying }) => {
  const rar = RARITY[item.rarity] || RARITY.common;
  const canAfford = coins >= item.price;
  const isBuying = buying === item.id;

  const renderPreview = () => {
    if (item.type === 'banner') return <AnimatedBanner bannerId={item.id} mini />;
    if (item.type === 'avatarFrame') return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:4 }}>
        <AnimatedAvatarFrame frameId={item.id} initial='A' size={52} />
      </div>
    );
    if (item.type === 'background') return <BgPreview bgId={item.id} />;
    return <SkinPreview cat={item.cat} skinKey={item.skinKey} />;
  };

  return (
    <motion.div
      initial={{ opacity:0, scale:0.93 }} animate={{ opacity:1, scale:1 }}
      whileHover={{ y:-4, boxShadow:`0 12px 32px ${rar.glow}` }}
      style={{
        borderRadius:18, overflow:'hidden', cursor: isBuying ? 'wait' : 'pointer',
        border:`1.5px solid ${equipped ? '#FFD700' : owned ? 'rgba(74,222,128,0.4)' : rar.color+'33'}`,
        background: equipped ? 'rgba(255,215,0,0.06)' : 'rgba(12,8,4,0.92)',
        boxShadow: equipped ? `0 0 24px ${rar.glow}` : '0 4px 18px rgba(0,0,0,0.5)',
        position:'relative', backdropFilter:'blur(10px)',
        transition:'border-color 0.2s',
      }}
    >
      {/* Rarity top bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,transparent,${rar.color},transparent)` }} />

      {/* Preview area */}
      <div style={{ height:70, overflow:'hidden', position:'relative', margin:'10px 10px 0' }}>
        {renderPreview()}
      </div>

      <div style={{ padding:'10px 12px 12px' }}>
        {/* Name + Rarity */}
        <div style={{ 'Cinzel',serif", fontWeight:700, fontSize:11, color: equipped ? '#FFD700' : '#FFF5E1', marginBottom:5, lineHeight:1.3, letterSpacing:0.5 }}>
          {item.label}
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:rar.bg, border:`1px solid ${rar.color}44`, borderRadius:99, padding:'2px 8px', marginBottom:10 }}>
          {item.rarity === 'legendary' && <Star size={8} color={rar.color} fill={rar.color} />}
          {item.rarity === 'epic' && <Zap size={8} color={rar.color} />}
          <span style={{ fontSize:8, fontWeight:900, color:rar.color, letterSpacing:1, sans-serif" }}>{rar.label}</span>
        </div>

        {/* Action */}
        {equipped ? (
          <div style={{ width:'100%', padding:'9px 0', borderRadius:11, background:'linear-gradient(135deg,#B8860B,#FFD700)', color:'#1A120B', sans-serif", fontWeight:900, fontSize:12, textAlign:'center', letterSpacing:1 }}>
            🔥 EQUIPPED
          </div>
        ) : owned ? (
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={onEquip}
            style={{ width:'100%', padding:'9px 0', borderRadius:11, background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'#4ade80', sans-serif", fontWeight:900, fontSize:12, textAlign:'center', cursor:'pointer', letterSpacing:1 }}>
            ✓ APPLY
          </motion.button>
        ) : item.rarity === 'free' || item.price === 0 ? (
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={onEquip}
            style={{ width:'100%', padding:'9px 0', borderRadius:11, background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'#4ade80', sans-serif", fontWeight:900, fontSize:12, textAlign:'center', cursor:'pointer', letterSpacing:1 }}>
            FREE — APPLY
          </motion.button>
        ) : (
          <motion.button
            whileHover={canAfford ? {scale:1.03} : {}}
            whileTap={canAfford ? {scale:0.97} : { x:[0,-4,4,-4,4,0] }}
            onClick={canAfford ? onBuy : undefined}
            style={{ width:'100%', padding:'9px 0', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', gap:5, background: canAfford ? 'linear-gradient(135deg,#B8860B,#FFD700)' : 'rgba(255,255,255,0.04)', border: canAfford ? 'none' : '1px solid rgba(255,255,255,0.07)', color: canAfford ? '#1A120B' : '#5A4030', sans-serif", fontWeight:900, fontSize:12, cursor: canAfford ? 'pointer' : 'default', opacity: isBuying ? 0.7 : 1 }}>
            {isBuying ? '⏳ Buying…' : <>🪙 {item.price.toLocaleString()} {!canAfford && <span style={{fontSize:9,opacity:0.7}}>Need more</span>}</>}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Main Shop Page ──────────────────────────────────────────────── */
const ShopPage = () => {
  const navigate = useNavigate();
  const { user, token, addToast, updateUserCoins, cosmetics, setCosmetic } = useGameStore();
  const [cat, setCat] = useState('all');
  const [owned, setOwned] = useState([]);
  const [buying, setBuying] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const coins = user?.coins || 0;

  // Merge all item types into one flat list
  const ALL_ITEMS = [
    ...BANNERS.map(b => ({ ...b, cat:'banner' })),
    ...AVATAR_FRAMES.map(a => ({ ...a, cat:'avatarFrame' })),
    ...BACKGROUNDS.map(b => ({ ...b, cat:'background' })),
    ...SKIN_ITEMS,
  ];

  useEffect(() => {
    const key = `lf_owned_cosmetics_${user?.uid || 'guest'}`;
    try { setOwned(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setOwned([]); }
  }, [user?.uid]);

  const saveOwned = (list) => {
    const key = `lf_owned_cosmetics_${user?.uid || 'guest'}`;
    setOwned(list);
    localStorage.setItem(key, JSON.stringify(list));
  };

  const isOwned = (item) => item.free || item.price === 0 || item.rarity === 'free' || owned.includes(item.id);

  const getEquippedKey = (item) => {
    if (item.type === 'banner') return cosmetics?.bannerId === item.id;
    if (item.type === 'avatarFrame') return cosmetics?.avatarFrameId === item.id;
    if (item.type === 'background') return cosmetics?.backgroundId === item.id;
    return cosmetics?.[item.cosmeticKey] === item.skinKey;
  };

  const equip = (item) => {
    if (item.type === 'banner') setCosmetic('bannerId', item.id);
    else if (item.type === 'avatarFrame') setCosmetic('avatarFrameId', item.id);
    else if (item.type === 'background') setCosmetic('backgroundId', item.id);
    else setCosmetic(item.cosmeticKey, item.skinKey);
    addToast(`${item.label} equipped! 🔥`, 'success');
  };

  const handleBuyConfirm = async (item) => {
    setConfirmItem(null);
    setBuying(item.id);
    try {
      await fetch(`${API_URL}/api/shop/buy`, {
        method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ item_key: item.id }),
      });
    } catch {}
    const newOwned = [...owned, item.id];
    saveOwned(newOwned);
    updateUserCoins(coins - item.price);
    equip(item);
    addToast(`${item.label} unlocked & equipped! 🎉`, 'success');
    setBuying(null);
  };

  const filtered = cat === 'all' ? ALL_ITEMS : ALL_ITEMS.filter(i => i.cat === cat || i.type === cat);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ minHeight:'100vh', background:'rgba(10, 10, 15, 0.65)', paddingBottom:40, position:'relative' }}>

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'-20%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,69,0,0.07),transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-10%', right:'-10%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(120,0,255,0.06),transparent 70%)', pointerEvents:'none' }} />

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,69,0,0.15)', background:'rgba(10,10,15,0.95)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:20 }}>
        <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.92}} onClick={() => navigate(-1)}
          style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,69,0,0.08)', border:'1px solid rgba(255,69,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#FF4500' }}>
          <ArrowLeft size={18} />
        </motion.button>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, 'Cinzel',serif", fontWeight:900, fontSize:18, color:'#FF4500', letterSpacing:3, textShadow:'0 0 20px rgba(255,69,0,0.5)' }}>COSMETICS STORE</h1>
          <p style={{ margin:0, 'Quicksand',sans-serif", fontSize:11, color:'#6A4030' }}>Unlock exclusive animated cosmetics</p>
        </div>
        <div style={{ background:'rgba(255,69,0,0.08)', border:'1px solid rgba(255,69,0,0.25)', borderRadius:99, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:14 }}>🪙</span>
          <span style={{ 'Cinzel',serif", fontWeight:900, fontSize:15, color:'#FFD700' }}>{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div style={{ display:'flex', gap:8, padding:'14px 16px 4px', overflowX:'auto', scrollbarWidth:'none' }}>
        {CATS.map(c => (
          <motion.button key={c.id} onClick={() => setCat(c.id)} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:99, border:'none', flexShrink:0,
              background: cat===c.id ? 'linear-gradient(135deg,#FF4500,#FF8C00)' : 'rgba(255,69,0,0.06)',
              color: cat===c.id ? '#fff' : '#6A4030',
              'Quicksand',sans-serif", fontWeight:800, fontSize:13, cursor:'pointer',
              boxShadow: cat===c.id ? '0 4px 16px rgba(255,69,0,0.35)' : 'none',
              transition:'all 0.2s' }}>
            <span style={{fontSize:14}}>{c.icon}</span>{c.label}
          </motion.button>
        ))}
      </div>

      {/* ── Items Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div key={cat} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
          style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, padding:'12px 16px' }}>
          {filtered.map((item, i) => (
            <motion.div key={item.id} transition={{ delay:i*0.03 }}>
              <ItemCard
                item={item}
                owned={isOwned(item)}
                equipped={getEquippedKey(item)}
                coins={coins}
                buying={buying}
                onBuy={() => setConfirmItem(item)}
                onEquip={() => equip(item)}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Confirm Modal ── */}
      <AnimatePresence>
        {confirmItem && (
          <ConfirmModal
            item={confirmItem}
            coins={coins}
            onConfirm={() => handleBuyConfirm(confirmItem)}
            onCancel={() => setConfirmItem(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ShopPage;
