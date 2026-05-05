import React from 'react';

// Common base character structure
const CharBase = ({ skin, hair, eyes, details }) => (
  <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', zIndex:2 }}>
    {/* Head base */}
    <path d="M 30,50 Q 50,95 70,50 Q 75,30 50,20 Q 25,30 30,50" fill={skin} />
    {/* Collar/Neck */}
    <path d="M 40,80 L 40,100 L 60,100 L 60,80 Z" fill={skin} filter="brightness(0.8)" />
    {/* Eyes */}
    <g transform="translate(0, 5)">{eyes}</g>
    {/* Details (scars, marks) */}
    {details}
    {/* Hair */}
    {hair}
  </svg>
);

export const EmberWarrior = () => (
  <CharBase 
    skin="#F4A261"
    hair={
      <path d="M 15,40 L 30,5 L 45,30 L 60,5 L 75,30 L 90,5 L 85,45 Z" fill="#FF4500" />
    }
    eyes={<><circle cx="38" cy="50" r="4" fill="#FFD700"/><circle cx="62" cy="50" r="4" fill="#FFD700"/><path d="M 30,45 L 45,48 M 70,45 L 55,48" stroke="#333" strokeWidth="2"/></>}
    details={<path d="M 25,30 L 75,30 L 70,40 L 30,40 Z" fill="#222" />}
  />
);

export const BlueNinja = () => (
  <CharBase 
    skin="#FFE0C8"
    hair={<path d="M 20,45 Q 50,0 80,45 L 70,30 L 50,15 L 30,30 Z" fill="#111" />}
    eyes={<><circle cx="38" cy="48" r="3.5" fill="#00FFFF"/><circle cx="62" cy="48" r="3.5" fill="#00FFFF"/><path d="M 32,45 L 44,46 M 68,45 L 56,46" stroke="#111" strokeWidth="2"/></>}
    details={<path d="M 25,60 L 75,60 L 80,100 L 20,100 Z" fill="#1A1A2E" />}
  />
);

export const LavaGuardian = () => (
  <CharBase 
    skin="#D48251"
    hair={<><path d="M 25,35 Q 50,10 75,35 Z" fill="#2A1A1A" /><path d="M 45,15 L 55,30 Z" stroke="#FF4500" strokeWidth="3" /></>}
    eyes={<><path d="M 35,50 Q 38,48 42,50" stroke="#111" strokeWidth="2" fill="none"/><path d="M 58,50 Q 62,48 65,50" stroke="#111" strokeWidth="2" fill="none"/><circle cx="38.5" cy="51" r="2.5" fill="#FF0000"/><circle cx="61.5" cy="51" r="2.5" fill="#FF0000"/></>}
    details={<><path d="M 20,70 L 80,70 L 90,100 L 10,100 Z" fill="#3A1A1A" /><path d="M 30,60 L 40,75" stroke="#800" strokeWidth="1.5"/></>}
  />
);

export const StormSage = () => (
  <CharBase 
    skin="#E8D5C4"
    hair={<path d="M 20,50 Q 10,80 30,100 Q 10,50 30,20 Q 50,0 70,20 Q 90,50 70,100 Q 90,80 80,50 Z" fill="#E2E8F0" opacity="0.9" />}
    eyes={<><circle cx="38" cy="52" r="3" fill="#8B5CF6"/><circle cx="62" cy="52" r="3" fill="#8B5CF6"/></>}
    details={<><path d="M 50,35 L 53,42 L 47,42 Z" fill="#8B5CF6" /><path d="M 25,80 L 75,80 L 85,100 L 15,100 Z" fill="#4C1D95" /></>}
  />
);

export const PhoenixQueen = () => (
  <CharBase 
    skin="#F5CBA7"
    hair={<path d="M 15,50 Q 50,-10 85,50 Q 100,100 80,80 Q 50,110 20,80 Q 0,100 15,50 Z" fill="url(#phoenixHair)" />}
    eyes={<><circle cx="38" cy="48" r="4" fill="#FFD700"/><circle cx="62" cy="48" r="4" fill="#FFD700"/><path d="M 32,45 Q 38,42 44,46 M 68,45 Q 62,42 56,46" stroke="#000" strokeWidth="1.5" fill="none"/></>}
    details={<><defs><linearGradient id="phoenixHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4500"/><stop offset="100%" stopColor="#FFD700"/></linearGradient></defs><circle cx="32" cy="55" r="1.5" fill="#442"/><path d="M 30,70 L 70,70 L 80,100 L 20,100 Z" fill="#990000" /></>}
  />
);

export const VoidDemon = () => (
  <CharBase 
    skin="#E0E0E0"
    hair={<path d="M 10,40 L 40,10 L 60,30 L 90,20 L 70,60 L 95,80 L 60,50 L 40,80 Z" fill="#FFFFFF" />}
    eyes={<><circle cx="38" cy="52" r="3.5" fill="#FF0000"/><path d="M 25,40 L 45,65 M 45,40 L 25,65" stroke="#111" strokeWidth="1" opacity="0.4"/></>}
    details={<><path d="M 35,65 Q 50,75 65,65 Q 50,70 35,65" fill="#000" /><path d="M 25,80 L 75,80 L 90,100 L 10,100 Z" fill="#111" /></>}
  />
);

