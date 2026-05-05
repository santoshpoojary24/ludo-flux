import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { BANNERS, AVATAR_FRAMES, BACKGROUNDS } from '../data/cosmeticsData';
import { AnimatedBanner } from '../components/cosmetics/AnimatedBanners';
import { AnimatedAvatarFrame } from '../components/cosmetics/AnimatedAvatarFrames';
import { BACKGROUND_COMPONENTS } from '../components/cosmetics/AnimatedBackgrounds';

/* ─── Dice skins ─────────────────────────────────────────────────── */
export const DICE_SKINS = {
  classic:  { name: 'Classic',    icon: '🎲', desc: 'Ivory white, charcoal pips', unlocked: true,  pipColor: 'rgba(30,20,10,0.85)', faceGrad: 'linear-gradient(145deg,#FFFFF8,#EDE8D8)', borderColor: 'rgba(0,0,0,0.12)' },
  obsidian: { name: 'Obsidian',   icon: '🖤', desc: 'Glossy jet-black cube',       unlocked: true,  pipColor: 'rgba(220,220,220,0.9)', faceGrad: 'linear-gradient(145deg,#2d2d2d,#111)',   borderColor: 'rgba(255,255,255,0.08)' },
  ruby:     { name: 'Ruby',       icon: '💎', desc: 'Deep crimson gem dice',       unlocked: false, pipColor: '#ffe0e0',               faceGrad: 'linear-gradient(145deg,#c0392b,#7b0a0a)', borderColor: 'rgba(255,100,100,0.3)' },
  sapphire: { name: 'Sapphire',   icon: '🔷', desc: 'Royal blue crystal',          unlocked: false, pipColor: '#cce0ff',               faceGrad: 'linear-gradient(145deg,#1a4a8a,#0a1f5a)', borderColor: 'rgba(100,160,255,0.3)' },
  emerald:  { name: 'Emerald',    icon: '💚', desc: 'Verdant forest green',        unlocked: false, pipColor: '#d0ffe0',               faceGrad: 'linear-gradient(145deg,#1a7a4a,#0a3d1a)', borderColor: 'rgba(80,200,120,0.3)' },
  gold:     { name: 'Gold Crown', icon: '👑', desc: 'Solid 24K gold finish',       unlocked: false, pipColor: '#5c3200',               faceGrad: 'linear-gradient(145deg,#FFD700,#B8860B)', borderColor: 'rgba(255,215,0,0.5)' },
};

/* ─── Board skins ────────────────────────────────────────────────── */
export const BOARD_SKINS = {
  walnut:    { name: 'Dark Walnut',    icon: '🪵', desc: 'Premium walnut wood grain',  unlocked: true,  bg: 'linear-gradient(145deg,#2C1A0E,#1F1208)' },
  marble:    { name: 'White Marble',   icon: '🏛️', desc: 'Elegant Italian marble',     unlocked: false, bg: 'linear-gradient(145deg,#f0ece4,#d4c4b0)' },
  cosmic:    { name: 'Cosmic',         icon: '🌌', desc: 'Deep space nebula board',    unlocked: false, bg: 'linear-gradient(145deg,#0f0c29,#302b63)' },
  jade:      { name: 'Jade Temple',    icon: '🟩', desc: 'Ancient jade stone finish',  unlocked: false, bg: 'linear-gradient(145deg,#1a6b47,#0d3d28)' },
  neon:      { name: 'Neon Grid',      icon: '💡', desc: 'Cyberpunk holographic grid', unlocked: false, bg: 'linear-gradient(145deg,#0d0d0d,#1a1a2e)' },
  parchment: { name: 'Ancient Scroll', icon: '📜', desc: 'Worn parchment & ink',       unlocked: false, bg: 'linear-gradient(145deg,#d4a853,#a0722a)' },
};

