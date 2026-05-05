import React from 'react';

let _kf = false;
const injectBG = () => {
  if (_kf) return; _kf = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes bgEmberUp   { 0%{transform:translateY(0) translateX(0);opacity:.8} 100%{transform:translateY(-110vh) translateX(var(--dx,0));opacity:0} }
    @keyframes bgBubbleUp  { 0%{transform:translateY(0);opacity:.5} 100%{transform:translateY(-110vh);opacity:0} }
    @keyframes bgLightRay  { 0%,100%{opacity:.05} 50%{opacity:.15} }
    @keyframes bgLavaGlow  { 0%,100%{opacity:.6;filter:blur(1px)} 50%{opacity:1;filter:blur(0)} }
    @keyframes bgLavaRumble{ 0%,100%{transform:translateX(0)} 50%{transform:translateX(2px)} }
    @keyframes bgStormCloud{ 0%{transform:translateX(-5%)} 100%{transform:translateX(5%)} }
    @keyframes bgRain      { 0%{transform:translateY(-100%)} 100%{transform:translateY(110vh)} }
    @keyframes bgLightning { 0%,88%,100%{opacity:0} 90%,92%{opacity:.35} 91%,93%{opacity:0} }
    @keyframes bgGalaxy    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes bgNebula    { 0%{transform:translateX(0)} 100%{transform:translateX(80px)} }
    @keyframes bgTwink     { 0%,100%{opacity:.3} 50%{opacity:1} }
    @keyframes bgShooting  { 0%{transform:translateX(-120px) translateY(0);opacity:1} 100%{transform:translateX(120vw) translateY(60px);opacity:0} }
    @keyframes bgIslandBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes bgRevRain   { 0%{transform:translateY(110vh)} 100%{transform:translateY(-100%)} }
    @keyframes bgFireFull  { 0%,100%{background-position:0 0,50% 0,100% 0} 50%{background-position:10% -20px,50% -35px,90% -20px} }
    @keyframes bgAshDrift  { 0%{transform:translateY(-10px) translateX(0);opacity:.8} 100%{transform:translateY(110vh) translateX(var(--dx,0));opacity:0} }
    @keyframes bgVolcErupt { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-80px) translateX(var(--dx,0));opacity:0} }
    @keyframes bgSkyPulse  { 0%,100%{background-position:0 50%} 50%{background-position:100% 50%} }
  `;
  document.head.appendChild(s);
};

const BG = ({ children, base={} }) => { injectBG(); return (
  <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden', ...base }}>
    {children}
  </div>
);};

export const DefaultBackground = () => <BG base={{ background:'linear-gradient(160deg,#1A120B 0%,#0D0805 55%,#1A120B 100%)' }} />;

export const EmberBackground = () => (
  <BG base={{ background:'#0D0D0D' }}>
    {Array.from({length:30}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', bottom:0, left:`${2+i*3.2}%`, width:3+Math.random()*3, height:3+Math.random()*3, borderRadius:'50%', background:`radial-gradient(circle,${['#FF4500','#FF8C00','#FFD700'][i%3]},transparent)`, animation:`bgEmberUp ${4+Math.random()*4}s ${Math.random()*4}s infinite ease-out`, '--dx':`${(Math.random()-.5)*40}px` }} />
    ))}
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'20%', background:'linear-gradient(to top,rgba(255,69,0,.08),transparent)', filter:'blur(4px)' }} />
  </BG>
);

export const OceanBackground = () => (
  <BG base={{ background:'linear-gradient(to bottom,#000814,#001233,#001a4d)' }}>
    {Array.from({length:20}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', bottom:0, left:`${3+i*4.8}%`, width:4+Math.random()*6, height:4+Math.random()*6, borderRadius:'50%', background:'rgba(180,240,255,.3)', animation:`bgBubbleUp ${6+Math.random()*6}s ${Math.random()*6}s infinite ease-in` }} />
    ))}
    {[15,35,55,75].map((x,i)=>(
      <div key={i} style={{ position:'absolute', top:0, left:`${x}%`, width:60, height:'100%', background:'linear-gradient(to bottom,rgba(100,200,255,.08),transparent)', transform:'rotate(8deg)', animation:`bgLightRay ${3+i}s ${i*.5}s infinite ease-in-out` }} />
    ))}
  </BG>
);

export const LavaBackground = () => (
  <BG base={{ background:'#0A0500' }}>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,#1A0500,#0A0000)', animation:'bgLavaRumble .8s infinite' }} />
    {[{top:'25%',left:'5%',w:'35%'},{top:'55%',left:'40%',w:'40%'},{top:'75%',left:'10%',w:'25%'},{top:'40%',left:'70%',w:'20%'}].map((v,i)=>(
      <div key={i} style={{ position:'absolute', top:v.top, left:v.left, width:v.w, height:5, background:'linear-gradient(90deg,transparent,#FF4500,#FFD700,#FF8C00,transparent)', borderRadius:9, filter:'blur(2px)', animation:`bgLavaGlow ${1.5+i*.4}s ${i*.7}s infinite` }} />
    ))}
    {Array.from({length:8}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', bottom:'15%', left:`${40+i*3}%`, width:5, height:5, borderRadius:'50%', background:'#FF4500', animation:`bgVolcErupt ${1.5+i*.2}s ${6+i*.3}s infinite ease-out`, '--dx':`${(i%2===0?1:-1)*30}px` }} />
    ))}
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%', background:'linear-gradient(to top,rgba(255,69,0,.25),transparent)', filter:'blur(6px)' }} />
  </BG>
);

export const StormBackground = () => (
  <BG base={{ background:'#050810' }}>
    {[0,1,2].map(i=>(
      <div key={i} style={{ position:'absolute', top:`${i*25}%`, left:0, right:0, height:80, background:`rgba(20,25,40,0.${6+i})`, filter:'blur(8px)', animation:`bgStormCloud ${20+i*5}s ${i*3}s alternate infinite ease-in-out` }} />
    ))}
    {Array.from({length:40}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:0, left:`${i*2.6}%`, width:1, height:60+Math.random()*60, background:'rgba(200,220,255,.25)', transform:'rotate(-10deg)', animation:`bgRain ${.4+Math.random()*.4}s ${Math.random()*.5}s infinite linear` }} />
    ))}
    <div style={{ position:'absolute', inset:0, background:'rgba(180,200,255,.25)', animation:'bgLightning 4s infinite' }} />
  </BG>
);

export const GalaxyBackground = () => (
  <BG base={{ background:'#050508' }}>
    <div style={{ position:'absolute', inset:'-50%', background:'conic-gradient(from 0deg at 50% 50%,#050508,#0A0A20,#050508,#10103A,#050508)', animation:'bgGalaxy 60s linear infinite', opacity:.8 }} />
    {Array.from({length:80}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', width:1+Math.random()*2, height:1+Math.random()*2, borderRadius:'50%', background:'#fff', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, animation:`bgTwink ${2+Math.random()*4}s ${Math.random()*4}s infinite` }} />
    ))}
    <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 40%,rgba(100,0,200,.2),transparent 50%),radial-gradient(ellipse at 70% 65%,rgba(0,80,200,.15),transparent 45%)', animation:'bgNebula 30s alternate infinite ease-in-out' }} />
    <div style={{ position:'absolute', top:'20%', left:0, width:100, height:2, background:'linear-gradient(90deg,transparent,#fff,transparent)', filter:'blur(1px)', animation:'bgShooting 8s 2s infinite ease-out' }} />
  </BG>
);

export const VolcanicBackground = () => (
  <BG base={{ background:'#0A0000' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:'60%', background:'linear-gradient(to bottom,#3A0A00,#5A1500,#2A0800)', backgroundSize:'200% 200%', animation:'bgSkyPulse 6s infinite' }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'35%', background:'#0A0000', clipPath:'polygon(0% 100%,0% 60%,15% 25%,30% 55%,50% 0%,70% 55%,85% 20%,100% 55%,100% 100%)' }} />
    {Array.from({length:20}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:'-5%', left:`${5+i*4.7}%`, width:3, height:3, borderRadius:'50%', background:'rgba(180,180,180,.6)', animation:`bgAshDrift ${8+Math.random()*6}s ${Math.random()*6}s infinite linear`, '--dx':`${(Math.random()-.5)*20}px` }} />
    ))}
    <div style={{ position:'absolute', bottom:'33%', left:'47%', width:60, height:60, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,100,0,.6),transparent 70%)', filter:'blur(8px)' }} />
  </BG>
);

export const AntigravityBackground = () => (
  <BG base={{ background:'linear-gradient(to bottom,#0A2040,#1A3050,#0A4030)' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:'15%', background:'linear-gradient(to bottom,rgba(20,40,60,.9),transparent)', borderBottom:'1px solid rgba(100,200,150,.3)' }} />
    {[{top:'20%',left:'10%',w:120},{top:'35%',left:'60%',w:90},{top:'55%',left:'25%',w:70}].map((isl,i)=>(
      <div key={i} style={{ position:'absolute', top:isl.top, left:isl.left, width:isl.w, height:30, borderRadius:12, background:'linear-gradient(to bottom,#2A4A30,#1A2820)', boxShadow:'0 4px 20px rgba(50,200,100,.2)', animation:`bgIslandBob ${5+i}s ${i*1.5}s infinite ease-in-out` }} />
    ))}
    {Array.from({length:20}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', bottom:0, left:`${i*5.2}%`, width:1, height:40, background:'rgba(100,220,180,.3)', animation:`bgRevRain ${1+Math.random()*.5}s ${Math.random()}s infinite linear` }} />
    ))}
  </BG>
);

export const InfernoBackground = () => (
  <BG base={{ background:'#0A0200' }}>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#FF1A00 0%,#FF4500 20%,#FF8C00 45%,#FFD700 65%,#FF4500 80%,#FF1A00 100%)', backgroundSize:'100% 300%', animation:'bgFireFull 3s infinite ease-in-out', opacity:.85 }} />
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#FF6B00 0%,#FFB800 30%,transparent 60%)', backgroundSize:'100% 300%', animation:'bgFireFull 1.8s .3s infinite ease-in-out', opacity:.6, mixBlendMode:'screen' }} />
    {Array.from({length:8}).map((_,i)=>(
      <div key={i} style={{ position:'absolute', top:0, left:`${10+i*11}%`, width:50, height:80, borderRadius:'50%', background:'rgba(30,20,20,.5)', filter:'blur(16px)', animation:`bgAshDrift ${12+i}s ${i*1.5}s infinite linear`, '--dx':`${(i%2===0?1:-1)*30}px` }} />
    ))}
    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle,rgba(10,5,0,.8) 40%,transparent 70%)' }} />
    <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,transparent 30%,rgba(255,30,0,.4) 100%)' }} />
  </BG>
);

export const BACKGROUND_COMPONENTS = {
  bg_default:     DefaultBackground, bg_ember:       EmberBackground,
  bg_ocean:       OceanBackground,   bg_lava:        LavaBackground,
  bg_storm:       StormBackground,   bg_galaxy:      GalaxyBackground,
  bg_volcanic:    VolcanicBackground,bg_antigravity: AntigravityBackground,
  bg_inferno:     InfernoBackground,
};

export const AnimatedBackground = ({ bgId }) => {
  const C = BACKGROUND_COMPONENTS[bgId] || DefaultBackground;
  return <C />;
};
