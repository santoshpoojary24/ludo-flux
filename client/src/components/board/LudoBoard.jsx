import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import Token from './Token';

/* ── Board constants ──────────────────────────────────────────────────────── */
const COLORS = ['red', 'green', 'yellow', 'blue'];
const START_OFFSETS = { red: 0, green: 13, yellow: 26, blue: 39 };

// 52-cell main path around the 15×15 board (column, row) 0-indexed
const PATH = [
  {c:1,r:6},{c:2,r:6},{c:3,r:6},{c:4,r:6},{c:5,r:6},         // 0-4  red arm in
  {c:6,r:5},{c:6,r:4},{c:6,r:3},{c:6,r:2},{c:6,r:1},{c:6,r:0},// 5-10
  {c:7,r:0},{c:8,r:0},                                          // 11-12
  {c:8,r:1},{c:8,r:2},{c:8,r:3},{c:8,r:4},{c:8,r:5},          // 13-17 green arm in
  {c:9,r:6},{c:10,r:6},{c:11,r:6},{c:12,r:6},{c:13,r:6},{c:14,r:6},// 18-23
  {c:14,r:7},{c:14,r:8},                                        // 24-25
  {c:13,r:8},{c:12,r:8},{c:11,r:8},{c:10,r:8},{c:9,r:8},      // 26-30 yellow arm in
  {c:8,r:9},{c:8,r:10},{c:8,r:11},{c:8,r:12},{c:8,r:13},{c:8,r:14},// 31-36
  {c:7,r:14},{c:6,r:14},                                        // 37-38
  {c:6,r:13},{c:6,r:12},{c:6,r:11},{c:6,r:10},{c:6,r:9},      // 39-43 blue arm in
  {c:5,r:8},{c:4,r:8},{c:3,r:8},{c:2,r:8},{c:1,r:8},{c:0,r:8},// 44-49
  {c:0,r:7},{c:0,r:6},                                          // 50-51
];

// Home stretch for each color (positions 51–55 map to index 0–4)
const STRETCH = {
  red:    [{c:1,r:7},{c:2,r:7},{c:3,r:7},{c:4,r:7},{c:5,r:7}],
  green:  [{c:7,r:1},{c:7,r:2},{c:7,r:3},{c:7,r:4},{c:7,r:5}],
  yellow: [{c:13,r:7},{c:12,r:7},{c:11,r:7},{c:10,r:7},{c:9,r:7}],
  blue:   [{c:7,r:13},{c:7,r:12},{c:7,r:11},{c:7,r:10},{c:7,r:9}],
};

// Cells that are safe zones (star positions)
const SAFE_IDX = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
// Color of each safe cell's star
const SAFE_COLOR = { 0:'red',8:'red', 13:'green',21:'green', 26:'yellow',34:'yellow', 39:'blue',47:'blue' };

const getCoord = (color, pos) => {
  if (pos < 0) return null;
  if (pos === 56) return { c:7, r:7 };                        // HOME center
  if (pos >= 51 && pos <= 55) return STRETCH[color][pos-51];  // home stretch
  return PATH[(START_OFFSETS[color] + pos) % 52];             // main path
};

/* ── Token circle component ─────────────────────────────────────────────────  */