/* ─── Token skins ────────────────────────────────────────────────── */
export const TOKEN_SKINS = {
  jewel:   { name: 'Jewel Gems',    icon: '💎', desc: 'Layered gem 3D tokens',       unlocked: true,  colors: ['#C0392B','#1A7A4A','#B8860B','#1A4A8A'] },
  knight:  { name: 'Chess Knights', icon: '♟️', desc: 'Carved chess piece tokens',   unlocked: false, colors: ['#8B4513','#D2691E','#A0522D','#6B3A2A'] },
  crystal: { name: 'Crystal Orbs',  icon: '🔮', desc: 'Glowing crystal spheres',     unlocked: false, colors: ['#FF6B9D','#A855F7','#3B82F6','#10B981'] },
  fire:    { name: 'Flame Tokens',  icon: '🔥', desc: 'Living flame pieces',         unlocked: false, colors: ['#FF4500','#FF8C00','#FFD700','#FF6347'] },
  metal:   { name: 'Metal Crowns',  icon: '👑', desc: 'Polished metal crown tokens', unlocked: false, colors: ['#C0C0C0','#FFD700','#CD7F32','#E5E4E2'] },
  emoji:   { name: 'Emoji Crew',    icon: '😎', desc: 'Fun emoji face tokens',       unlocked: false, colors: ['#FFD700','#FF6B9D','#3B82F6','#10B981'] },
};

const CATS = [
  { id: 'dice',        label: 'Dice',      icon: '🎲', key: 'diceSkin'      },
  { id: 'board',       label: 'Board',     icon: '🏁', key: 'boardSkin'     },
  { id: 'tokens',      label: 'Tokens',    icon: '♟️', key: 'tokenSkin'     },
  { id: 'avatarFrame', label: 'Avatars',   icon: '💫', key: 'avatarFrameId' },
  { id: 'banner',      label: 'Banners',   icon: '🎌', key: 'bannerId'      },
  { id: 'background',  label: 'Wallpapers',icon: '🌌', key: 'backgroundId'  },
];

const COSMETIC_LISTS = {
  avatarFrame: AVATAR_FRAMES,
  banner:      BANNERS,
  background:  BACKGROUNDS,
};

const ALL_SKINS = { dice: DICE_SKINS, board: BOARD_SKINS, tokens: TOKEN_SKINS };

/* ── Previews ─────────────────────────────────────────────────────── */
const DicePreview = ({ skin }) => (
  <div style={{
    width: 60, height: 60, borderRadius: 13, flexShrink: 0,
    background: skin.faceGrad,
    border: `1.5px solid ${skin.borderColor}`,
    boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.4)',
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    gridTemplateRows: 'repeat(3,1fr)', padding: 8, gap: 4,
  }}>
    {[0,1,2,3,4,5,6,7,8].map(i => (
      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        {[0,2,4,6,8].includes(i) && (
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: skin.pipColor, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }} />
        )}
      </div>
    ))}
  </div>
);

const BoardPreview = ({ skin }) => (
  <div style={{
    width: 60, height: 60, borderRadius: 13, flexShrink: 0,
    background: skin.bg,
    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.08), 0 4px 10px rgba(0,0,0,0.4)',
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    gridTemplateRows: 'repeat(3,1fr)', gap: 2, padding: 8,
  }}>
    {Array.from({length:9},(_,i) => (
      <div key={i} style={{ borderRadius: 3, background: [0,2,6,8].includes(i) ? 'rgba(255,255,255,0.14)' : i===4 ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.04)' }} />
    ))}
  </div>
);

