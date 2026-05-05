import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

/* ─── Dice skin definitions ─────────────────────────────────────── */
const DICE_SKINS = [
  { id: 'classic',  name: 'Classic',    icon: '🎲', desc: 'Ivory white, charcoal pips', unlocked: true,  preview: 'linear-gradient(145deg,#FFFFF8,#EDE8D8)' },
  { id: 'obsidian', name: 'Obsidian',   icon: '🖤', desc: 'Glossy jet-black cube',       unlocked: true,  preview: 'linear-gradient(145deg,#2d2d2d,#111)' },
  { id: 'ruby',     name: 'Ruby',       icon: '💎', desc: 'Deep crimson gem dice',       unlocked: false, preview: 'linear-gradient(145deg,#c0392b,#7b0a0a)' },
  { id: 'sapphire', name: 'Sapphire',   icon: '🔷', desc: 'Royal blue crystal',          unlocked: false, preview: 'linear-gradient(145deg,#1a4a8a,#0a1f5a)' },
  { id: 'emerald',  name: 'Emerald',    icon: '💚', desc: 'Verdant forest green',        unlocked: false, preview: 'linear-gradient(145deg,#1a7a4a,#0a3d1a)' },
  { id: 'gold',     name: 'Gold Crown', icon: '👑', desc: 'Solid 24K gold finish',       unlocked: false, preview: 'linear-gradient(145deg,#FFD700,#B8860B)' },
];

/* ─── Board skin definitions ─────────────────────────────────────── */
const BOARD_SKINS = [
  { id: 'walnut',    name: 'Dark Walnut',    icon: '🪵', desc: 'Premium walnut wood grain',  unlocked: true,  preview: 'linear-gradient(145deg,#2C1A0E,#1F1208)' },
  { id: 'marble',   name: 'White Marble',   icon: '🏛️', desc: 'Elegant Italian marble',     unlocked: false, preview: 'linear-gradient(145deg,#f5f5f5,#d4c4b0)' },
  { id: 'cosmic',   name: 'Cosmic',         icon: '🌌', desc: 'Deep space nebula board',    unlocked: false, preview: 'linear-gradient(145deg,#0f0c29,#302b63)' },
  { id: 'jade',     name: 'Jade Temple',    icon: '🟩', desc: 'Ancient jade stone finish',  unlocked: false, preview: 'linear-gradient(145deg,#1a6b47,#0d3d28)' },
  { id: 'neon',     name: 'Neon Grid',      icon: '💡', desc: 'Cyberpunk holographic grid', unlocked: false, preview: 'linear-gradient(145deg,#0d0d0d,#1a1a2e)' },
  { id: 'parchment',name: 'Ancient Scroll', icon: '📜', desc: 'Worn parchment & ink',       unlocked: false, preview: 'linear-gradient(145deg,#d4a853,#a0722a)' },
];

/* ─── Token skin definitions ─────────────────────────────────────── */
const TOKEN_SKINS = [
  { id: 'jewel',   name: 'Jewel Gems',    icon: '💎', desc: 'Layered gem 3D tokens',       unlocked: true,  colors: ['#C0392B','#1A7A4A','#B8860B','#1A4A8A'] },
  { id: 'knight',  name: 'Chess Knights', icon: '♟️', desc: 'Carved chess piece tokens',   unlocked: false, colors: ['#8B4513','#D2691E','#A0522D','#6B3A2A'] },
  { id: 'crystal', name: 'Crystal Orbs',  icon: '🔮', desc: 'Glowing crystal spheres',     unlocked: false, colors: ['#FF6B9D','#A855F7','#3B82F6','#10B981'] },
  { id: 'fire',    name: 'Flame Tokens',  icon: '🔥', desc: 'Living flame pieces',         unlocked: false, colors: ['#FF4500','#FF8C00','#FFD700','#FF6347'] },
  { id: 'metal',   name: 'Metal Crowns',  icon: '👑', desc: 'Polished metal crown tokens', unlocked: false, colors: ['#C0C0C0','#FFD700','#CD7F32','#E5E4E2'] },
  { id: 'emoji',   name: 'Emoji Crew',    icon: '😎', desc: 'Fun emoji face tokens',       unlocked: false, colors: ['#FFD700','#FF6B9D','#3B82F6','#10B981'] },
];

