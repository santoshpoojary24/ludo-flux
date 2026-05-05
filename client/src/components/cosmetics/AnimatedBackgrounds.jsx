import React, { useEffect, useRef, useState } from 'react';

let _kf = false;
const injectBG = () => {
  if (_kf) return; _kf = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes bgEmberUp   { 0%{transform:translateY(0) translateX(0);opacity:.8} 100%{transform:translateY(-110vh) translateX(var(--dx,0));opacity:0} }
    @keyframes swayLantern { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
    @keyframes petalFall   { 0%{transform:translateY(-10vh) rotate(0deg)} 100%{transform:translateY(110vh) rotate(360deg)} }
    @keyframes rockErupt   { 0%{transform:translateY(0) translateX(0);opacity:1} 100%{transform:translateY(-80vh) translateX(var(--dx,0));opacity:0} }
    @keyframes bgRain      { 0%{transform:translate(-50px,-50px)} 100%{transform:translate(50px,110vh)} }
    @keyframes bgLightning { 0%,88%,100%{opacity:0} 90%,92%{opacity:.4} 91%,93%{opacity:0} }
    @keyframes fireflyPulse{ 0%,100%{opacity:0;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
    @keyframes parallaxMove{ 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes dragonSky   { 0%{transform:translateX(120vw) translateY(20vh)} 100%{transform:translateX(-20vw) translateY(-10vh)} }
    @keyframes spiritOrb   { 0%,100%{transform:translateY(0) scale(1);opacity:.4} 50%{transform:translateY(-30px) scale(1.2);opacity:.8} }
    @keyframes fireFull    { 0%,100%{background-position:0 0,50% 0,100% 0} 50%{background-position:10% -20px,50% -35px,90% -20px} }
    @keyframes cosmicRot   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes shootingStar{ 0%{transform:translate(120vw,-20vh);opacity:1} 100%{transform:translate(-20vw,80vh);opacity:0} }
  `;
  document.head.appendChild(s);
};

const BG = ({ children, base={} }) => { injectBG(); return (
  <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden', ...base }}>
    {children}
  </div>
);};

/* 1. Ember Field */
export const EmberBackground = () => (
  <BG base={{ background:'#0D0D0D' }}>
    {Array.from({length:40}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', bottom:0, left:`${2+i*2.4}%`, width:2+Math.random()*3, height:2+Math.random()*3, borderRadius:'50%', background:`radial-gradient(circle,${['#FF4500','#FF8C00','#FFD700'][i%3]},transparent)`, animation:`bgEmberUp ${4+Math.random()*5}s ${Math.random()*5}s infinite ease-out`, '--dx':`${(Math.random()-.5)*50}px` }} />
    ))}
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'15%', background:'linear-gradient(to top,rgba(255,69,0,.1),transparent)', filter:'blur(4px)' }} />
  </BG>
);

/* 2. Sacred Dojo */
export const DojoBackground = () => (
  <BG base={{ background:'#2C1A10' }}>
    <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 42px)' }} />
    {[20,80].map((x,i)=>(
      <div key={i} style={{ position:'absolute', top:0, left:`${x}%`, transformOrigin:'top', animation:'swayLantern 4s infinite ease-in-out' }}>
        <div style={{ width:2, height:40, background:'#111', margin:'0 auto' }} />
        <div style={{ width:40, height:50, background:'#FF4500', borderRadius:4, boxShadow:'0 0 30px #FF4500' }} />
      </div>
    ))}
    {Array.from({length:20}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:'-10%', left:`${Math.random()*100}%`, width:15, height:10, background:'#FFB7C5', borderRadius:'50%', animation:`petalFall ${6+Math.random()*6}s ${Math.random()*5}s infinite linear` }} />
    ))}
  </BG>
);

/* 3. Volcano Summit */
export const VolcanoBackground = () => (
  <BG base={{ background:'linear-gradient(to bottom,#3A0A00,#0A0000)' }}>
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:'#111', clipPath:'polygon(0 100%, 0 60%, 50% 20%, 100% 60%, 100% 100%)' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:'linear-gradient(to bottom, #FF4500, transparent)', clipPath:'polygon(48% 25%, 52% 25%, 60% 100%, 40% 100%)', opacity:0.6 }} />
    {Array.from({length:15}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', bottom:'30%', left:'50%', width:10, height:10, borderRadius:'50%', background:'#FF8C00', boxShadow:'0 0 10px #FF4500', animation:`rockErupt ${2+Math.random()*2}s ${Math.random()*8}s infinite ease-out`, '--dx':`${(Math.random()-.5)*200}px` }} />
    ))}
  </BG>
);

/* 4. Storm Battlefield */
export const StormBackground = () => (
  <BG base={{ background:'#050810' }}>
    {Array.from({length:100}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:-50, left:`${i}%`, width:1, height:40, background:'rgba(200,220,255,.3)', animation:`bgRain ${.3+Math.random()*.3}s ${Math.random()}s infinite linear` }} />
    ))}
    <div style={{ position:'absolute', inset:0, background:'rgba(200,220,255,.4)', animation:'bgLightning 5s infinite' }} />
  </BG>
);

/* 5. Night Forest */
export const ForestBackground = () => (
  <BG base={{ background:'#0A1118' }}>
    <div style={{ position:'absolute', top:0, right:0, width:100, height:100, borderRadius:'50%', background:'#FFF', boxShadow:'0 0 50px #FFF', margin:50 }} />
    {Array.from({length:30}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:4, height:4, borderRadius:'50%', background:'#ADFF2F', boxShadow:'0 0 10px #ADFF2F', animation:`fireflyPulse ${2+Math.random()*3}s ${Math.random()*2}s infinite` }} />
    ))}
  </BG>
);

/* 6. Dragon Skies */
export const DragonSkyBackground = () => (
  <BG base={{ background:'linear-gradient(to bottom,#4B0082,#FF4500,#FFD700)' }}>
    <svg style={{ position:'absolute', top:'20%', width:150, height:80, animation:'dragonSky 15s infinite linear' }} viewBox="0 0 100 50">
      <path d="M 10,25 Q 30,0 50,25 Q 70,50 90,25 L 80,15 L 95,25 L 80,35 Z" fill="#111" />
    </svg>
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'20%', background:'#111', clipPath:'polygon(0 100%,0 80%,20% 50%,40% 70%,60% 40%,80% 60%,100% 30%,100% 100%)' }} />
  </BG>
);

/* 7. Lava Dimension */
export const LavaDimBackground = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let frameId;
    let t = 0;
    let isVisible = false;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0 });

    if (containerRef.current) observer.observe(containerRef.current);

    const draw = () => {
      if (!isVisible) {
        frameId = requestAnimationFrame(draw);
        return;
      }
      t += 0.05;
      const w = canvasRef.current.width = window.innerWidth || 800;
      const h = canvasRef.current.height = window.innerHeight || 600;
      ctx.fillStyle = '#1A0000';
      ctx.fillRect(0,0,w,h);
      for(let i=0; i<w; i+=40) {
        for(let j=0; j<h; j+=40) {
          const v = Math.sin(i*0.01 + t) * Math.cos(j*0.01 + t);
          if (v > 0.5) {
            ctx.fillStyle = `rgba(255,69,0,${v})`;
            ctx.fillRect(i,j,40,40);
          }
        }
      }
      frameId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);
  return <div ref={containerRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}><canvas ref={canvasRef} style={{width:'100%',height:'100%'}}/></div>;
};

/* 8. Spirit Realm */
export const SpiritBackground = () => (
  <BG base={{ background:'linear-gradient(to bottom,#2E0854,#008080)' }}>
    {Array.from({length:60}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:10+Math.random()*20, height:10+Math.random()*20, borderRadius:'50%', background:'rgba(0,255,255,0.3)', filter:'blur(8px)', animation:`spiritOrb ${3+Math.random()*4}s infinite ease-in-out` }} />
    ))}
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(10px)' }} />
  </BG>
);

/* 9. Eternal Inferno */
export const InfernoBackground = () => (
  <BG base={{ background:'#0A0200' }}>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#FF1A00 0%,#FF4500 20%,#FF8C00 45%,#FFD700 65%,#FF4500 80%,#FF1A00 100%)', backgroundSize:'100% 300%', animation:'fireFull 3s infinite ease-in-out', opacity:.85 }} />
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#FF6B00 0%,#FFB800 30%,transparent 60%)', backgroundSize:'100% 300%', animation:'fireFull 1.8s .3s infinite ease-in-out', opacity:.6, mixBlendMode:'screen' }} />
    {Array.from({length:15}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:0, left:`${5+i*6}%`, width:50, height:80, borderRadius:'50%', background:'rgba(30,20,20,.5)', filter:'blur(16px)', animation:`bgEmberUp ${12+i}s ${i*1.5}s infinite linear`, '--dx':`${(i%2===0?1:-1)*30}px` }} />
    ))}
  </BG>
);

/* 10. Cosmic Genesis */
export const CosmicBackground = () => (
  <BG base={{ background:'#000' }}>
    <div style={{ position:'absolute', inset:'-50%', background:'conic-gradient(from 0deg at 50% 50%,#000,#4B0082,#000,#00008B,#000)', animation:'cosmicRot 60s linear infinite', opacity:.6 }} />
    {Array.from({length:100}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:2, height:2, background:'#FFF', animation:`fireflyPulse ${1+Math.random()*2}s infinite` }} />
    ))}
    <div style={{ position:'absolute', top:'30%', left:'30%', width:300, height:300, background:'radial-gradient(circle,rgba(255,0,255,0.2),transparent)', filter:'blur(40px)' }} />
    <div style={{ position:'absolute', width:100, height:2, background:'linear-gradient(90deg,transparent,#FFF)', animation:'shootingStar 6s infinite linear' }} />
  </BG>
);


export const BACKGROUND_COMPONENTS = {
  bg_ember:       EmberBackground,
  bg_dojo:        DojoBackground,
  bg_volcano:     VolcanoBackground,
  bg_storm:       StormBackground,
  bg_forest:      ForestBackground,
  bg_dragon:      DragonSkyBackground,
  bg_lava_dim:    LavaDimBackground,
  bg_spirit:      SpiritBackground,
  bg_inferno:     InfernoBackground,
  bg_cosmic:      CosmicBackground,
};

export const AnimatedBackground = ({ bgId }) => {
  const C = BACKGROUND_COMPONENTS[bgId] || EmberBackground;
  return <C />;
};
