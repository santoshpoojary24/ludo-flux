import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import Token from './Token';

/* ── Board constants ────────────────────────────────────────────────────────── */
const COLORS = ['red', 'green', 'yellow', 'blue'];
const START_OFFSETS = { red: 0, green: 13, yellow: 26, blue: 39 };

/* 52-cell main path (col, row) 0-indexed on a 15×15 grid */
const PATH = [
  {c:1,r:6},{c:2,r:6},{c:3,r:6},{c:4,r:6},{c:5,r:6},
  {c:6,r:5},{c:6,r:4},{c:6,r:3},{c:6,r:2},{c:6,r:1},{c:6,r:0},
  {c:7,r:0},{c:8,r:0},
  {c:8,r:1},{c:8,r:2},{c:8,r:3},{c:8,r:4},{c:8,r:5},
  {c:9,r:6},{c:10,r:6},{c:11,r:6},{c:12,r:6},{c:13,r:6},{c:14,r:6},
  {c:14,r:7},{c:14,r:8},
  {c:13,r:8},{c:12,r:8},{c:11,r:8},{c:10,r:8},{c:9,r:8},
  {c:8,r:9},{c:8,r:10},{c:8,r:11},{c:8,r:12},{c:8,r:13},{c:8,r:14},
  {c:7,r:14},{c:6,r:14},
  {c:6,r:13},{c:6,r:12},{c:6,r:11},{c:6,r:10},{c:6,r:9},
  {c:5,r:8},{c:4,r:8},{c:3,r:8},{c:2,r:8},{c:1,r:8},{c:0,r:8},
  {c:0,r:7},{c:0,r:6},
];

/* Home stretch per colour */
const STRETCH = {
  red:    [{c:1,r:7},{c:2,r:7},{c:3,r:7},{c:4,r:7},{c:5,r:7}],
  green:  [{c:7,r:1},{c:7,r:2},{c:7,r:3},{c:7,r:4},{c:7,r:5}],
  yellow: [{c:13,r:7},{c:12,r:7},{c:11,r:7},{c:10,r:7},{c:9,r:7}],
  blue:   [{c:7,r:13},{c:7,r:12},{c:7,r:11},{c:7,r:10},{c:7,r:9}],
};

/* Safe (star) cells */
const SAFE_IDX = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const SAFE_COLOR = { 0:'red',8:'red', 13:'green',21:'green', 26:'yellow',34:'yellow', 39:'blue',47:'blue' };

/* ─── Jewel-tone quadrant colours ────────────────────────────────────────────── */
const QUAD_COLORS = {
  red:    { bg: 'hsl(348,72%,34%)', light: 'hsl(348,65%,52%)', glow: 'rgba(160,20,45,0.55)' },
  green:  { bg: 'hsl(152,65%,22%)', light: 'hsl(152,60%,38%)', glow: 'rgba(15,110,55,0.55)' },
  yellow: { bg: 'hsl(40,80%,32%)',  light: 'hsl(42,85%,50%)',  glow: 'rgba(180,130,10,0.55)' },
  blue:   { bg: 'hsl(220,80%,26%)', light: 'hsl(220,75%,44%)', glow: 'rgba(15,50,160,0.55)' },
};

const getCoord = (color, pos) => {
  if (pos < 0) return null;
  if (pos === 56) return { c:7, r:7 };
  if (pos >= 51 && pos <= 55) return STRETCH[color][pos - 51];
  return PATH[(START_OFFSETS[color] + pos) % 52];
};

