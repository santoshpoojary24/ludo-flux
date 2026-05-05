import React from 'react';

/* ── inject shared keyframes once ─────────────────────────────────── */
let _kf = false;
const injectKF = () => {
  if (_kf) return; _kf = true;
  const s = document.createElement('style');
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;700&display=swap');
    @keyframes flicker      { 0%,100%{transform:scaleY(1) scaleX(1)} 25%{transform:scaleY(1.2) scaleX(0.9)} 75%{transform:scaleY(0.8) scaleX(1.1)} }
    @keyframes floatUp      { 0%{transform:translateY(0) translateX(0);opacity:.8} 100%{transform:translateY(-80px) translateX(var(--dx,8px));opacity:0} }
    @keyframes plasmaShift  { 0%,100%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(60deg) brightness(1.3)} }
    @keyframes elecPulse    { 0%,100%{opacity:.3} 50%{opacity:1} }
    @keyframes lavaGlow     { 0%,100%{opacity:.6;filter:blur(1px)} 50%{opacity:1;filter:blur(0)} }
    @keyframes lavaDrip     { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(20px);opacity:0} }
    @keyframes voidPulse    { 0%,100%{box-shadow:0 0 20px rgba(100,0,200,.4)} 50%{box-shadow:0 0 40px rgba(100,0,200,.8)} }
    @keyframes voidFlash    { 0%,95%,100%{opacity:0} 97%{opacity:.6} }
    @keyframes solarFlare   { 0%,100%{transform:scaleX(0) rotate(-30deg);opacity:0} 20%{transform:scaleX(1) rotate(-30deg);opacity:1} 80%{transform:scaleX(1.2) rotate(-30deg);opacity:.8} }
    @keyframes galaxyRot    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes nebulaDrift  { 0%{transform:translateX(-20px)} 100%{transform:translateX(20px)} }
    @keyframes lightFlash   { 0%,92%,100%{opacity:0} 94%,96%{opacity:1} 95%,97%{opacity:.3} }
    @keyframes warpTilt     { 0%,100%{transform:perspective(400px) rotateX(0deg)} 50%{transform:perspective(400px) rotateX(1.5deg)} }
    @keyframes fireL1       { 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(-8px) scaleX(1.05)} }
    @keyframes fireL2       { 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(-14px) scaleX(.95)} }
    @keyframes fireL3       { 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(-20px) scaleX(1.08)} }
    @keyframes crownFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    @keyframes scaleGrow    { 0%,100%{background-size:100%} 50%{background-size:107%} }
  `;
  document.head.appendChild(s);
};

/* ── Inferno ───────────────────────────────────────────────────────── */
const InfernoBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, background:'#1A1A1A', overflow:'hidden', borderRadius: mini?8:12 }}>
      {Array.from({length:8}).map((_,i) => (
        <div key={i} style={{ position:'absolute', bottom:0, left:`${10+i*11}%`, width:mini?3:4, height:mini?3:4, borderRadius:'50%', background:'radial-gradient(circle,#FFD700,#FF4500)', animation:`floatUp ${2+i*.3}s ${i*.4}s infinite ease-out`, '--dx':`${(i%2===0?1:-1)*8}px` }} />
      ))}
      {Array.from({length:mini?8:14}).map((_,i) => (
        <div key={i} style={{ position:'absolute', bottom:0, left:`${i*(mini?13.5:7.5)}%`, width:mini?'10%':'8%', height:mini?28:44, background:'linear-gradient(to top,#FF4500,#FF8C00,#FFD700,transparent)', clipPath:'polygon(50% 0%,100% 100%,0% 100%)', animation:`flicker ${.4+i*.05}s ${i*.07}s infinite ease-in-out`, transformOrigin:'bottom center', opacity:.85 }} />
      ))}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(255,69,0,.15),transparent)' }} />
    </div>
  );
};

/* ── Plasma ────────────────────────────────────────────────────────── */
const PlasmaBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, background:'#1A0A2E', overflow:'hidden', borderRadius: mini?8:12 }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 60%,rgba(0,200,255,.25),transparent 60%),radial-gradient(ellipse at 70% 40%,rgba(120,0,255,.3),transparent 55%)', animation:'plasmaShift 4s infinite' }} />
      {Array.from({length:6}).map((_,i) => (
        <div key={i} style={{ position:'absolute', top:`${20+i*12}%`, left:i%2===0?-2:undefined, right:i%2!==0?-2:undefined, width:mini?6:10, height:2, background:'#00FFFF', borderRadius:2, animation:`elecPulse ${.4+i*.1}s ${i*.15}s infinite` }} />
      ))}
    </div>
  );
};

/* ── Molten ────────────────────────────────────────────────────────── */
const MoltenBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, overflow:'hidden', borderRadius:mini?8:12, background:'radial-gradient(ellipse at 20% 80%,#3A1A0A,#1A0A00)' }}>
      {[{top:'60%',left:'10%',w:'30%'},{top:'40%',left:'50%',w:'25%'},{top:'70%',left:'65%',w:'20%'}].map((v,i)=>(
        <div key={i} style={{ position:'absolute', top:v.top, left:v.left, width:v.w, height:mini?3:4, background:'linear-gradient(90deg,transparent,#FF4500,#FFD700,#FF8C00,transparent)', borderRadius:9, animation:`lavaGlow ${1.5+i*.4}s ${i*.3}s infinite`, filter:'blur(1px)' }} />
      ))}
      {Array.from({length:mini?3:6}).map((_,i)=>(
        <div key={i} style={{ position:'absolute', bottom:0, left:`${15+i*15}%`, width:mini?4:6, height:mini?6:10, background:'linear-gradient(to bottom,#FF4500,#FF8C00)', borderRadius:'0 0 50% 50%', animation:`lavaDrip 2s ${i*.4}s infinite ease-in` }} />
      ))}
    </div>
  );
};

/* ── Void ──────────────────────────────────────────────────────────── */
const VoidBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, background:'#050508', overflow:'hidden', borderRadius:mini?8:12, animation:'voidPulse 3s infinite' }}>
      {Array.from({length:mini?6:10}).map((_,i)=>(
        <div key={i} style={{ position:'absolute', bottom:0, left:`${i*(mini?17:10)}%`, width:mini?'12%':'11%', height:mini?30:48, background:'linear-gradient(to top,#5A00FF,#8800FF,#0000CC,transparent)', clipPath:'polygon(50% 0%,100% 100%,0% 100%)', animation:`flicker ${.5+i*.06}s ${i*.08}s infinite ease-in-out`, transformOrigin:'bottom center', opacity:.7 }} />
      ))}
      <div style={{ position:'absolute', inset:0, background:'rgba(200,200,255,.6)', animation:'voidFlash 4s infinite' }} />
    </div>
  );
};

/* ── Solar ─────────────────────────────────────────────────────────── */
const SolarBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, overflow:'hidden', borderRadius:mini?8:12, background:'radial-gradient(ellipse at 20% 60%,#1A0A00,#0A0A0F)' }}>
      {Array.from({length:12}).map((_,i)=>(
        <div key={i} style={{ position:'absolute', width:2, height:2, borderRadius:'50%', background:'#fff', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, opacity:.3+Math.random()*.5 }} />
      ))}
      <div style={{ position:'absolute', top:'10%', left:'5%', width:mini?40:80, height:mini?20:40, background:'linear-gradient(135deg,#FFD700,#FF8C00,transparent)', borderRadius:'0 80% 80% 0', animation:'solarFlare 4s 1s infinite ease-in-out', transformOrigin:'left center', filter:'blur(2px)' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:mini?6:10, background:'linear-gradient(90deg,transparent,rgba(255,215,0,.4),transparent)', animation:'elecPulse 1.5s infinite' }} />
    </div>
  );
};

/* ── Dragon ────────────────────────────────────────────────────────── */
const DragonBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, overflow:'hidden', borderRadius:mini?8:12, background:'repeating-linear-gradient(60deg,#1A0A00 0px,#1A0A00 10px,#200D00 10px,#200D00 20px)' }}>
      <div style={{ position:'absolute', inset:0, background:'repeating-conic-gradient(from 0deg at 50% 50%,transparent 0deg 30deg,rgba(255,100,0,.06) 30deg 60deg)', animation:'scaleGrow 3s infinite' }} />
      <div style={{ position:'absolute', top:'20%', left:mini?'15%':'10%', width:mini?'55%':'65%', height:mini?20:35, background:'linear-gradient(90deg,rgba(255,69,0,.9),rgba(255,140,0,.6),rgba(255,215,0,.3),transparent)', borderRadius:mini?10:18, filter:'blur(3px)', animation:'fireL2 1.8s infinite ease-in-out' }} />
      <div style={{ position:'absolute', top:'25%', left:mini?'10%':'8%', width:mini?'45%':'55%', height:mini?12:20, background:'linear-gradient(90deg,rgba(255,200,0,.8),rgba(255,120,0,.4),transparent)', borderRadius:mini?8:12, filter:'blur(2px)', animation:'fireL3 .9s infinite ease-in-out' }} />
    </div>
  );
};

/* ── Cosmic ────────────────────────────────────────────────────────── */
const CosmicBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, overflow:'hidden', borderRadius:mini?8:12, animation:'warpTilt 4s infinite ease-in-out' }}>
      <div style={{ position:'absolute', inset:0, background:'conic-gradient(from 0deg at 50% 50%,#0A0A1E,#1A0A3E,#0A0A1E,#1A1A4E,#0A0A1E)', animation:'galaxyRot 30s infinite linear' }} />
      {Array.from({length:20}).map((_,i)=>(
        <div key={i} style={{ position:'absolute', width:1.5, height:1.5, borderRadius:'50%', background:'#fff', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, opacity:.3+Math.random()*.7 }} />
      ))}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 40%,rgba(120,0,255,.3),transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(0,100,255,.2),transparent 40%)', animation:'nebulaDrift 20s alternate infinite ease-in-out' }} />
      <div style={{ position:'absolute', top:0, left:'40%', width:mini?2:3, height:'100%', background:'rgba(255,255,255,.8)', animation:'lightFlash 3s infinite' }} />
    </div>
  );
};

/* ── Eternal ───────────────────────────────────────────────────────── */
const EternalBanner = ({ mini }) => {
  injectKF(); const h = mini ? 60 : 100;
  return (
    <div style={{ position:'relative', width:'100%', height:h, overflow:'hidden', borderRadius:mini?8:12, background:'#0A0500' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#FF1A00,#FF4500,#FF8C00,transparent)', animation:'fireL1 3s infinite ease-in-out' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#FF6B00,#FFB800,transparent)', animation:'fireL2 1.8s .3s infinite ease-in-out', opacity:.7 }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#FFD700,transparent 60%)', animation:'fireL3 .9s .1s infinite ease-in-out', opacity:.5 }} />
      {Array.from({length:10}).map((_,i)=>(
        <div key={i} style={{ position:'absolute', bottom:0, left:`${5+i*9}%`, width:mini?4:6, height:mini?4:6, borderRadius:'50%', background:`hsl(${i*36},100%,60%)`, animation:`floatUp ${1.2+i*.2}s ${i*.25}s infinite ease-out`, '--dx':`${(i%2===0?1:-1)*12}px`, filter:'blur(.5px)' }} />
      ))}
      {!mini && <div style={{ position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', fontSize:18, filter:'drop-shadow(0 0 8px #FFD700)', animation:'crownFloat 2s infinite ease-in-out' }}>👑</div>}
    </div>
  );
};

export const BANNER_COMPONENTS = {
  banner_inferno: InfernoBanner, banner_plasma:  PlasmaBanner,
  banner_molten:  MoltenBanner,  banner_void:    VoidBanner,
  banner_solar:   SolarBanner,   banner_dragon:  DragonBanner,
  banner_cosmic:  CosmicBanner,  banner_eternal: EternalBanner,
};

export const AnimatedBanner = ({ bannerId, mini = false }) => {
  const C = BANNER_COMPONENTS[bannerId];
  if (!C) return <div style={{ width:'100%', height:mini?60:100, borderRadius:mini?8:12, background:'linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,69,0,.06))', border:'1px dashed rgba(255,215,0,.15)' }} />;
  return <C mini={mini} />;
};
