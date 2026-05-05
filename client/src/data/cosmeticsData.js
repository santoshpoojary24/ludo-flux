export const RARITY = {
  common:    { label:'COMMON',    color:'#9CA3AF', glow:'rgba(156,163,175,0.4)',  bg:'rgba(156,163,175,0.1)' },
  rare:      { label:'RARE',      color:'#60A5FA', glow:'rgba(96,165,250,0.4)',   bg:'rgba(96,165,250,0.1)'  },
  epic:      { label:'EPIC',      color:'#C084FC', glow:'rgba(192,132,252,0.45)', bg:'rgba(192,132,252,0.1)' },
  legendary: { label:'LEGENDARY', color:'#FFD700', glow:'rgba(255,215,0,0.5)',    bg:'rgba(255,215,0,0.12)'  },
};

export const BANNERS = [
  { id:'banner_training',  label:'Training Grounds', rarity:'common',    price:0,    description:'Basic dojo with training flames',         type:'banner', free:true },
  { id:'banner_dojo',      label:'Ember Dojo',       rarity:'common',    price:80,   description:'Wooden dojo with smoke wisps',            type:'banner' },
  { id:'banner_scroll',    label:'Fire Scroll',      rarity:'common',    price:120,  description:'Aged parchment with flame calligraphy',   type:'banner' },
  { id:'banner_ninja',     label:'Ninja Night',      rarity:'rare',      price:250,  description:'Blue flame kunai fly across night sky',   type:'banner' },
  { id:'banner_forge',     label:'Lava Forge',       rarity:'rare',      price:300,  description:'Cracked rock with molten lava flows',     type:'banner' },
  { id:'banner_thunder',   label:'Thunder Strike',   rarity:'rare',      price:350,  description:'Storm clouds with lightning flashes',     type:'banner' },
  { id:'banner_ocean',     label:'Ocean Fury',       rarity:'rare',      price:400,  description:'Deep ocean waves with bioluminescence',   type:'banner' },
  { id:'banner_phoenix',   label:'Phoenix Rising',   rarity:'epic',      price:600,  description:'Dawn sky with rising phoenix silhouette', type:'banner' },
  { id:'banner_dragon',    label:'Dragon Realm',     rarity:'epic',      price:700,  description:'Ancient stone with flying dragon',        type:'banner' },
  { id:'banner_demon',     label:'Demon Gate',       rarity:'epic',      price:850,  description:'Void crack with glowing demon eyes',      type:'banner' },
  { id:'banner_throne',    label:'Inferno Throne',   rarity:'legendary', price:1500, description:'Massive layered flame columns & throne',  type:'banner' },
  { id:'banner_cosmic',    label:'Cosmic Legend',    rarity:'legendary', price:3000, description:'Animated galaxy with supernova explosions', type:'banner' },
];

export const AVATAR_FRAMES = [
  { id:'avatar_ember',       label:'Ember Warrior',    rarity:'common',    price:0,    description:'Spiky hair & determined flame ring',    type:'avatarFrame', free:true },
  { id:'avatar_blue_ninja',  label:'Blue Flame Ninja', rarity:'common',    price:100,  description:'Electric blue ring & frost breath',     type:'avatarFrame' },
  { id:'avatar_lava',        label:'Lava Guardian',    rarity:'common',    price:150,  description:'Molten drips & battle-worn glare',      type:'avatarFrame' },
  { id:'avatar_storm',       label:'Storm Sage',       rarity:'rare',      price:300,  description:'Purple lightning ring & thunder aura',  type:'avatarFrame' },
  { id:'avatar_phoenix',     label:'Phoenix Queen',    rarity:'rare',      price:400,  description:'Golden feather ring & dawn glow',       type:'avatarFrame' },
  { id:'avatar_void',        label:'Void Demon',       rarity:'rare',      price:450,  description:'Black fire & absorbing shadow aura',    type:'avatarFrame' },
  { id:'avatar_solar',       label:'Solar Emperor',    rarity:'epic',      price:700,  description:'Sun corona ring with solar flares',     type:'avatarFrame' },
  { id:'avatar_ice',         label:'Ice Empress',      rarity:'epic',      price:750,  description:'Orbiting ice shards & freezing breath', type:'avatarFrame' },
  { id:'avatar_dragon',      label:'Dragon Sovereign', rarity:'epic',      price:900,  description:'Dragon scale ring & fire breath',       type:'avatarFrame' },
  { id:'avatar_thunder_god', label:'Thunder God',      rarity:'legendary', price:1500, description:'Full electric ring & shockwaves',       type:'avatarFrame' },
  { id:'avatar_inferno_god', label:'Inferno God',      rarity:'legendary', price:2000, description:'Hair of fire & multi-layer ring',       type:'avatarFrame' },
  { id:'avatar_cosmic',      label:'Cosmic Destroyer', rarity:'legendary', price:3000, description:'Universe ring & gravity waves',         type:'avatarFrame' },
];

export const BACKGROUNDS = [
  { id:'bg_ember',       label:'Ember Field',       rarity:'common',    price:0,    description:'Floating ember particles drift upward', type:'background', free:true },
  { id:'bg_dojo',        label:'Sacred Dojo',       rarity:'common',    price:100,  description:'Swaying lanterns & falling cherry blossoms', type:'background' },
  { id:'bg_volcano',     label:'Volcano Summit',    rarity:'rare',      price:300,  description:'Active eruption with lava rocks',       type:'background' },
  { id:'bg_storm',       label:'Storm Battlefield', rarity:'rare',      price:350,  description:'Heavy rain & full lightning flashes',   type:'background' },
  { id:'bg_forest',      label:'Night Forest',      rarity:'rare',      price:400,  description:'Parallax trees & glowing fireflies',    type:'background' },
  { id:'bg_dragon',      label:'Dragon Skies',      rarity:'epic',      price:650,  description:'Flying dragons in sunset sky',          type:'background' },
  { id:'bg_lava_dim',    label:'Lava Dimension',    rarity:'epic',      price:750,  description:'Cellular automata lava simulation',     type:'background' },
  { id:'bg_spirit',      label:'Spirit Realm',      rarity:'epic',      price:900,  description:'Floating glowing orbs & spirit water',  type:'background' },
  { id:'bg_inferno',     label:'Eternal Inferno',   rarity:'legendary', price:2000, description:'Canvas heat diffusion simulation',      type:'background' },
  { id:'bg_cosmic',      label:'Cosmic Genesis',    rarity:'legendary', price:3500, description:'Live space simulation with supernovas', type:'background' },
];

export const ALL_COSMETICS = [...BANNERS, ...AVATAR_FRAMES, ...BACKGROUNDS];
