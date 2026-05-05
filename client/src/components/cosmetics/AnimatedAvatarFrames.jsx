import React from 'react';

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
  `;
  document.head.appendChild(s);
};

const Inner = ({ initial, size }) => (
  <div style={{ width:size*.72, height:size*.72, borderRadius:'50%', background:'linear-gradient(135deg,#2A1A0A,#1A0A00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.32, fontFamily:"'Orbitron','Exo 2',sans-serif", fontWeight:900, color:'#FFD700', userSelect:'none', zIndex:2, position:'relative' }}>
    {initial}
  </div>
);
const Wrap = ({ size, children, style={} }) => (
  <div style={{ position:'relative', width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center', ...style }}>
    {children}
  </div>
);

const DefaultFrame = ({ initial, size=80 }) => { inject(); return (
  <Wrap size={size}><div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid #FFD700', boxShadow:'0 0 12px rgba(255,215,0,.3)' }} /><Inner initial={initial} size={size} /></Wrap>
);};

const FlameRingFrame = ({ initial, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'conic-gradient(#FF4500,#FF8C00,#FFD700,#FF8C00,#FF4500)', animation:'ringRot 3s linear infinite', padding:3 }}>
      <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'#0A0A0F' }} />
    </div>
    {[0,60,120,180,240,300].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:6, height:10, background:'linear-gradient(to top,#FF4500,#FFD700,transparent)', clipPath:'polygon(50% 0,100% 100%,0 100%)', transformOrigin:'50% 120%', transform:`rotate(${d}deg) translateY(-${size/2+2}px)`, animation:`ringPulse .8s ${i*.13}s infinite` }} />
    ))}
    {[0,72,144,216,288].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:4, height:4, borderRadius:'50%', background:'#FFD700', '--sx':`${Math.cos(d*Math.PI/180)*20}px`, '--sy':`${Math.sin(d*Math.PI/180)*20}px`, animation:`sparkOut 1.2s ${i*.24}s infinite ease-out`, left:'50%', top:'50%', marginLeft:-2, marginTop:-2 }} />
    ))}
    <Inner initial={initial} size={size} />
  </Wrap>
);};

const IceFrame = ({ initial, size=80 }) => { inject(); const r=size/2+8; return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2.5px solid rgba(180,220,255,.6)', boxShadow:'0 0 14px rgba(100,200,255,.3)' }} />
    {[0,60,120,180,240,300].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:8, height:14, background:'linear-gradient(to bottom,rgba(255,255,255,.9),rgba(150,210,255,.6))', clipPath:'polygon(50% 0,100% 60%,50% 100%,0 60%)', left:'50%', top:'50%', marginLeft:-4, marginTop:-7, '--sa':`${d}deg`, '--sr':`${r}px`, animation:`iceOrbit 8s linear infinite` }} />
    ))}
    <Inner initial={initial} size={size} />
  </Wrap>
);};

const LightningFrame = ({ initial, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid #00FFFF', boxShadow:'0 0 20px rgba(0,255,255,.6),inset 0 0 12px rgba(0,255,255,.2)', animation:'auraPulse .5s infinite' }} />
    {[45,135,225,315].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:3, height:size*.35, background:'linear-gradient(to bottom,#00FFFF,transparent)', transformOrigin:'top center', transform:`rotate(${d}deg) translateY(-${size/2}px)`, animation:`ringPulse ${.3+i*.1}s ${i*.08}s infinite` }} />
    ))}
    {[0,90,180,270].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:4, height:4, borderRadius:'50%', background:'#00FFFF', left:'50%', top:'50%', marginLeft:-2, marginTop:-2, '--sx':`${Math.cos(d*Math.PI/180)*30}px`, '--sy':`${Math.sin(d*Math.PI/180)*30}px`, animation:`sparkOut .6s ${i*.15}s infinite` }} />
    ))}
    <Inner initial={initial} size={size} />
  </Wrap>
);};

const VoidPortalFrame = ({ initial, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-4, borderRadius:'50%', background:'conic-gradient(#1A0030,#5A00CC,#0A0030,#3A0099,#1A0030)', animation:'vortexSpin 4s linear infinite', filter:'blur(1px)' }} />
    <div style={{ position:'absolute', inset:3, borderRadius:'50%', background:'radial-gradient(circle,#200040,#080020)' }} />
    {[0,45,90,135,180,225,270,315].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:3, height:3, borderRadius:'50%', background:'#CC88FF', left:'50%', top:'50%', marginLeft:-1.5, marginTop:-1.5, '--sx':`${Math.cos(d*Math.PI/180)*-20}px`, '--sy':`${Math.sin(d*Math.PI/180)*-20}px`, animation:`sparkOut 1.5s ${i*.18}s infinite ease-in` }} />
    ))}
    <Inner initial={initial} size={size} />
  </Wrap>
);};

const SolarFrame = ({ initial, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-6, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,215,0,.3) 60%,transparent 75%)', animation:'auraPulse 2s infinite' }} />
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid #FFD700', animation:'sunCorona 2s infinite' }} />
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:3, height:i%3===0?16:10, background:'linear-gradient(to bottom,#FFD700,transparent)', transformOrigin:'top center', transform:`rotate(${d}deg) translateY(-${size/2+2}px)`, opacity:.8 }} />
    ))}
    <Inner initial={initial} size={size} />
  </Wrap>
);};

const DragonEyeFrame = ({ initial, size=80 }) => { inject(); return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'repeating-conic-gradient(from 0deg,#2A0A00 0deg 20deg,#4A1800 20deg 40deg)', animation:'ringRot 12s linear infinite' }} />
    <div style={{ position:'absolute', inset:4, borderRadius:'50%', background:'radial-gradient(circle,#1A0A00,#0A0500)' }} />
    <div style={{ position:'absolute', width:size*.28, height:size*.18, borderRadius:'50%', background:'#CC4400', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:3, boxShadow:'0 0 8px rgba(255,69,0,.6)' }} />
    <div style={{ position:'absolute', width:size*.08, height:size*.18, borderRadius:'50%', background:'#050505', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:4, animation:'pupilScale 3s infinite ease-in-out' }} />
    <Inner initial={initial} size={size} />
  </Wrap>
);};

const NebulaFrame = ({ initial, size=80 }) => { inject(); const r=size/2+6; return (
  <Wrap size={size}>
    <div style={{ position:'absolute', inset:-4, borderRadius:'50%', background:'conic-gradient(#FF88CC,#8844FF,#4488FF,#88FFCC,#FF88CC)', animation:'ringRot 8s linear infinite', filter:'blur(2px)' }} />
    <div style={{ position:'absolute', inset:4, borderRadius:'50%', background:'#080020' }} />
    {[0,45,90,135,180,225,270,315].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:4, height:4, borderRadius:'50%', background:`hsl(${d},80%,75%)`, left:'50%', top:'50%', marginLeft:-2, marginTop:-2, '--sa':`${d}deg`, '--sr':`${r}px`, animation:`orbitEl ${4+i*.5}s linear infinite` }} />
    ))}
    <Inner initial={initial} size={size} />
  </Wrap>
);};

const AntigravityFrame = ({ initial, size=80 }) => { inject(); return (
  <Wrap size={size} style={{ perspective:300 }}>
    <div style={{ position:'absolute', inset:-10, borderRadius:'50%', border:'3px solid #FFD700', animation:'ringRot 2s linear infinite', boxShadow:'0 0 12px rgba(255,215,0,.5)' }} />
    <div style={{ position:'absolute', inset:-10, borderRadius:'50%', border:'2px solid #FF4500', animation:'xRing 3s linear infinite', boxShadow:'0 0 10px rgba(255,69,0,.4)' }} />
    <div style={{ position:'absolute', inset:-10, borderRadius:'50%', border:'2px solid #00FFFF', animation:'yRing 4s linear infinite', boxShadow:'0 0 10px rgba(0,255,255,.4)' }} />
    {[0,60,120,180,240,300].map((d,i)=>(
      <div key={i} style={{ position:'absolute', width:4, height:4, borderRadius:'50%', background:`hsl(${d},100%,70%)`, left:'50%', top:'50%', marginLeft:-2, marginTop:-2, '--dx':`${(i%2===0?1:-1)*6}px`, animation:`floatUp2 ${1.5+i*.2}s ${i*.25}s infinite ease-out` }} />
    ))}
    <Inner initial={initial} size={size} />
  </Wrap>
);};

export const AVATAR_FRAME_COMPONENTS = {
  avatar_default:     DefaultFrame,     avatar_flame_ring:  FlameRingFrame,
  avatar_ice:         IceFrame,         avatar_lightning:   LightningFrame,
  avatar_void_portal: VoidPortalFrame,  avatar_solar:       SolarFrame,
  avatar_dragon_eye:  DragonEyeFrame,   avatar_nebula:      NebulaFrame,
  avatar_antigravity: AntigravityFrame,
};

export const AnimatedAvatarFrame = ({ frameId, initial='?', size=80 }) => {
  const C = AVATAR_FRAME_COMPONENTS[frameId] || DefaultFrame;
  return <C initial={initial} size={size} />;
};