/* ─── Category tab ───────────────────────────────────────────────── */
const CATS = [
  { id: 'dice',   label: 'Dice',   icon: '🎲' },
  { id: 'board',  label: 'Board',  icon: '🏁' },
  { id: 'tokens', label: 'Tokens', icon: '♟️' },
];

const cardStyle = (selected, unlocked) => ({
  position: 'relative',
  borderRadius: 18,
  border: `2px solid ${selected ? '#FFD700' : unlocked ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
  background: selected
    ? 'rgba(255,215,0,0.08)'
    : unlocked
    ? 'rgba(40,29,20,0.85)'
    : 'rgba(20,14,10,0.85)',
  cursor: unlocked ? 'pointer' : 'default',
  overflow: 'hidden',
  transition: 'border-color 0.2s, transform 0.15s',
  backdropFilter: 'blur(8px)',
  boxShadow: selected
    ? '0 0 0 1px #FFD70055, 0 8px 24px rgba(255,215,0,0.15)'
    : '0 4px 16px rgba(0,0,0,0.3)',
  opacity: unlocked ? 1 : 0.65,
});

const CollectionPage = () => {
  const navigate = useNavigate();
  const { addToast } = useGameStore();

  const [cat, setCat]             = useState('dice');
  const [selectedDice, setDice]   = useState('classic');
  const [selectedBoard, setBoard] = useState('walnut');
  const [selectedToken, setToken] = useState('jewel');

  const handleSelect = (id, setter, skins) => {
    const skin = skins.find(s => s.id === id);
    if (!skin?.unlocked) {
      addToast('Unlock this skin in the Shop! 🛒', 'info');
      return;
    }
    setter(id);
    addToast('Skin equipped! ✓', 'success');
  };

  const renderDicePreview = (skin) => (
    <div style={{
      width: 64, height: 64, borderRadius: 14,
      background: skin.preview,
      boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
      padding: 10, gap: 5, flexShrink: 0,
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: '50%',
          background: skin.id === 'obsidian' ? 'rgba(255,255,255,0.7)' : skin.id === 'gold' ? '#5c3200' : 'rgba(30,20,10,0.8)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
        }} />
      ))}
    </div>
  );

  const renderBoardPreview = (skin) => (
    <div style={{
      width: 64, height: 64, borderRadius: 14,
      background: skin.preview,
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.4)',
      display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)',
      gap: 2, padding: 8, flexShrink: 0,
    }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{
          borderRadius: 3,
          background: [0,2,6,8].includes(i)
            ? 'rgba(255,255,255,0.12)'
            : i === 4
            ? 'rgba(255,215,0,0.3)'
            : 'rgba(255,255,255,0.05)',
        }} />
      ))}
    </div>
  );

  const renderTokenPreview = (skin) => (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {skin.colors.slice(0, 4).map((c, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${c}dd, ${c}66)`,
          boxShadow: `inset 0 1px 3px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.4)`,
          border: `1px solid ${c}88`,
        }} />
      ))}
    </div>
  );

  const skins   = cat === 'dice' ? DICE_SKINS : cat === 'board' ? BOARD_SKINS : TOKEN_SKINS;
  const current = cat === 'dice' ? selectedDice : cat === 'board' ? selectedBoard : selectedToken;
  const setter  = cat === 'dice' ? setDice : cat === 'board' ? setBoard : setToken;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg,#1A120B 0%,#0D0805 55%,#1A120B 100%)',
        paddingBottom: 40,
      }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(255,215,0,0.12)',
        background: 'rgba(26,18,11,0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFD700', flexShrink: 0 }}
        >
          <ArrowLeft size={18} />
        </motion.button>

        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 20, color: '#FFD700', letterSpacing: 2 }}>
            COLLECTION
          </h1>
          <p style={{ margin: 0, fontFamily: "'Quicksand', sans-serif", fontSize: 11, color: '#A08060', letterSpacing: 1 }}>
            Personalise your game
          </p>
        </div>

        {/* Unlocked count badge */}
        <div style={{ marginLeft: 'auto', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 99, padding: '4px 12px' }}>
          <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 12, fontWeight: 800, color: '#FFD700' }}>
            {skins.filter(s => s.unlocked).length}/{skins.length} unlocked
          </span>
        </div>
      </div>

      {/* ── Category Tabs ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0', overflowX: 'auto' }}>
        {CATS.map(c => (
          <motion.button
            key={c.id}
            onClick={() => setCat(c.id)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 99, border: 'none',
              background: cat === c.id
                ? 'linear-gradient(135deg,#B8860B,#FFD700)'
                : 'rgba(40,29,20,0.8)',
              color: cat === c.id ? '#1A120B' : '#A08060',
              fontFamily: "'Quicksand', sans-serif", fontWeight: 800,
              fontSize: 13, cursor: 'pointer', flexShrink: 0,
              boxShadow: cat === c.id ? '0 4px 16px rgba(255,215,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            {c.label}
          </motion.button>
        ))}
      </div>

      {/* ── Active Category Description ───────────────────────────── */}
      <div style={{ padding: '12px 16px 4px' }}>
        <p style={{ margin: 0, fontFamily: "'Quicksand', sans-serif", fontSize: 12, color: '#6B4C2A', fontWeight: 700 }}>
          {cat === 'dice' && 'Tap a dice skin to equip it for all your games.'}
          {cat === 'board' && 'Change your board background and texture.'}
          {cat === 'tokens' && 'Choose the look of your game pieces.'}
        </p>
      </div>

      {/* ── Skins Grid ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px' }}
        >
          {skins.map((skin, i) => {
            const selected = current === skin.id;
            return (
              <motion.div
                key={skin.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={skin.unlocked ? { scale: 1.02, x: 4 } : {}}
                whileTap={skin.unlocked ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(skin.id, setter, skins)}
                style={cardStyle(selected, skin.unlocked)}
              >
                {/* Selected glow bar */}
                {selected && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    background: 'linear-gradient(180deg,#FFD700,#B8860B)',
                    borderRadius: '4px 0 0 4px',
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px 14px 20px' }}>
                  {/* Preview */}
                  {cat === 'dice'   && renderDicePreview(skin)}
                  {cat === 'board'  && renderBoardPreview(skin)}
                  {cat === 'tokens' && (
                    <div style={{ width: 64, height: 64, borderRadius: 14, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {renderTokenPreview(skin)}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 15 }}>{skin.icon}</span>
                      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: selected ? '#FFD700' : '#FFF5E1' }}>
                        {skin.name}
                      </span>
                      {selected && (
                        <span style={{ background: 'linear-gradient(135deg,#B8860B,#FFD700)', color: '#1A120B', fontSize: 9, fontWeight: 900, padding: '2px 7px', borderRadius: 99, letterSpacing: 1 }}>
                          EQUIPPED
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontFamily: "'Quicksand', sans-serif", fontSize: 12, color: '#7A5C40', fontWeight: 600 }}>
                      {skin.desc}
                    </p>
                  </div>

                  {/* Status icon */}
                  <div style={{ flexShrink: 0 }}>
                    {selected ? (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#B8860B,#FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} color="#1A120B" strokeWidth={3} />
                      </div>
                    ) : !skin.unlocked ? (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={13} color="#6B4C2A" />
                      </div>
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,215,0,0.15)' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Locked overlay hint */}
                {!skin.unlocked && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    padding: '0 16px', pointerEvents: 'none',
                  }}>
                    <span style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 10, color: '#4A3020', fontWeight: 700 }}>
                      Unlock in Shop →
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Shop CTA ─────────────────────────────────────────────── */}
      <div style={{ padding: '8px 16px 16px' }}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/shop')}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 16, border: '1px solid rgba(255,215,0,0.3)',
            background: 'rgba(255,215,0,0.06)', color: '#FFD700',
            fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14,
            cursor: 'pointer', letterSpacing: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          🛒 Unlock More in the Shop
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CollectionPage;
