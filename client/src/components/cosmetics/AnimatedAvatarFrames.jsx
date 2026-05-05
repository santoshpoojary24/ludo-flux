import React from 'react';
import { CHARACTERS } from './AnimatedCharacters';

let _kf = false;
const inject = () => {
  if (_kf) return; _kf = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes ringRot      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes ringRotCCW   { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
    @keyframes ringPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
    @keyframes sparkOut     { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--sx,20px),var(--sy,-20px)) scale(0);opacity:0} }
    @keyframes orbitEl      { from{transform:rotate(var(--sa,0deg)) translateX(var(--sr,36px)) rotate(calc(-1*var(--sa,0deg)))} to{transform:rotate(calc(var(--sa,0deg) + 360deg)) translateX(var(--sr,36px)) rotate(calc(-1*(var(--sa,0deg) + 360deg)))} }
    @keyframes iceOrbit     { from{transform:rotate(var(--sa,0deg)) translateX(var(--sr,36px)) rotate(calc(-1*var(--sa,0deg)))} to{transform:rotate(calc(var(--sa,0deg) - 360deg)) translateX(var(--sr,36px)) rotate(calc(360deg - var(--sa,0deg)))} }
    @keyframes auraPulse    { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
    @keyframes vortexSpin   { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
    @keyframes sunCorona    { 0%,100%{box-shadow:0 0 12px 4px rgba(255,215,0,.5)} 50%{box-shadow:0 0 28px 10px rgba(255,215,0,.8)} }
    @keyframes pupilScale   { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(.5)} }
    @keyframes floatUp2     { 0%{transform:translateY(0) translateX(var(--dx,0));opacity:.8} 100%{transform:translateY(-60px) translateX(var(--dx,0));opacity:0} }
    @keyframes xRing        { from{transform:rotate3d(1,0,0,70deg) rotate(0deg)} to{transform:rotate3d(1,0,0,70deg) rotate(360deg)} }
    @keyframes yRing        { from{transform:rotate3d(0,1,0,60deg) rotate(0deg)} to{transform:rotate3d(0,1,0,60deg) rotate(-360deg)} }
    
    /* New keyframes for 12 avatars */
    @keyframes flameFlicker { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.2)} }
    @keyframes lavaDripDrop { 0%{transform:translateY(0);opacity:1} 80%{transform:translateY(15px);opacity:0} 100%{transform:translateY(0);opacity:0} }
    @keyframes featherFloat { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(-30px) rotate(45deg);opacity:0} }
    @keyframes wingFlap     { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(0.7)} }
    @keyframes voidCrack    { 0%,100%{clipPath:polygon(0 0,100% 0,100% 100%,0 100%)} 50%{clipPath:polygon(0 0,80% 10%,100% 100%,20% 90%)} }
    @keyframes solarFlare2  { 0%{transform:scaleX(0) rotate(var(--rot));opacity:0} 30%{transform:scaleX(1.5) rotate(var(--rot));opacity:1} 100%{transform:scaleX(0) rotate(var(--rot));opacity:0} }
    @keyframes frostBreath  { 0%{transform:scale(0) translateY(0);opacity:.8} 100%{transform:scale(2) translateY(20px);opacity:0} }
    @keyframes tailWhip     { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(15deg)} }
    @keyframes thunderFlash { 0%,90%,100%{opacity:.7} 95%{opacity:1} }
    @keyframes multiRing1   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes multiRing2   { from{transform:rotate(0deg)} to{transform:rotate(-180deg)} }
    @keyframes multiRing3   { from{transform:rotate(0deg)} to{transform:rotate(270deg)} }
    @keyframes galaxyRing   { from{background-position:0% 50%} to{background-position:100% 50%} }
  `;
  document.head.appendChild(s);
};

const Wrap = ({ size, children, style={} }) => (
  <div style={{ position:'relative', width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', ...style }}>
    {children}
  </div>
);

const InnerChar = ({ id, size }) => {
  const CharComponent = CHARACTERS[id];
  return (
    <div style={{ position:'absolute', inset:4, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#2A1A0A,#1A0A00)', zIndex:2 }}>
      {CharComponent ? <CharComponent /> : <div style={{width:'100%',height:'100%',background:'#333'}}/>}
    </div>
  );
};

/* 1. EMBER WARRIOR (Starter - FREE) */
const EmberWarriorFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-4, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,100,0,0.3),transparent 70%)', zIndex:0 }} />
    {[0,45,90,135,180,225,270,315].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:8, height:12, background:'linear-gradient(to top,#FF4500,#FFD700,transparent)', clipPath:'polygon(50% 0,100% 100%,0 100%)', transformOrigin:'50% 120%', transform:`rotate(${d}deg) translateY(-${size/2+2}px)`, animation:`flameFlicker .6s ${i*.1}s infinite`, zIndex:3 }} />
    ))}
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid #FF8C00', animation:'ringRot 8s linear infinite', zIndex:1 }} />
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 2. BLUE FLAME NINJA (Common) */
const BlueNinjaFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-6, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,100,255,0.4),transparent 60%)', animation:'auraPulse 3s infinite', zIndex:0 }} />
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid #00FFFF', animation:'ringRotCCW 5s linear infinite', zIndex:1 }} />
    {[0,60,120,180,240,300].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:4, height:14, background:'linear-gradient(to top,#0000FF,#00FFFF,transparent)', transformOrigin:'50% 120%', transform:`rotate(${d}deg) translateY(-${size/2}px)`, animation:`flameFlicker .4s ${i*.05}s infinite`, zIndex:3 }} />
    ))}
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 3. LAVA GUARDIAN (Common) */
const LavaGuardianFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'4px solid #8B0000', borderStyle:'dashed', animation:'ringRot 10s linear infinite', zIndex:1 }} />
    {[0,90,180,270].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:6, height:10, background:'linear-gradient(to bottom,#FF4500,#FF8C00)', borderRadius:'0 0 50% 50%', transformOrigin:'top', transform:`rotate(${d}deg) translateY(${size/2-2}px)`, animation:`lavaDripDrop 3s ${i*.5}s infinite`, zIndex:3 }} />
    ))}
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 4. STORM SAGE (Rare) */
const StormSageFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:'2px solid #9370DB', boxShadow:'0 0 10px #8A2BE2', animation:'thunderFlash 2s infinite', zIndex:1 }} />
    {[0,45,90,135].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:size*.8, height:2, background:'linear-gradient(90deg,transparent,#E6E6FA,#8A2BE2,transparent)', transform:`rotate(${d}deg)`, animation:`ringPulse ${.5+i*.1}s infinite`, zIndex:0 }} />
    ))}
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 5. PHOENIX QUEEN (Rare) */
const PhoenixQueenFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-6, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,215,0,0.3),transparent 70%)', zIndex:0 }} />
    {/* Wings */}
    <div style={{ position:'absolute', left:-10, top:'30%', width:15, height:30, background:'#FF4500', clipPath:'polygon(100% 50%,0 0,0 100%)', animation:'wingFlap 2s infinite ease-in-out', transformOrigin:'right', zIndex:1 }} />
    <div style={{ position:'absolute', right:-10, top:'30%', width:15, height:30, background:'#FF4500', clipPath:'polygon(0 50%,100% 0,100% 100%)', animation:'wingFlap 2s infinite ease-in-out', transformOrigin:'left', zIndex:1 }} />
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid #FFD700', borderStyle:'dotted', animation:'ringRot 6s linear infinite', zIndex:2 }} />
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 6. VOID DEMON (Rare) */
const VoidDemonFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-10, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,0,0,0.8),transparent 70%)', zIndex:0 }} />
    <div style={{ position:'absolute', inset:-2, borderRadius:'50%', border:'3px solid #4B0082', animation:'voidCrack 4s infinite, ringRot 5s linear infinite', zIndex:1 }} />
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 7. SOLAR EMPEROR (Epic) */
const SolarEmperorFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid #FFD700', animation:'sunCorona 3s infinite', zIndex:1 }} />
    {[0,120,240].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:30, height:4, background:'linear-gradient(90deg,#FFD700,transparent)', transformOrigin:'left', '--rot':`${d}deg`, animation:`solarFlare2 4s ${i}s infinite`, left:'50%', top:'50%', zIndex:0 }} />
    ))}
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 8. ICE EMPRESS (Epic) */
const IceEmpressFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid #E0FFFF', boxShadow:'0 0 10px #87CEEB', zIndex:1 }} />
    {[0,45,90,135,180,225,270,315].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:10, height:10, background:'#E0FFFF', clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', left:'50%', top:'50%', marginLeft:-5, marginTop:-5, '--sa':`${d}deg`, '--sr':`${size/2+6}px`, animation:`iceOrbit 6s linear infinite`, zIndex:3 }} />
    ))}
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 9. DRAGON SOVEREIGN (Epic) */
const DragonSovereignFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'4px solid #0A2A1A', borderStyle:'double', animation:'ringRot 12s linear infinite', zIndex:1 }} />
    <div style={{ position:'absolute', bottom:-5, left:'40%', width:20, height:6, background:'#1A3A2A', borderRadius:'10px 0 0 10px', animation:'tailWhip 2s infinite ease-in-out', transformOrigin:'right', zIndex:3 }} />
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 10. THUNDER GOD (Legendary) */
const ThunderGodFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'1px solid #FFD700', opacity:0, animation:'auraPulse 1.5s infinite', zIndex:0 }} />
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid #FFFFFF', boxShadow:'0 0 15px #FFD700', animation:'thunderFlash 1s infinite', zIndex:1 }} />
    {[0,90,180,270].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:4, height:20, background:'linear-gradient(to top,#FFD700,transparent)', transformOrigin:'bottom', transform:`rotate(${d}deg) translateY(-${size/2}px)`, animation:`flameFlicker .2s ${i*.1}s infinite`, zIndex:3 }} />
    ))}
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 11. INFERNO GOD (Legendary) */
const InfernoGodFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:'2px solid #FFD700', animation:'multiRing1 3s linear infinite', zIndex:1 }} />
    <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:'2px solid #FF8C00', borderStyle:'dashed', animation:'multiRing2 4s linear infinite', zIndex:1 }} />
    <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'2px solid #FF4500', borderStyle:'dotted', animation:'multiRing3 5s linear infinite', zIndex:1 }} />
    <InnerChar id={id} size={size} />
  </Wrap>
);};

/* 12. COSMIC DESTROYER (Legendary) */
const CosmicDestroyerFrame = ({ id, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-8, borderRadius:'50%', background:'linear-gradient(90deg,#4B0082,#00FFFF,#FF00FF,#4B0082)', backgroundSize:'300% 100%', animation:'galaxyRing 4s linear infinite', zIndex:0 }} />
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#000', zIndex:1 }} />
    <InnerChar id={id} size={size} />
    {[0,120,240].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:4, height:4, borderRadius:'50%', background:'#FFF', left:'50%', top:'50%', marginLeft:-2, marginTop:-2, '--sa':`${d}deg`, '--sr':`${size/2+4}px`, animation:`orbitEl ${3+i}s linear infinite`, zIndex:3 }} />
    ))}
  </Wrap>
);};


export const AVATAR_FRAME_COMPONENTS = {
  avatar_ember:       EmberWarriorFrame,
  avatar_blue_ninja:  BlueNinjaFrame,
  avatar_lava:        LavaGuardianFrame,
  avatar_storm:       StormSageFrame,
  avatar_phoenix:     PhoenixQueenFrame,
  avatar_void:        VoidDemonFrame,
  avatar_solar:       SolarEmperorFrame,
  avatar_ice:         IceEmpressFrame,
  avatar_dragon:      DragonSovereignFrame,
  avatar_thunder_god: ThunderGodFrame,
  avatar_inferno_god: InfernoGodFrame,
  avatar_cosmic:      CosmicDestroyerFrame,
};

export const AnimatedAvatarFrame = ({ frameId, initial='?', size=80 }) => {
  const C = AVATAR_FRAME_COMPONENTS[frameId] || EmberWarriorFrame;
  return <C id={frameId} size={size} />;
};
