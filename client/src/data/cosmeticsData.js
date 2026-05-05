export const RARITY = {
  common:    { label:'COMMON',    color:'#9CA3AF', glow:'rgba(156,163,175,0.4)',  bg:'rgba(156,163,175,0.1)' },
  rare:      { label:'RARE',      color:'#60A5FA', glow:'rgba(96,165,250,0.4)',   bg:'rgba(96,165,250,0.1)'  },
  epic:      { label:'EPIC',      color:'#C084FC', glow:'rgba(192,132,252,0.45)', bg:'rgba(192,132,252,0.1)' },
  legendary: { label:'LEGENDARY', color:'#FFD700', glow:'rgba(255,215,0,0.5)',    bg:'rgba(255,215,0,0.12)'  },
};

export const BANNERS = [
  { id:'banner_inferno', label:'Inferno Banner',      rarity:'common',    price:100,  description:'Charcoal & flame — ember particles drift upward',  type:'banner' },
  { id:'banner_plasma',  label:'Plasma Banner',       rarity:'common',    price:150,  description:'Electric plasma waves, cyan sparks',               type:'banner' },
  { id:'banner_molten',  label:'Molten Lava Banner',  rarity:'rare',      price:300,  description:'Cracked rock with glowing lava rivers',            type:'banner' },
  { id:'banner_void',    label:'Void Flame Banner',   rarity:'rare',      price:400,  description:'Anti-fire — cold blue-black inverted flames',      type:'banner' },
  { id:'banner_solar',   label:'Solar Flare Banner',  rarity:'epic',      price:600,  description:'Solar flare arcs erupt periodically',             type:'banner' },
  { id:'banner_dragon',  label:'Dragon Fire Banner',  rarity:'epic',      price:750,  description:'Dragon scales with a fiery breath burst',          type:'banner' },
  { id:'banner_cosmic',  label:'Cosmic Storm Banner', rarity:'legendary', price:1200, description:'Galaxy rotation, nebula clouds & lightning',       type:'banner' },
  { id:'banner_eternal', label:'Eternal Blaze Banner',rarity:'legendary', price:2000, description:'FULL animated fire — the ultimate flex',           type:'banner' },
];

export const AVATAR_FRAMES = [
  { id:'avatar_default',     label:'Default',       rarity:'common',    price:0,    description:'Standard ring',                          type:'avatarFrame', free:true },
  { id:'avatar_flame_ring',  label:'Flame Ring',    rarity:'common',    price:120,  description:'Rotating ring of fire segments',         type:'avatarFrame' },
  { id:'avatar_ice',         label:'Ice Crystal',   rarity:'common',    price:120,  description:'Orbiting ice shards with frost breath',  type:'avatarFrame' },
  { id:'avatar_lightning',   label:'Lightning',     rarity:'rare',      price:350,  description:'Electric arc ring with spark particles', type:'avatarFrame' },
  { id:'avatar_void_portal', label:'Void Portal',   rarity:'rare',      price:450,  description:'Dark swirling vortex, stars pulled inward', type:'avatarFrame' },
  { id:'avatar_solar',       label:'Solar',         rarity:'epic',      price:700,  description:'Pulsing sun corona with prominence arcs', type:'avatarFrame' },
  { id:'avatar_dragon_eye',  label:'Dragon Eye',    rarity:'epic',      price:850,  description:'Scale ring with a dilating draconic pupil', type:'avatarFrame' },
  { id:'avatar_nebula',      label:'Nebula',        rarity:'legendary', price:1400, description:'Animated nebula cloud, orbiting stars',  type:'avatarFrame' },
  { id:'avatar_antigravity', label:'Antigravity',   rarity:'legendary', price:2500, description:'3-axis gyroscope rings + upward particle spiral', type:'avatarFrame' },
];

export const BACKGROUNDS = [
  { id:'bg_default',     label:'Default',            rarity:'common',    price:0,    description:'Ludo Flux classic dark',                 type:'background', free:true },
  { id:'bg_ember',       label:'Ember Field',        rarity:'common',    price:80,   description:'Floating ember particles drift upward',  type:'background' },
  { id:'bg_ocean',       label:'Deep Ocean',         rarity:'common',    price:80,   description:'Rising bubbles and light ray shafts',    type:'background' },
  { id:'bg_lava',        label:'Lava World',         rarity:'rare',      price:280,  description:'Glowing lava rivers with eruption bursts', type:'background' },
  { id:'bg_storm',       label:'Storm Realm',        rarity:'rare',      price:320,  description:'Rain, lightning flashes & screen shake', type:'background' },
  { id:'bg_galaxy',      label:'Galaxy Core',        rarity:'epic',      price:600,  description:'Rotating galaxy spiral with nebula drift', type:'background' },
  { id:'bg_volcanic',    label:'Volcanic Summit',    rarity:'epic',      price:700,  description:'Active volcano, ash clouds & red sky',   type:'background' },
  { id:'bg_antigravity', label:'Antigravity Realm',  rarity:'legendary', price:1500, description:'Inverted world with floating islands',   type:'background' },
  { id:'bg_inferno',     label:'Eternal Inferno',    rarity:'legendary', price:2500, description:'Full-screen fire simulation — the ultimate', type:'background' },
];

export const ALL_COSMETICS = [...BANNERS, ...AVATAR_FRAMES, ...BACKGROUNDS];
