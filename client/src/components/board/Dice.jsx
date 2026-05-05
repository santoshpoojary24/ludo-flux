import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DOTS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const Face = ({ n, size, isSix, transform }) => {
  const dots = DOTS[n] || [];
  const dot  = Math.round(size * 0.15);
  const pad  = Math.round(size * 0.12);

  return (
    <div style={{
      position: 'absolute',
      width: size, height: size,
      borderRadius: size * 0.15,
      background: isSix
        ? 'linear-gradient(145deg, #fff8e1, #ffecb3)'
        : 'linear-gradient(145deg, #ffffff, #e8edf5)',
      boxShadow: isSix
        ? `inset 0 0 10px rgba(245,158,11,0.5), 0 0 5px rgba(0,0,0,0.2)`
        : `inset 0 0 10px rgba(0,0,0,0.1), 0 0 5px rgba(0,0,0,0.2)`,
      border: '2px solid rgba(255,255,255,0.9)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gridTemplateRows: 'repeat(3,1fr)',
      padding: pad, gap: 3,
      transform,
      backfaceVisibility: 'hidden',
    }}>
      {Array.from({length:9},(_,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
          {dots.includes(i) && (
            <div style={{
              width: dot, height: dot, borderRadius: '50%',
              background: isSix
                ? 'linear-gradient(135deg,#b45309,#92400e)'
                : 'linear-gradient(135deg,#1e293b,#334155)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

const getRotationForValue = (val) => {
  switch(val) {
    case 1: return { x: 0, y: 0 };
    case 2: return { x: 0, y: -90 };
    case 3: return { x: -90, y: 0 };
    case 4: return { x: 90, y: 0 };
    case 5: return { x: 0, y: 90 };
    case 6: return { x: 0, y: 180 };
    default: return { x: 0, y: 0 };
  }
};

const Dice = ({ value, isRolling, canRoll, onRoll }) => {
  const [displayVal, setDisplayVal] = useState(value || 1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [jump, setJump] = useState(0);
  
  // Keep track of accumulated rotation so we don't spin backwards
  const [rotation, setRotation] = useState(() => getRotationForValue(value || 1));

  useEffect(() => {
    if (isRolling) {
      // Just lift the dice slightly to anticipate the throw
      setJump(-10);
    } else {
      // Roll finished from server. Execute the full continuous physical throw!
      if (value) {
        setDisplayVal(value);
        const finalRot = getRotationForValue(value);
        
        setRotation(prev => {
          // Find the closest equivalent rotation to land on
          const snapTo = (current, target) => {
            const diff = (target - current) % 360;
            const normalizedDiff = ((diff + 540) % 360) - 180;
            return current + normalizedDiff;
          };
          
          // Add 2 extra full spins in both directions for drama
          const dirX = Math.random() > 0.5 ? 1 : -1;
          const dirY = Math.random() > 0.5 ? 1 : -1;
          
          return {
            x: snapTo(prev.x, finalRot.x) + (720 * dirX),
            y: snapTo(prev.y, finalRot.y) + (720 * dirY)
          };
        });
        
        // Execute vertical jump keyframes
        setJump([ -10, -80, 0 ]);
        setIsAnimating(true);
        
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setJump(0);
        }, 800); 
        return () => clearTimeout(timer);
      }
    }
  }, [isRolling, value]);

  const size = 64;
  const half = size / 2;
  const isSix = displayVal === 6;
  const glowClr = `var(--token-${isSix ? 'yellow' : 'blue'})`;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, marginTop: 10 }}>
      <div 
        onClick={() => canRoll && !isRolling && onRoll?.()}
        style={{ 
          width: size, height: size, 
          perspective: 800, 
          cursor: canRoll ? 'pointer' : 'default',
          position: 'relative'
        }}
      >
        {canRoll && !isRolling && (
          <motion.div
            animate={{ opacity:[0.3,0.7,0.3], scale:[1,1.2,1] }}
            transition={{ repeat:Infinity, duration:1.5 }}
            style={{
              position:'absolute', inset: -10, borderRadius: '50%',
              background: `radial-gradient(circle, ${glowClr}50, transparent 70%)`,
              zIndex: 0, pointerEvents: 'none'
            }}
          />
        )}
        
        {/* Ground shadow since we can't use filter on 3d-preserve element */}
        <motion.div
          animate={{ 
            scale: isAnimating ? 0.5 : (isRolling ? 0.9 : 1), 
            opacity: isAnimating ? 0.2 : (isRolling ? 0.5 : 0.8) 
          }}
          transition={{ duration: Array.isArray(jump) ? 0.8 : 0.2 }}
          style={{
            position:'absolute', bottom: -10, left: '10%', right: '10%', height: 20,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)',
            zIndex: 0, pointerEvents: 'none',
            filter: 'blur(3px)'
          }}
        />
        
        <motion.div
          animate={{ rotateX: rotation.x, rotateY: rotation.y, y: jump }}
          transition={{ 
            rotateX: { type: "spring", stiffness: 60, damping: 12 },
            rotateY: { type: "spring", stiffness: 60, damping: 12 },
            y: Array.isArray(jump) 
              ? { duration: 0.8, times: [0, 0.4, 1], ease: "easeInOut" }
              : { type: "spring", stiffness: 200, damping: 20 }
          }}
          style={{
            width: '100%', height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            zIndex: 1
          }}
          whileHover={canRoll && !isRolling ? { scale: 1.1, y: -5 } : {}}
          whileTap={canRoll && !isRolling ? { scale: 0.9 } : {}}
        >
          {/* Front: 1 */}
          <Face n={1} size={size} isSix={isSix} transform={`translateZ(${half}px)`} />
          {/* Back: 6 */}
          <Face n={6} size={size} isSix={isSix} transform={`rotateY(180deg) translateZ(${half}px)`} />
          {/* Right: 2 */}
          <Face n={2} size={size} isSix={isSix} transform={`rotateY(90deg) translateZ(${half}px)`} />
          {/* Left: 5 */}
          <Face n={5} size={size} isSix={isSix} transform={`rotateY(-90deg) translateZ(${half}px)`} />
          {/* Top: 3 */}
          <Face n={3} size={size} isSix={isSix} transform={`rotateX(90deg) translateZ(${half}px)`} />
          {/* Bottom: 4 */}
          <Face n={4} size={size} isSix={isSix} transform={`rotateX(-90deg) translateZ(${half}px)`} />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div key="r" initial={{opacity:0}} animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity}} style={lblStyle('#6366f1')}>
            Rolling…
          </motion.div>
        ) : canRoll ? (
          <motion.div key="tap" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} style={lblStyle('var(--accent)')}>
            <motion.span animate={{scale:[1,1.25,1]}} transition={{repeat:Infinity,duration:1.3}}>🎲</motion.span> &nbsp;Tap to Roll
          </motion.div>
        ) : value ? (
          <motion.div key={`v${value}`} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} style={lblStyle(isSix ? '#f59e0b' : 'var(--text-muted)')}>
            {isSix ? '🎉 Six! Roll again' : `Rolled ${value}`}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const lblStyle = (color) => ({
  display:'flex', alignItems:'center', gap:5,
  fontSize:12, fontWeight:900, letterSpacing:1.5,
  textTransform:'uppercase', color,
});

export default Dice;