const TokenPreview = ({ skin }) => (
  <div style={{ width: 60, height: 60, borderRadius: 13, flexShrink: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8 }}>
    {skin.colors.slice(0,4).map((c,i) => (
      <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%,${c}ee,${c}66)`, boxShadow: `inset 0 1px 3px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.4)`, border: `1.5px solid ${c}88` }} />
    ))}
  </div>
);

/* ── Main Page ────────────────────────────────────────────────────── */
const CollectionPage = () => {
  const navigate = useNavigate();
  const { user, cosmetics, setCosmetic, addToast } = useGameStore();
  const [cat, setCat] = useState('dice');
  const [owned, setOwned] = useState([]);

  useEffect(() => {
    const key = `lf_owned_cosmetics_${user?.uid || 'guest'}`;
    try { setOwned(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { setOwned([]); }
  }, [user?.uid]);

  const currentCat = CATS.find(c => c.id === cat);
  const isCosmeticCat = ['avatarFrame', 'banner', 'background'].includes(cat);

  // --- Skin categories (dice / board / tokens) ---
  const skins = !isCosmeticCat
    ? Object.entries(ALL_SKINS[cat]).map(([id, skin]) => {
        const isFree = skin.unlocked === true;
        const shopId = `${currentCat.id}_${id}`;
        return [id, { ...skin, unlocked: isFree || owned.includes(shopId) }];
      })
    : [];

  // --- Cosmetic categories (avatarFrame / banner / background) ---
  const cosmeticItems = isCosmeticCat
    ? (COSMETIC_LISTS[cat] || []).map(item => ({
        ...item,
        unlocked: item.free || item.price === 0 || owned.includes(item.id),
      }))
    : [];

  const selectedId = isCosmeticCat
    ? (cosmetics?.[currentCat.key] || (COSMETIC_LISTS[cat]?.[0]?.id))
    : (cosmetics?.[currentCat.key] || Object.keys(ALL_SKINS[cat] || {})[0]);

  const totalSkins  = isCosmeticCat ? cosmeticItems.length : skins.length;
  const unlockedCnt = isCosmeticCat
    ? cosmeticItems.filter(i => i.unlocked).length
    : skins.filter(([,s]) => s.unlocked).length;

  const handleSelect = (id, item) => {
    if (!item.unlocked) {
      addToast('Unlock this in the Shop! 🛒', 'info');
      return;
    }
    setCosmetic(currentCat.key, id);
    addToast(`${item.name || item.label} equipped! ✓`, 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1A120B 0%,#0D0805 55%,#1A120B 100%)', paddingBottom: 40 }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(255,215,0,0.12)',
        background: 'rgba(26,18,11,0.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFD700', flexShrink: 0 }}
        >
          <ArrowLeft size={18} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 20, color: '#FFD700', letterSpacing: 2 }}>
            COLLECTION
          </h1>
          <p style={{ margin: 0, fontFamily: "'Quicksand',sans-serif", fontSize: 11, color: '#A08060', letterSpacing: 1 }}>
            Personalise your game pieces
          </p>
        </div>
        <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.18)', borderRadius: 99, padding: '4px 12px' }}>
          <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, fontWeight: 800, color: '#FFD700' }}>
            {unlockedCnt}/{totalSkins} unlocked
          </span>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 4px', overflowX: 'auto' }}>
        {CATS.map(c => (
          <motion.button key={c.id} onClick={() => setCat(c.id)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 99, border: 'none',
              background: cat === c.id ? 'linear-gradient(135deg,#B8860B,#FFD700)' : 'rgba(40,29,20,0.85)',
              color: cat === c.id ? '#1A120B' : '#A08060',
              fontFamily: "'Quicksand',sans-serif", fontWeight: 800, fontSize: 13,
              cursor: 'pointer', flexShrink: 0,
              boxShadow: cat === c.id ? '0 4px 16px rgba(255,215,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 16 }}>{c.icon}</span> {c.label}
          </motion.button>
        ))}
      </div>

      {/* ── Currently equipped label ───────────────────────────────────────── */}
      <div style={{ padding: '10px 16px 2px' }}>
        <p style={{ margin: 0, fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#6B4C2A', fontWeight: 700 }}>
          Equipped:{' '}
          <span style={{ color: '#FFD700' }}>
            {isCosmeticCat
              ? (COSMETIC_LISTS[cat]?.find(i => i.id === selectedId)?.label || '—')
              : (ALL_SKINS[cat]?.[selectedId]?.name || '—')}
          </span>
          {' · '}changes apply in your next game
        </p>
      </div>

      {/* ── Items List (skins + cosmetics) ────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px' }}
        >
          {/* ── Skin categories (dice / board / tokens) ── */}
          {!isCosmeticCat && skins.map(([id, skin], i) => {
            const selected = selectedId === id;
            return (
              <motion.div key={id}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.045 }}
                whileHover={skin.unlocked ? { scale: 1.02, x: 3 } : {}}
                whileTap={skin.unlocked ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(id, skin)}
                style={{
                  position: 'relative', borderRadius: 18, overflow: 'hidden',
                  border: `2px solid ${selected ? '#FFD700' : skin.unlocked ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.05)'}`,
                  background: selected ? 'rgba(255,215,0,0.07)' : skin.unlocked ? 'rgba(40,29,20,0.88)' : 'rgba(18,12,8,0.88)',
                  cursor: skin.unlocked ? 'pointer' : 'default', opacity: skin.unlocked ? 1 : 0.6,
                  backdropFilter: 'blur(8px)',
                  boxShadow: selected ? '0 0 0 1px #FFD70044, 0 8px 24px rgba(255,215,0,0.12)' : '0 4px 16px rgba(0,0,0,0.3)',
                  transition: 'border-color 0.2s',
                }}
              >
                {selected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg,#FFD700,#B8860B)', borderRadius: '4px 0 0 4px' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px 14px 18px' }}>
                  {cat === 'dice'   && <DicePreview  skin={skin} />}
                  {cat === 'board'  && <BoardPreview skin={skin} />}
                  {cat === 'tokens' && <TokenPreview skin={skin} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15 }}>{skin.icon}</span>
                      <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 14, color: selected ? '#FFD700' : '#FFF5E1' }}>{skin.name}</span>
                      {selected && <span style={{ background: 'linear-gradient(135deg,#B8860B,#FFD700)', color: '#1A120B', fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 99, letterSpacing: 1 }}>EQUIPPED</span>}
                    </div>
                    <p style={{ margin: 0, fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#7A5C40', fontWeight: 600 }}>{skin.desc}</p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {selected ? (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#B8860B,#FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="#1A120B" strokeWidth={3} /></div>
                    ) : !skin.unlocked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={13} color="#6B4C2A" /></div>
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,215,0,0.15)' }} /></div>
                    )}
                  </div>
                </div>
                {!skin.unlocked && (
                  <div style={{ position: 'absolute', bottom: 8, right: 14, pointerEvents: 'none' }}>
                    <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 10, color: '#4A3020', fontWeight: 700 }}>
                      Unlock in Shop →
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* ── Cosmetic categories (avatarFrame / banner / background) ── */}
          {isCosmeticCat && cosmeticItems.map((item, i) => {
            const selected = selectedId === item.id;
            const BgC = cat === 'background' ? BACKGROUND_COMPONENTS[item.id] : null;
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={item.unlocked ? { scale: 1.02, x: 3 } : {}}
                whileTap={item.unlocked ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(item.id, item)}
                style={{
                  position: 'relative', borderRadius: 18, overflow: 'hidden',
                  border: `2px solid ${selected ? '#FFD700' : item.unlocked ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.05)'}`,
                  background: selected ? 'rgba(255,215,0,0.07)' : item.unlocked ? 'rgba(40,29,20,0.88)' : 'rgba(18,12,8,0.88)',
                  cursor: item.unlocked ? 'pointer' : 'default', opacity: item.unlocked ? 1 : 0.6,
                  backdropFilter: 'blur(8px)',
                  boxShadow: selected ? '0 0 0 1px #FFD70044, 0 8px 24px rgba(255,215,0,0.12)' : '0 4px 16px rgba(0,0,0,0.3)',
                  transition: 'border-color 0.2s',
                }}
              >
                {selected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg,#FFD700,#B8860B)', borderRadius: '4px 0 0 4px' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px 12px 18px' }}>
                  <div style={{ width: 72, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    {cat === 'banner'      && <AnimatedBanner bannerId={item.id} mini />}
                    {cat === 'avatarFrame' && <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', background:'rgba(0,0,0,0.3)', borderRadius:10 }}><AnimatedAvatarFrame frameId={item.id} size={44} /></div>}
                    {cat === 'background'  && <div style={{ width:'100%', height:'100%', borderRadius:10, overflow:'hidden', position:'relative' }}>{BgC && <BgC />}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, color: selected ? '#FFD700' : '#FFF5E1' }}>{item.label}</span>
                      {selected && <span style={{ background: 'linear-gradient(135deg,#B8860B,#FFD700)', color: '#1A120B', fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 99, letterSpacing: 1 }}>EQUIPPED</span>}
                    </div>
                    <p style={{ margin: 0, fontFamily: "'Quicksand',sans-serif", fontSize: 11, color: '#7A5C40', fontWeight: 600 }}>{item.description}</p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {selected ? (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#B8860B,#FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="#1A120B" strokeWidth={3} /></div>
                    ) : !item.unlocked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={13} color="#6B4C2A" /></div>
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,215,0,0.15)' }} /></div>
                    )}
                  </div>
                </div>
                {!item.unlocked && (
                  <div style={{ position: 'absolute', bottom: 8, right: 14, pointerEvents: 'none' }}>
                    <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 10, color: '#4A3020', fontWeight: 700 }}>Unlock in Shop →</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Shop CTA ─────────────────────────────────────────────── */}
      <div style={{ padding: '4px 16px 16px' }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/shop')}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 16,
            border: '1px solid rgba(255,215,0,0.28)',
            background: 'rgba(255,215,0,0.05)', color: '#FFD700',
            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13,
            cursor: 'pointer', letterSpacing: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          🛒 Unlock More Skins in the Shop
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CollectionPage;