/* ── Main Board ─────────────────────────────────────────────────────────────  */
const LudoBoard = ({ onMoveToken, myColor: myColorProp }) => {
  const { gameState, user, settings } = useGameStore();
  const [captureFlash, setCaptureFlash] = useState(null);
  const [visualTokens, setVisualTokens] = useState(null);
  const prevTokens = useRef(null);

  /* Step-by-step token movement animation */
  useEffect(() => {
    if (!gameState?.tokens) return;
    
    // First load
    if (!visualTokens) {
      setVisualTokens(JSON.parse(JSON.stringify(gameState.tokens)));
      prevTokens.current = gameState.tokens;
      return;
    }

    const targetTokens = gameState.tokens;
    const newVisual = JSON.parse(JSON.stringify(visualTokens));
    const stepsQueue = [];

    COLORS.forEach(color => {
      for (let i = 0; i < 4; i++) {
        const vPos = visualTokens[color]?.[i]?.position ?? -1;
        const tPos = targetTokens[color]?.[i]?.position ?? -1;
        
        if (vPos !== tPos) {
          // Token is captured and returning to base
          if (tPos === -1 && vPos >= 0) {
            newVisual[color][i].position = -1;
            // Trigger capture flash
            const coord = getCoord(color, vPos);
            if (coord) {
              setCaptureFlash(`${coord.c},${coord.r}`);
              setTimeout(() => setCaptureFlash(null), 800);
            }
          } 
          // Normal step-by-step forward movement
          else if (tPos > vPos) {
            for (let step = vPos + 1; step <= tPos; step++) {
              stepsQueue.push({ color, index: i, position: step });
            }
          } 
          // Any other weird case (just snap)
          else {
            newVisual[color][i].position = tPos;
          }
        }
      }
    });

    if (stepsQueue.length > 0) {
      let stepIndex = 0;
      const animateStep = () => {
        if (stepIndex >= stepsQueue.length) {
          setVisualTokens(JSON.parse(JSON.stringify(targetTokens)));
          return;
        }
        
        const step = stepsQueue[stepIndex];
        setVisualTokens(prev => {
          if (!prev) return prev;
          const next = JSON.parse(JSON.stringify(prev));
          if (next[step.color] && next[step.color][step.index]) {
            next[step.color][step.index].position = step.position;
          }
          return next;
        });
        
        stepIndex++;
        // 180ms per step feels natural
        setTimeout(animateStep, 180);
      };
      animateStep();
    } else {
      setVisualTokens(newVisual);
    }
    
    prevTokens.current = gameState.tokens;
  }, [gameState?.tokens]);

  /* Derive turn/player state */
const myPlayer    = gameState?.players?.find(p => p.uid === user?.uid && !p.isBot);
  const myColor     = myColorProp ?? myPlayer?.color ?? null;
  const isPassPlay  = gameState?.roomCode?.startsWith('LOCAL-');
  const turnColor   = gameState?.turn;
  const turnPlayer  = gameState?.players?.find(p => p.color === turnColor);
  const isMyTurn    = myColor !== null && (
    turnColor === myColor ||
    (isPassPlay && turnPlayer?.isLocal)
  );
  const [activeDiceValue, setActiveDiceValue] = useState(null);

  useEffect(() => {
    if (gameState?.diceValue !== null) {
      // Wait for the physical dice throw animation (800ms) to complete 
      // before lighting up tokens or triggering auto-moves.
      const timer = setTimeout(() => {
        setActiveDiceValue(gameState.diceValue);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setActiveDiceValue(null);
    }
  }, [gameState?.diceValue]);

  const diceValue   = activeDiceValue;

  // Compute board rotation so that the player's home base is always at the bottom-left
  const boardRotation = (() => {
    // Base origins: Blue=BottomLeft(0deg), Red=TopLeft(-90deg), Green=TopRight(-180deg), Yellow=BottomRight(-270deg)
    const map = { blue: 0, red: -90, green: -180, yellow: -270 };
    return myColor ? map[myColor] : 0;
  })();

  // Auto-move when only one token is clickable after dice roll
  useEffect(() => {
    if (!isMyTurn || !diceValue) return;
    const movable = [];
    COLORS.forEach(color => {
      if (color !== myColor) return;
      const tokens = gameState?.tokens?.[color] || [];
      tokens.forEach((tok, idx) => {
        if (isClickable(color, tok)) {
          movable.push({ color, idx });
        }
      });
    });
    if (movable.length === 1) {
      // Slight delay for UI feedback
      setTimeout(() => {
        const { color, idx } = movable[0];
        onMoveToken(color, idx);
      }, 400);
    }
  }, [diceValue, isMyTurn, gameState?.tokens]);

  const isClickable = (color, token) => {
    if (!isMyTurn || !diceValue) return false;
    const allowed = (color === myColor) || (isPassPlay && color === turnColor);
    if (!allowed) return false;
    if (token.position === -1)  return diceValue === 6;
    if (token.position >= 56)   return false;
    return token.position + diceValue <= 56;
  };

  /* Build a map: gridKey → list of active tokens */
  const atCoord = {};
  COLORS.forEach(color => {
    (visualTokens?.[color] || gameState?.tokens?.[color] || []).forEach((tok, idx) => {
      if (tok.position < 0) return;
      const coord = getCoord(color, tok.position);
      if (!coord) return;
      const k = `${coord.c},${coord.r}`;
      (atCoord[k] = atCoord[k] || []).push({ color, idx, tok, coord });
    });
  });

  const CELL = 100 / 15; // % width/height per grid cell

  /* Base slot positions (top-left corner of the 6×6 home square) */
  const BASE_ORIGIN = {
    red:    { c:0, r:0 },
    green:  { c:9, r:0 },
    blue:   { c:0, r:9 },
    yellow: { c:9, r:9 },
  };
  /* 2×2 slot offsets within each base */
  const SLOT_OFFSETS = [
    { dc:1.1, dr:1.1 }, { dc:3.4, dr:1.1 },
    { dc:1.1, dr:3.4 }, { dc:3.4, dr:3.4 },
  ];

  return (
    <div
      style={{
        width: 'clamp(300px, 94vw, 490px)',
        height: 'clamp(300px, 94vw, 490px)',
        position: 'relative',
        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 50px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.8)',
        border: '3px solid rgba(255,255,255,0.6)',
        userSelect: 'none',
        flexShrink: 0,
        // Apply rotation based on player side
        transform: `rotate(${boardRotation}deg)`,
        transformOrigin: 'center',
        transition: 'transform 0.4s ease-out',
      }}
    >

      {/* ── Coloured quadrant backgrounds ──────────────────────────────────── */}
      {COLORS.map(color => {
        const o = BASE_ORIGIN[color];
        return (
          <div key={color} style={{
            position: 'absolute',
            left:   `${o.c * CELL}%`,
            top:    `${o.r * CELL}%`,
            width:  `${CELL * 6}%`,
            height: `${CELL * 6}%`,
            background: `radial-gradient(circle at 25% 25%, color-mix(in srgb, var(--token-${color}) 30%, white), var(--token-${color}) 50%, color-mix(in srgb, var(--token-${color}) 60%, black))`,
            boxShadow: `inset 2px 2px 8px rgba(255,255,255,0.4), inset -4px -4px 12px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.15)`,
            border: `1.5px solid rgba(255,255,255,0.5)`,
            borderRadius: '16px',
          }} />
        );
      })}

      {/* ── Inner base circles (4 token slots) ─────────────────────────────── */}
      {COLORS.map(color => {
        const tokens = visualTokens?.[color] || gameState?.tokens?.[color] || [{position:-1},{position:-1},{position:-1},{position:-1}];
        const o = BASE_ORIGIN[color];
        const player = gameState?.players?.find(p => p.color === color);
        return SLOT_OFFSETS.map((off, si) => {
          const tok   = tokens[si] || { position: -1 };
          const inBase = tok.position === -1;
          const click  = inBase && isClickable(color, tok);
          const cx     = (o.c + off.dc) * CELL;
          const cy     = (o.r + off.dr) * CELL;
          return (
            <React.Fragment key={`${color}-slot-${si}`}>
              {/* Slot circle background */}
              <div style={{
                position: 'absolute',
                left: `${cx}%`, top: `${cy}%`,
                width: `${CELL * 1.3}%`, height: `${CELL * 1.3}%`,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: inBase ? `rgba(255,255,255,0.25)` : 'rgba(0,0,0,0.12)',
                boxShadow: inBase ? 'inset 1px 1px 3px rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.1)' : 'inset 2px 2px 6px rgba(0,0,0,0.4), 0 1px 1px rgba(255,255,255,0.2)',
                border: `1px solid rgba(255,255,255,0.4)`,
              }} />
              {/* Token in base */}
              {inBase && (
                <motion.div
                  layoutId={`token-${color}-${si}`}
                  onClick={() => click && onMoveToken(color, si)}
                  style={{
                    position: 'absolute',
                    width: `${CELL * 0.8}%`,
                    height: `${CELL * 0.8}%`,
                    cursor: click ? 'pointer' : 'default',
                    zIndex: 8,
                    filter: click ? `drop-shadow(0 0 6px var(--token-${color}))` : `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
                  }}
                  initial={{
                    left: `calc(${cx - CELL * 0.4}%)`, 
                    top: `calc(${cy - CELL * 0.4}%)`,
                  }}
                  animate={{
                    left: `calc(${cx - CELL * 0.4}%)`, 
                    top: `calc(${cy - CELL * 0.4}%)`,
                    ...(click && settings.showValidMoves ? { scale:[1,1.18,1], opacity:[0.85,1,0.85] } : { scale:1, opacity:1 })
                  }}
                  transition={{ 
                    left: { type: 'spring', stiffness: 400, damping: 30 },
                    top: { type: 'spring', stiffness: 400, damping: 30 },
                    ...(click ? { scale: { repeat:Infinity, duration:1.0 }, opacity: { repeat:Infinity, duration:1.0 } } : {})
                  }}
                >
                  <Token color={color} clickable={click} isBot={player?.isBot} size="100%" boardRotation={boardRotation} />
                </motion.div>
              )}
            </React.Fragment>
          );
        });
      })}

      {/* ── Path cells ──────────────────────────────────────────────────────── */}
      {PATH.map((coord, idx) => {
        const isSafe = SAFE_IDX.has(idx);
        const sc     = SAFE_COLOR[idx];
        return (
          <div key={`cell-${idx}`} style={{
            position: 'absolute',
            left: `${coord.c * CELL}%`, top: `${coord.r * CELL}%`,
            width: `${CELL}%`, height: `${CELL}%`,
            background: isSafe ? `var(--token-${sc})18` : 'linear-gradient(135deg, #ffffff, #f1f5f9)',
            border: `1px solid ${isSafe ? `var(--token-${sc})` : 'rgba(200,210,220,0.4)'}`,
            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,1), inset -1px -1px 2px rgba(0,0,0,0.03)',
            boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isSafe && (
              <div style={{
                width: '52%', height: '52%',
                background: `var(--token-${sc})`,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                opacity: 0.65,
              }} />
            )}
          </div>
        );
      })}

      {/* ── Home stretch cells ───────────────────────────────────────────────  */}
      {COLORS.flatMap(color =>
        STRETCH[color].map((coord, i) => (
          <div key={`hs-${color}-${i}`} style={{
            position: 'absolute',
            left: `${coord.c * CELL}%`, top: `${coord.r * CELL}%`,
            width: `${CELL}%`, height: `${CELL}%`,
            background: `linear-gradient(135deg, color-mix(in srgb, var(--token-${color}) 60%, white), var(--token-${color}))`,
            opacity: 0.25 + i * 0.15,
            boxSizing: 'border-box',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.5)',
          }} />
        ))
      )}

      {/* ── Centre HOME tile ─────────────────────────────────────────────────  */}
      <div style={{
        position: 'absolute',
        left: `${7 * CELL}%`, top: `${7 * CELL}%`,
        width: `${CELL}%`, height: `${CELL}%`,
        zIndex: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: `conic-gradient(var(--token-red) 0 90deg, var(--token-green) 90deg 180deg, var(--token-yellow) 180deg 270deg, var(--token-blue) 270deg 360deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 2px 2px 10px rgba(255,255,255,0.5), inset -2px -2px 10px rgba(0,0,0,0.3)',
          clipPath: 'polygon(50% 50%, 0 0, 100% 0, 50% 50%, 100% 100%, 50% 50%, 0 100%, 50% 50%)' // Add a star shape or nice cut? actually a simple conic with an inner circle is better
        }}>
          <div style={{
            width: '40%', height: '40%', borderRadius: '50%',
            background: '#fff', display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2), inset 1px 1px 3px rgba(0,0,0,0.1)'
          }}>
            <span style={{ color:'#333', fontWeight:900, fontSize:'clamp(5px,0.8vw,8px)', letterSpacing:1 }}>
              HOME
            </span>
          </div>
        </div>
      </div>

      {/* ── Active tokens on the path ────────────────────────────────────────  */}
      {Object.entries(atCoord).map(([key, items]) => {
        const count = items.length;
        // Stacking offsets when multiple tokens share a cell
        const STACKS = [
          [{ dx:0, dy:0 }],
          [{ dx:-8, dy:0 },{ dx:8, dy:0 }],
          [{ dx:-8, dy:-5 },{ dx:8, dy:-5 },{ dx:0, dy:8 }],
          [{ dx:-8, dy:-8 },{ dx:8, dy:-8 },{ dx:-8, dy:8 },{ dx:8, dy:8 }],
        ];
        const offsets = STACKS[Math.min(count - 1, 3)];
        const scale   = count > 1 ? 0.72 : 0.88;

        return items.map(({ color, idx, tok, coord }, si) => {
          const click   = isClickable(color, tok);
          const isFlash = captureFlash === key;
          const { dx, dy } = offsets[si] || { dx:0, dy:0 };
          const cx = (coord.c + 0.5) * CELL;
          const cy = (coord.r + 0.5) * CELL;
          const player = gameState?.players?.find(p => p.color === color);

          return (
            <motion.div
              key={`active-${color}-${idx}`}
              layoutId={`token-${color}-${idx}`}
              style={{
                position: 'absolute',
                width: `${CELL * 0.8}%`,
                height: `${CELL * 0.8}%`,
                zIndex: click ? 20 : 10,
                cursor: click ? 'pointer' : 'default',
                filter: click
                  ? `drop-shadow(0 0 8px var(--token-${color}))`
                  : `drop-shadow(0 2px 5px rgba(0,0,0,0.35))`,
              }}
              initial={false}
              animate={{
                left: `calc(${cx - CELL * 0.4}% + ${dx}px)`, 
                top: `calc(${cy - CELL * 0.4}% + ${dy}px)`,
                ...(click && settings.showValidMoves ? { scale: [scale, scale*1.2, scale] } : { scale })
              }}
              transition={{
                left: { type: 'spring', stiffness: 500, damping: 35 },
                top: { type: 'spring', stiffness: 500, damping: 35 },
                ...(click ? { scale: { repeat:Infinity, duration:0.9 } } : { scale: { type:'spring', stiffness:320, damping:22 } })
              }}
              onClick={() => click && onMoveToken(color, idx)}
            >
              {/* Capture flash ring */}
              {isFlash && (
                <motion.div
                  initial={{ scale:0.8, opacity:0.8 }}
                  animate={{ scale:2.5, opacity:0 }}
                  transition={{ duration:0.75 }}
                  style={{
                    position:'absolute', inset:-6,
                    borderRadius:'50%',
                    border:'3px solid #ef4444',
                    background:'rgba(239,68,68,0.25)',
                    pointerEvents:'none',
                  }}
                />
              )}
              <Token
                color={color}
                clickable={click && settings.showValidMoves}
                boardRotation={boardRotation}
                size="100%"
              />
            </motion.div>
          );
        });
      })}
    </div>
  );
};

export default LudoBoard;
