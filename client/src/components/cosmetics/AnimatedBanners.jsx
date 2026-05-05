import React from 'react';

let _kf = false;
const injectKF = () => {
  if (_kf) return; _kf = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes flicker      { 0%,100%{transform:scaleY(1) scaleX(1)} 25%{transform:scaleY(1.2) scaleX(0.9)} 75%{transform:scaleY(0.8) scaleX(1.1)} }
    @keyframes floatUp      { 0%{transform:translateY(0) translateX(0);opacity:.8} 100%{transform:translateY(-80px) translateX(var(--dx,8px));opacity:0} }
    @keyframes smokeRise    { 0%{transform:translateY(0) scale(1);opacity:.5} 100%{transform:translateY(-40px) scale(2);opacity:0} }
    @keyframes driftRight   { 0%{transform:translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateX(100px);opacity:0} }
    @keyframes kunaiThrow   { 0%{transform:translateX(-50px);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateX(350px);opacity:0} }
    @keyframes lavaFlow     { 0%,100%{opacity:.6;filter:blur(1px)} 50%{opacity:1;filter:blur(0)} }
    @keyframes hammerShake  { 0%,100%{transform:translateY(0)} 10%,30%,50%{transform:translateY(-2px)} 20%,40%{transform:translateY(2px)} }
    @keyframes thunderFlash2{ 0%,92%,100%{opacity:0} 94%,96%{opacity:1} 95%,97%{opacity:.3} }
    @keyframes rainSlant    { 0%{transform:translate(-20px,-20px)} 100%{transform:translate(20px,120px)} }
    @keyframes waveRoll     { 0%{transform:translateX(0)} 100%{transform:translateX(-50px)} }
    @keyframes phoenixRise  { 0%{transform:translateY(50px) scale(0.5);opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:translateY(-50px) scale(1.2);opacity:0} }
    @keyframes dragonFly    { 0%{transform:translateX(350px) translateY(10px)} 100%{transform:translateX(-100px) translateY(-10px)} }
    @keyframes voidCrackPuls{ 0%,100%{filter:drop-shadow(0 0 5px #4B0082)} 50%{filter:drop-shadow(0 0 15px #8A2BE2)} }
    @keyframes throneFlame  { 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(-10px) scaleX(1.1)} }
    @keyframes superNova    { 0%{transform:scale(0);opacity:1} 50%{transform:scale(2);opacity:1} 100%{transform:scale(4);opacity:0} }
    @keyframes galaxyRot2   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `;
  document.head.appendChild(s);
};

/* 1. Training Grounds */
const TrainingBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#1A1A1A', overflow:'hidden', borderRadius:mini?8:12 }}>
    <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(90deg, #1A1A1A, #1A1A1A 10px, #222 10px, #222 20px)' }} />
    {[10,30,50,70,90].map((x,i)=>(
      <div key={i} style={{ position:'absolute', bottom:0, left:`${x}%`, width:10, height:15, background:'#FF4500', clipPath:'polygon(50% 0,100% 100%,0 100%)', animation:`flicker .5s ${i*.1}s infinite` }} />
    ))}
  </div>
);};

/* 2. Ember Dojo */
const DojoBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#3A2010', overflow:'hidden', borderRadius:mini?8:12 }}>
    <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 12px)' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:10, background:'#FF4500', animation:'flicker .8s infinite' }} />
    {[20,50,80].map((x,i)=>(
      <div key={i} style={{ position:'absolute', bottom:10, left:`${x}%`, width:20, height:20, background:'rgba(100,100,100,0.5)', borderRadius:'50%', filter:'blur(4px)', animation:`smokeRise 3s ${i*.5}s infinite` }} />
    ))}
  </div>
);};

/* 3. Fire Scroll */
const ScrollBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#F5DEB3', overflow:'hidden', borderRadius:mini?8:12, boxShadow:'inset 0 0 20px rgba(139,69,19,0.5)' }}>
    <div style={{ position:'absolute', left:0, top:0, bottom:0, width:20, background:'linear-gradient(90deg,#FF4500,transparent)', animation:'flicker .6s infinite' }} />
    <div style={{ position:'absolute', right:0, top:0, bottom:0, width:20, background:'linear-gradient(-90deg,#FF4500,transparent)', animation:'flicker .6s .2s infinite' }} />
    <div style={{ position:'absolute', top:'30%', left:'10%', fontSize:24, color:'#8B0000', fontWeight:'bold', animation:'driftRight 10s linear infinite' }}>火</div>
  </div>
);};

/* 4. Ninja Night */
const NinjaBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#000', overflow:'hidden', borderRadius:mini?8:12 }}>
    <div style={{ position:'absolute', top:10, right:20, width:20, height:20, borderRadius:'50%', background:'#00FFFF', boxShadow:'0 0 10px #00FFFF' }} />
    {[0,1,2].map(i=>(
      <div key={i} style={{ position:'absolute', top:`${20+i*20}%`, left:0, width:30, height:4, background:'linear-gradient(90deg,transparent,#00FFFF)', animation:`kunaiThrow 3s ${i*.8}s infinite` }} />
    ))}
  </div>
);};

/* 5. Lava Forge */
const ForgeBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#1A0A00', overflow:'hidden', borderRadius:mini?8:12, animation:'hammerShake 4s infinite' }}>
    <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 120%, #3A0A00, #1A0A00)' }} />
    {[{top:'60%',left:'10%',w:'30%'},{top:'40%',left:'50%',w:'25%'},{top:'70%',left:'65%',w:'20%'}].map((v,i)=>(
      <div key={i} style={{ position:'absolute', top:v.top, left:v.left, width:v.w, height:4, background:'linear-gradient(90deg,transparent,#FF4500,#FFD700,#FF8C00,transparent)', borderRadius:9, animation:`lavaFlow ${1.5+i*.4}s infinite` }} />
    ))}
  </div>
);};

/* 6. Thunder Strike */
const ThunderBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#191970', overflow:'hidden', borderRadius:mini?8:12 }}>
    {Array.from({length:20}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:-10, left:`${i*5}%`, width:1, height:30, background:'rgba(255,255,255,0.3)', animation:`rainSlant .5s ${i*.1}s infinite linear` }} />
    ))}
    <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.8)', animation:'thunderFlash2 4s infinite' }} />
  </div>
);};

/* 7. Ocean Fury */
const OceanBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#001233', overflow:'hidden', borderRadius:mini?8:12 }}>
    {[0,1,2].map(i=>(
      <div key={i} style={{ position:'absolute', bottom:`${i*10}%`, left:0, width:'200%', height:20, background:`rgba(0,191,255,0.${4+i})`, borderRadius:'50%', animation:`waveRoll ${2+i}s infinite linear` }} />
    ))}
    {Array.from({length:10}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', bottom:`${Math.random()*50}%`, left:`${Math.random()*100}%`, width:4, height:4, borderRadius:'50%', background:'#00FFFF', boxShadow:'0 0 5px #00FFFF', animation:`floatUp 2s ${i*.2}s infinite` }} />
    ))}
  </div>
);};

/* 8. Phoenix Rising */
const PhoenixBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'linear-gradient(to top,#FF4500,#4B0082)', overflow:'hidden', borderRadius:mini?8:12 }}>
    <svg style={{ position:'absolute', left:'50%', bottom:0, width:60, height:60, marginLeft:-30, animation:'phoenixRise 6s infinite' }} viewBox="0 0 100 100">
      <path d="M 50,20 Q 80,40 90,10 Q 70,50 50,80 Q 30,50 10,10 Q 20,40 50,20 Z" fill="#FFD700" />
    </svg>
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:20, background:'linear-gradient(to top,#FFD700,transparent)', animation:'flicker 1s infinite' }} />
  </div>
);};

/* 9. Dragon Realm */
const DragonBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#2F4F4F', overflow:'hidden', borderRadius:mini?8:12 }}>
    <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)' }} />
    <svg style={{ position:'absolute', top:'20%', width:80, height:40, animation:'dragonFly 8s infinite linear' }} viewBox="0 0 100 50">
      <path d="M 10,25 Q 30,0 50,25 Q 70,50 90,25 L 80,15 L 95,25 L 80,35 Z" fill="#0A2A1A" />
      <path d="M 10,25 L 0,20 L 5,25 L 0,30 Z" fill="#FF4500" />
    </svg>
  </div>
);};

/* 10. Demon Gate */
const DemonBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#111', overflow:'hidden', borderRadius:mini?8:12 }}>
    <div style={{ position:'absolute', left:'48%', top:0, bottom:0, width:'4%', background:'#4B0082', animation:'voidCrackPuls 2s infinite' }} />
    <div style={{ position:'absolute', left:'45%', top:'40%', width:6, height:6, borderRadius:'50%', background:'#FF0000', boxShadow:'0 0 5px #FF0000' }} />
    <div style={{ position:'absolute', right:'45%', top:'40%', width:6, height:6, borderRadius:'50%', background:'#FF0000', boxShadow:'0 0 5px #FF0000' }} />
  </div>
);};

/* 11. Inferno Throne */
const ThroneBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#220000', overflow:'hidden', borderRadius:mini?8:12 }}>
    <div style={{ position:'absolute', left:'40%', right:'40%', bottom:0, height:'60%', background:'#111', borderTopLeftRadius:10, borderTopRightRadius:10 }} />
    <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'100%', background:'linear-gradient(to top,#FF4500,transparent)', animation:'throneFlame 2s infinite' }} />
    <div style={{ position:'absolute', left:'45%', top:10, fontSize:20, animation:'flicker 1s infinite' }}>👑</div>
  </div>
);};

/* 12. Cosmic Legend */
const CosmicBanner = ({ mini }) => { injectKF(); const h=mini?60:100; return (
  <div style={{ position:'relative', width:'100%', height:h, background:'#000', overflow:'hidden', borderRadius:mini?8:12 }}>
    <div style={{ position:'absolute', inset:'-50%', background:'conic-gradient(from 0deg at 50% 50%,#000,#4B0082,#000,#00008B,#000)', animation:'galaxyRot2 20s linear infinite' }} />
    <div style={{ position:'absolute', left:'30%', top:'40%', width:10, height:10, borderRadius:'50%', background:'#FFF', boxShadow:'0 0 20px #FFF', animation:'superNova 7s infinite' }} />
    {Array.from({length:30}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:2, height:2, background:'#FFF', animation:`flicker ${1+Math.random()}s infinite` }} />
    ))}
  </div>
);};


export const BANNER_COMPONENTS = {
  banner_training: TrainingBanner,
  banner_dojo:     DojoBanner,
  banner_scroll:   ScrollBanner,
  banner_ninja:    NinjaBanner,
  banner_forge:    ForgeBanner,
  banner_thunder:  ThunderBanner,
  banner_ocean:    OceanBanner,
  banner_phoenix:  PhoenixBanner,
  banner_dragon:   DragonBanner,
  banner_demon:    DemonBanner,
  banner_throne:   ThroneBanner,
  banner_cosmic:   CosmicBanner,
};

export const AnimatedBanner = ({ bannerId, mini = false }) => {
  const C = BANNER_COMPONENTS[bannerId] || TrainingBanner;
  return <C mini={mini} />;
};