export const SolarEmperor = () => (
  <CharBase 
    skin="#FFE4B5"
    hair={<path d="M 10,50 L 30,20 L 50,5 L 70,20 L 90,50 L 80,25 L 50,15 L 20,25 Z" fill="#FFD700" />}
    eyes={<><path d="M 34,48 L 42,48 M 58,48 L 66,48" stroke="#A67C00" strokeWidth="2"/></>}
    details={<><circle cx="50" cy="35" r="4" fill="#FF8C00"/><path d="M 25,75 L 75,75 L 85,100 L 15,100 Z" fill="#FFF8DC" /><path d="M 40,75 L 60,75 L 65,100 L 35,100 Z" fill="#FFD700" /></>}
  />
);

export const IceEmpress = () => (
  <CharBase 
    skin="#F0F8FF"
    hair={<path d="M 20,40 Q 50,0 80,40 Q 70,20 50,10 Q 30,20 20,40 Z" fill="#AEEEEE" />}
    eyes={<><circle cx="38" cy="48" r="3.5" fill="#E0FFFF"/><circle cx="62" cy="48" r="3.5" fill="#E0FFFF"/><path d="M 32,46 L 44,46 M 68,46 L 56,46" stroke="#4682B4" strokeWidth="1.5"/></>}
    details={<><path d="M 25,70 L 75,70 L 85,100 L 15,100 Z" fill="#F0FFFF" /><path d="M 45,70 L 50,85 L 55,70 Z" fill="#87CEEB" /></>}
  />
);

export const DragonSovereign = () => (
  <CharBase 
    skin="#C3B091"
    hair={<path d="M 20,35 Q 50,0 80,35 Q 90,60 70,30 Q 50,15 30,30 Q 10,60 20,35 Z" fill="#0A2A1A" />}
    eyes={<><ellipse cx="38" cy="50" rx="2" ry="4" fill="#FFD700"/><ellipse cx="62" cy="50" rx="2" ry="4" fill="#FFD700"/><path d="M 32,46 L 44,48 M 68,46 L 56,48" stroke="#111" strokeWidth="2"/></>}
    details={<><path d="M 70,55 L 75,60 L 70,65 Z" fill="#0A2A1A" opacity="0.6"/><path d="M 20,75 L 80,75 L 90,100 L 10,100 Z" fill="#1A3A2A" /></>}
  />
);

export const ThunderGod = () => (
  <CharBase 
    skin="#FDF5E6"
    hair={<path d="M 5,30 L 25,10 L 40,25 L 50,0 L 60,25 L 75,10 L 95,30 L 80,40 L 95,60 L 75,50 Z" fill="#FFFFFF" />}
    eyes={<><circle cx="38" cy="50" r="4" fill="#FFFFFF" filter="drop-shadow(0 0 2px #FFD700)"/><circle cx="62" cy="50" r="4" fill="#FFFFFF" filter="drop-shadow(0 0 2px #FFD700)"/></>}
    details={<><path d="M 30,35 L 40,55 L 35,55 L 45,75" stroke="#FFD700" strokeWidth="2" fill="none" /><path d="M 20,80 L 80,80 L 95,100 L 5,100 Z" fill="#B8860B" /></>}
  />
);

export const InfernoGod = () => (
  <CharBase 
    skin="#221100"
    hair={<path d="M 15,45 Q 25,10 50,0 Q 75,10 85,45 Q 65,20 50,30 Q 35,20 15,45 Z" fill="url(#infernoHair)" />}
    eyes={<><circle cx="38" cy="50" r="4" fill="#FF4500"/><circle cx="62" cy="50" r="4" fill="#FF4500"/><circle cx="38" cy="50" r="1.5" fill="#FFD700"/><circle cx="62" cy="50" r="1.5" fill="#FFD700"/></>}
    details={<><defs><linearGradient id="infernoHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="40%" stopColor="#FFD700"/><stop offset="100%" stopColor="#FF4500"/></linearGradient></defs><path d="M 30,60 Q 50,70 70,60" stroke="#FF4500" strokeWidth="2" fill="none" /><path d="M 20,80 L 80,80 L 90,100 L 10,100 Z" fill="#110800" /></>}
  />
);

export const CosmicDestroyer = () => (
  <CharBase 
    skin="#DDA0DD"
    hair={<path d="M 10,50 Q 50,-20 90,50 Q 70,10 50,20 Q 30,10 10,50 Z" fill="url(#cosmicHair)" />}
    eyes={<><circle cx="38" cy="50" r="4" fill="url(#cosmicEye)"/><circle cx="62" cy="50" r="4" fill="url(#cosmicEye)"/></>}
    details={<><defs><linearGradient id="cosmicHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4B0082"/><stop offset="50%" stopColor="#8A2BE2"/><stop offset="100%" stopColor="#000000"/></linearGradient><radialGradient id="cosmicEye"><stop offset="0%" stopColor="#00FFFF"/><stop offset="100%" stopColor="#FF00FF"/></radialGradient></defs><path d="M 50,30 L 55,40 L 45,40 Z" fill="#00FFFF" opacity="0.6"/><path d="M 25,80 L 75,80 L 90,100 L 10,100 Z" fill="#0A0A1E" /></>}
  />
);

export const CHARACTERS = {
  avatar_ember:       EmberWarrior,
  avatar_blue_ninja:  BlueNinja,
  avatar_lava:        LavaGuardian,
  avatar_storm:       StormSage,
  avatar_phoenix:     PhoenixQueen,
  avatar_void:        VoidDemon,
  avatar_solar:       SolarEmperor,
  avatar_ice:         IceEmpress,
  avatar_dragon:      DragonSovereign,
  avatar_thunder_god: ThunderGod,
  avatar_inferno_god: InfernoGod,
  avatar_cosmic:      CosmicDestroyer,
};
