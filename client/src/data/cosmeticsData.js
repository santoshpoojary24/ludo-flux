// ── Ludo Flux Cosmetics Data ──────────────────────────────────────────────────
export const COSMETIC_CATEGORIES = [
  { id: 'banners', label: 'Banners' },
  { id: 'avatarFrames', label: 'Avatar Rings' },
  { id: 'backgrounds', label: 'Backgrounds' }
];

export const COSMETICS = {
  banners: [
    { id: 'banner_inferno', name: 'Inferno Banner', rarity: 'epic', price: 600 },
    { id: 'banner_plasma', name: 'Plasma Banner', rarity: 'rare', price: 400 },
    { id: 'banner_void', name: 'Void Flame Banner', rarity: 'legendary', price: 1000 }
  ],
  avatarFrames: [
    { id: 'frame_ember', name: 'Ember Ring', rarity: 'rare', price: 300 },
    { id: 'frame_solar', name: 'Solar Ring', rarity: 'epic', price: 500 },
    { id: 'frame_galaxy', name: 'Galaxy Ring', rarity: 'legendary', price: 800 }
  ],
  backgrounds: [
    { id: 'bg_lava', name: 'Lava Field', rarity: 'rare', price: 500 },
    { id: 'bg_deepspace', name: 'Deep Space', rarity: 'epic', price: 750 },
    { id: 'bg_antigravity', name: 'Antigravity Core', rarity: 'legendary', price: 1200 }
  ]
};