/* ── Main Board ─────────────────────────────────────────────────────────────── */
const LudoBoard = ({ onMoveToken, myColor: myColorProp }) => {
  const { gameState, user, settings } = useGameStore();
  const [captureFlash, setCaptureFlash] = useState(null);
  const [visualTokens, setVisualTokens] = useState(null);
  const prevTokens = useRef(null);

  /* ── Step-by-step token movement animation ─────────────────────────────────  */
  useEffect(() => {
    if (!gameState?.tokens) return;

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
          if (tPos === -1 && vPos >= 0) {
            newVisual[color][i].position = -1;
            const coord = getCoord(color, vPos);
            if (coord) {
              setCaptureFlash(`${coord.c},${coord.r}`);
              setTimeout(() => setCaptureFlash(null), 900);
            }
          } else if (tPos > vPos) {
            for (let step = vPos + 1; step <= tPos; step++) {
              stepsQueue.push({ color, index: i, position: step });
            }
          } else {
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
          if (next[step.color]?.[step.index]) next[step.color][step.index].position = step.position;
          return next;
        });
        stepIndex++;
        setTimeout(animateStep, 185);
      };
      animateStep();
    } else {
      setVisualTokens(newVisual);
    }
    prevTokens.current = gameState.tokens;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.tokens]);

  /* ── Derive turn / player state ─────────────────────────────────────────────  */
  const myPlayer   = gameState?.players?.find(p => p.uid === user?.uid && !p.isBot);
  const myColor    = myColorProp ?? myPlayer?.color ?? null;
  const isPassPlay = gameState?.roomCode?.startsWith('LOCAL-');
  const turnColor  = gameState?.turn;
  const turnPlayer = gameState?.players?.find(p => p.color === turnColor);
  const isMyTurn   = myColor !== null && (
    turnColor === myColor ||
    (isPassPlay && turnPlayer?.isLocal)
  );

  const [activeDiceValue, setActiveDiceValue] = useState(null);
  useEffect(() => {
    if (gameState?.diceValue !== null) {
      const t = setTimeout(() => setActiveDiceValue(gameState.diceValue), 800);
      return () => clearTimeout(t);
    }
    setActiveDiceValue(null);
  }, [gameState?.diceValue]);
  const diceValue = activeDiceValue;

  /* Board rotation so current player's home is always bottom-left */
  const boardRotation = (() => {
    const map = { blue: 0, red: -90, green: -180, yellow: -270 };
    return myColor ? map[myColor] : 0;
  })();

  /* Auto-move when only one token is movable */
  useEffect(() => {
    if (!isMyTurn || !diceValue) return;
    const movable = [];
    COLORS.forEach(color => {
      if (color !== myColor) return;
      (gameState?.tokens?.[color] || []).forEach((tok, idx) => {
        if (isClickable(color, tok)) movable.push({ color, idx });
      });
    });
    if (movable.length === 1) {
      setTimeout(() => onMoveToken(movable[0].color, movable[0].idx), 420);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceValue, isMyTurn, gameState?.tokens]);

  const isClickable = (color, token) => {
    if (!isMyTurn || !diceValue) return false;
    const allowed = color === myColor || (isPassPlay && color === turnColor);
    if (!allowed) return false;
    if (token.position === -1) return diceValue === 6;
    if (token.position >= 56) return false;
    return token.position + diceValue <= 56;
  };

  /* ── Build coord→tokens map ─────────────────────────────────────────────────  */
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

  const CELL = 100 / 15; // % per cell

  const BASE_ORIGIN = {
    red:    { c:0, r:0 },
    green:  { c:9, r:0 },
    blue:   { c:0, r:9 },
    yellow: { c:9, r:9 },
  };
  const SLOT_OFFSETS = [
    { dc:1.1, dr:1.1 }, { dc:3.4, dr:1.1 },
    { dc:1.1, dr:3.4 }, { dc:3.4, dr:3.4 },
  ];

  return (
    <motion.div
      /* Board zoom-in on first render */
      initial={{ scale: 0.55, opacity: 0 }}
      animate={{ scale: 1,    opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 22, delay: 0.05 }}
      style={{
        width: 'clamp(300px, 94vw, 490px)',
        height: 'clamp(300px, 94vw, 490px)',
        position: 'relative',
        /* Dark wood-grain / parchment board background */
        background: 'linear-gradient(145deg, #2C1A0E 0%, #1F1208 40%, #2C1A0E 100%)',
        borderRadius: 22,
        overflow: 'hidden',
        /* Multi-layer premium shadow */
        boxShadow: `
          0 0 0 3px rgba(255,215,0,0.25),
          0 0 0 6px rgba(0,0,0,0.5),
          0 28px 60px rgba(0,0,0,0.7),
          0 8px 24px rgba(0,0,0,0.5),
          inset 0 2px 8px rgba(255,215,0,0.12)
        `,
        border: '2px solid rgba(255,215,0,0.3)',
        userSelect: 'none',
        flexShrink: 0,
        transform: `rotate(${boardRotation}deg)`,
        transformOrigin: 'center',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* ── Subtle wood grain texture overlay ──────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(
          88deg,
          transparent 0px, transparent 12px,
          rgba(255,255,255,0.018) 12px, rgba(255,255,255,0.018) 13px
        )`,
      }} />

      {/* ── Coloured gem-tone quadrant backgrounds (staggered fade-in) ────── */}
      {COLORS.map((color, qi) => {
        const o = BASE_ORIGIN[color];
        const qc = QUAD_COLORS[color];
        return (
          <motion.div
            key={color}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + qi * 0.08, duration: 0.45 }}
            style={{
              position: 'absolute',
              left:   `${o.c * CELL}%`,
              top:    `${o.r * CELL}%`,
              width:  `${CELL * 6}%`,
              height: `${CELL * 6}%`,
              /* Radial gem gradient with glassy sheen */
              background: `
                radial-gradient(ellipse at 28% 28%, ${qc.light} 0%, ${qc.bg} 55%, rgba(0,0,0,0.4) 100%)
              `,
              boxShadow: `
                inset 2px 2px 10px rgba(255,255,255,0.18),
                inset -4px -4px 14px rgba(0,0,0,0.55),
                0 0 20px ${qc.glow}
              `,
              border: '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              zIndex: 1,
            }}
          >
            {/* Inner glassy sheen */}
            <div style={{
              position: 'absolute', top: '6%', left: '8%',
              width: '60%', height: '40%', borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
          </motion.div>
        );
      })}

      {/* ── Base slot circles + in-base tokens ──────────────────────────────  */}
      {COLORS.map(color => {
        const tokens = visualTokens?.[color] || gameState?.tokens?.[color]
          || [{position:-1},{position:-1},{position:-1},{position:-1}];
        const o = BASE_ORIGIN[color];
        const player = gameState?.players?.find(p => p.color === color);
        return SLOT_OFFSETS.map((off, si) => {
          const tok = tokens[si] || { position: -1 };
          const inBase = tok.position === -1;
          const click  = inBase && isClickable(color, tok);
          const cx = (o.c + off.dc) * CELL;
          const cy = (o.r + off.dr) * CELL;
          return (
            <React.Fragment key={`${color}-slot-${si}`}>
              {/* Slot depression circle */}
              <div style={{
                position: 'absolute',
                left: `${cx}%`, top: `${cy}%`,
                width: `${CELL * 1.35}%`, height: `${CELL * 1.35}%`,
                transform: 'translate(-50%,-50%)',
                borderRadius: '50%',
                background: inBase
                  ? 'radial-gradient(circle, rgba(255,255,255,0.22), rgba(0,0,0,0.3))'
                  : 'radial-gradient(circle, rgba(0,0,0,0.5), rgba(0,0,0,0.2))',
                boxShadow: inBase
                  ? 'inset 1px 1px 4px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.2)'
                  : 'inset 3px 3px 8px rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 2,
              }} />
              {/* Token in base */}
              {inBase && (
                <motion.div
                  layoutId={`token-${color}-${si}`}
                  onClick={() => click && onMoveToken(color, si)}
                  style={{
                    position: 'absolute',
                    width: `${CELL * 0.82}%`,
                    height: `${CELL * 0.82}%`,
                    cursor: click ? 'pointer' : 'default',
                    zIndex: 8,
                    filter: click
                      ? `drop-shadow(0 0 8px var(--token-${color})) drop-shadow(0 0 16px var(--token-${color}))` 
                      : `drop-shadow(0 3px 6px rgba(0,0,0,0.5))`,
                  }}
                  initial={{ left: `calc(${cx - CELL * 0.41}%)`, top: `calc(${cy - CELL * 0.41}%)` }}
                  animate={{
                    left: `calc(${cx - CELL * 0.41}%)`,
                    top:  `calc(${cy - CELL * 0.41}%)`,
                    ...(click && settings.showValidMoves
                      ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
                      : { scale: 1, opacity: 1 }),
                  }}
                  transition={{
                    left: { type: 'spring', stiffness: 400, damping: 30 },
                    top:  { type: 'spring', stiffness: 400, damping: 30 },
                    ...(click ? { scale: { repeat: Infinity, duration: 1.0 }, opacity: { repeat: Infinity, duration: 1.0 } } : {}),
                  }}
                >
                  <Token color={color} clickable={click} isBot={player?.isBot} size="100%" boardRotation={boardRotation} />
                </motion.div>
              )}
            </React.Fragment>
          );
        });
      })}

      {/* ── Path cells ─────────────────────────────────────────────────────── */}
      {PATH.map((coord, idx) => {
        const isSafe = SAFE_IDX.has(idx);
        const sc     = SAFE_COLOR[idx];
        return (
          <div
            key={`cell-${idx}`}
            /* Safe zones get the CSS pulse class from index.css */
            className={isSafe ? 'safe-zone-pulse' : ''}
            style={{
              position: 'absolute',
              left: `${coord.c * CELL}%`, top: `${coord.r * CELL}%`,
              width: `${CELL}%`, height: `${CELL}%`,
              /* Warm ivory/cream for normal cells; tinted for safe zones */
              background: isSafe
                ? `var(--token-${sc})22`
                : 'linear-gradient(145deg, #FFF8F0, #EDE0D0)',
              border: `1px solid ${isSafe ? `var(--token-${sc})88` : 'rgba(160,120,80,0.3)'}`,
              boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.08)',
              boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 3,
            }}
          >
            {/* Safe zone star icon */}
            {isSafe && (
              <div style={{
                width: '54%', height: '54%',
                background: `var(--token-${sc})`,
                clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
                opacity: 0.75,
                filter: `drop-shadow(0 0 3px var(--token-${sc}))`,
              }} />
            )}
          </div>
        );
      })}

      {/* ── Home stretch cells (gradient leading to centre) ─────────────────  */}
      {COLORS.flatMap(color =>
        STRETCH[color].map((coord, i) => (
          <div key={`hs-${color}-${i}`} style={{
            position: 'absolute',
            left: `${coord.c * CELL}%`, top: `${coord.r * CELL}%`,
            width: `${CELL}%`, height: `${CELL}%`,
            /* Gradient brightens as it approaches home — simulates a sparkle trail */
            background: `linear-gradient(135deg,
              color-mix(in srgb, var(--token-${color}) 55%, #1a0a00),
              color-mix(in srgb, var(--token-${color}) 80%, white))`,
            opacity: 0.22 + i * 0.14,
            boxSizing: 'border-box',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: `inset 1px 1px 4px rgba(255,255,255,0.3), 0 0 6px var(--token-${color})44`,
            zIndex: 3,
          }} />
        ))
      )}

      {/* ── Centre HOME tile ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: `${7 * CELL}%`, top: `${7 * CELL}%`,
        width: `${CELL}%`, height: `${CELL}%`,
        zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: `conic-gradient(
            var(--token-red)    0   90deg,
            var(--token-green)  90deg 180deg,
            var(--token-yellow) 180deg 270deg,
            var(--token-blue)   270deg 360deg
          )`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 12px rgba(255,255,255,0.4), inset 0 0 24px rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.3)',
        }}>
          {/* Inner circle with HOME label */}
          <div style={{
            width: '46%', height: '46%', borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 38%, #fff9e6, #c8a000)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 1px 1px 4px rgba(255,255,255,0.6)',
          }}>
            <span style={{
              color: '#5c3200', fontWeight: 900,
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(4px, 0.75vw, 7px)',
              letterSpacing: 1,
            }}>
              HOME
            </span>
          </div>
        </div>
      </div>

      {/* ── Active tokens on the path ────────────────────────────────────────  */}
      {Object.entries(atCoord).map(([key, items]) => {
        const count = items.length;
        const STACKS = [
          [{ dx:0,  dy:0  }],
          [{ dx:-8, dy:0  }, { dx:8,  dy:0  }],
          [{ dx:-8, dy:-5 }, { dx:8,  dy:-5 }, { dx:0,  dy:8  }],
          [{ dx:-8, dy:-8 }, { dx:8,  dy:-8 }, { dx:-8, dy:8  }, { dx:8,  dy:8  }],
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
                width: `${CELL * 0.82}%`,
                height: `${CELL * 0.82}%`,
                zIndex: click ? 20 : 10,
                cursor: click ? 'pointer' : 'default',
                filter: click
                  ? `drop-shadow(0 0 10px var(--token-${color})) drop-shadow(0 0 20px var(--token-${color}))`
                  : `drop-shadow(0 3px 6px rgba(0,0,0,0.5))`,
              }}
              initial={false}
              animate={{
                left:  `calc(${cx - CELL * 0.41}% + ${dx}px)`,
                top:   `calc(${cy - CELL * 0.41}% + ${dy}px)`,
                ...(click && settings.showValidMoves
                  ? { scale: [scale, scale * 1.22, scale] }
                  : { scale }),
              }}
              transition={{
                left: { type: 'spring', stiffness: 480, damping: 34 },
                top:  { type: 'spring', stiffness: 480, damping: 34 },
                ...(click
                  ? { scale: { repeat: Infinity, duration: 0.9 } }
                  : { scale: { type: 'spring', stiffness: 300, damping: 22 } }),
              }}
              onClick={() => click && onMoveToken(color, idx)}
            >
              {/* Capture flash ring */}
              {isFlash && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 1 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 0.85 }}
                  style={{
                    position: 'absolute', inset: -6,
                    borderRadius: '50%',
                    border: '3px solid #ef4444',
                    background: 'rgba(239,68,68,0.3)',
                    pointerEvents: 'none',
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
    </motion.div>
  );
};

export default LudoBoard;
