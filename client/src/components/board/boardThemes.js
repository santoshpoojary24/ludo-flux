/* ─── Board Theme Definitions ───────────────────────────────────────
   Each theme controls every visual aspect of the Ludo board:
   - boardBg        : outer board background
   - cellBg         : normal path cell background
   - cellBorder     : path cell border color
   - safeCellBg     : safe/star cell tint suffix (appended to token color)
   - texture        : CSS repeating-gradient overlay for texture
   - quadrant       : per-color quadrant override (optional)
   - borderColor    : board outer border
   - centerGlow     : home centre glow color
   - borderRadius   : corner rounding of board
   - homeSlotBg     : token slot circle style
────────────────────────────────────────────────────────────────── */

export const BOARD_THEMES = {

  /* ── Dark Walnut (default) ─────────────────────────────────── */
  walnut: {
    boardBg:     'linear-gradient(145deg,#2C1A0E 0%,#1F1208 45%,#2C1A0E 100%)',
    cellBg:      'linear-gradient(145deg,#FFF8F0,#EDE0D0)',
    cellBorder:  'rgba(160,120,80,0.35)',
    safeTint:    '28',
    texture:     `repeating-linear-gradient(88deg,transparent 0px,transparent 12px,rgba(255,255,255,0.018) 12px,rgba(255,255,255,0.018) 13px)`,
    boardBorder: '2px solid rgba(255,215,0,0.3)',
    boxShadow:   '0 0 0 3px rgba(255,215,0,0.25),0 0 0 6px rgba(0,0,0,0.5),0 28px 60px rgba(0,0,0,0.7),inset 0 2px 8px rgba(255,215,0,0.12)',
    borderRadius: 22,
    centerGlow:  'rgba(255,215,0,0.35)',
    quadrant: {
      red:    { bg:'hsl(348,72%,34%)', light:'hsl(348,65%,52%)', glow:'rgba(160,20,45,0.55)' },
      green:  { bg:'hsl(152,65%,22%)', light:'hsl(152,60%,38%)', glow:'rgba(15,110,55,0.55)' },
      yellow: { bg:'hsl(40,80%,32%)',  light:'hsl(42,85%,50%)',  glow:'rgba(180,130,10,0.55)' },
      blue:   { bg:'hsl(220,80%,26%)', light:'hsl(220,75%,44%)', glow:'rgba(15,50,160,0.55)' },
    },
  },

  /* ── White Marble ──────────────────────────────────────────── */
  marble: {
    boardBg:     'linear-gradient(145deg,#f9f7f4 0%,#e8e2d9 50%,#f9f7f4 100%)',
    cellBg:      'linear-gradient(145deg,#ffffff,#f0ece4)',
    cellBorder:  'rgba(180,160,140,0.4)',
    safeTint:    '30',
    texture:     `repeating-linear-gradient(125deg,transparent 0px,transparent 18px,rgba(0,0,0,0.025) 18px,rgba(0,0,0,0.025) 19px),repeating-linear-gradient(35deg,transparent 0px,transparent 22px,rgba(0,0,0,0.018) 22px,rgba(0,0,0,0.018) 23px)`,
    boardBorder: '3px solid rgba(200,180,150,0.6)',
    boxShadow:   '0 0 0 4px rgba(200,180,150,0.3),0 24px 50px rgba(0,0,0,0.25),inset 0 2px 8px rgba(255,255,255,0.9)',
    borderRadius: 20,
    centerGlow:  'rgba(200,150,50,0.3)',
    quadrant: {
      red:    { bg:'hsl(348,60%,82%)', light:'hsl(348,65%,90%)', glow:'rgba(200,100,120,0.3)' },
      green:  { bg:'hsl(152,45%,78%)', light:'hsl(152,50%,88%)', glow:'rgba(80,180,120,0.3)' },
      yellow: { bg:'hsl(42,70%,82%)',  light:'hsl(42,75%,90%)',  glow:'rgba(220,170,50,0.3)' },
      blue:   { bg:'hsl(220,60%,80%)', light:'hsl(220,65%,88%)', glow:'rgba(80,120,220,0.3)' },
    },
  },

  /* ── Cosmic / Space ────────────────────────────────────────── */
  cosmic: {
    boardBg:     'linear-gradient(145deg,#080420 0%,#0f0c29 40%,#1a0a2e 100%)',
    cellBg:      'linear-gradient(145deg,#1a1535,#12102a)',
    cellBorder:  'rgba(150,100,255,0.25)',
    safeTint:    '35',
    texture:     `radial-gradient(ellipse at 20% 20%,rgba(120,80,255,0.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(80,120,255,0.06) 0%,transparent 50%)`,
    boardBorder: '2px solid rgba(150,100,255,0.4)',
    boxShadow:   '0 0 0 2px rgba(150,100,255,0.2),0 0 40px rgba(120,80,255,0.3),0 28px 60px rgba(0,0,0,0.8)',
    borderRadius: 24,
    centerGlow:  'rgba(180,120,255,0.5)',
    quadrant: {
      red:    { bg:'hsl(280,60%,22%)', light:'hsl(300,55%,38%)', glow:'rgba(180,60,220,0.5)' },
      green:  { bg:'hsl(200,70%,18%)', light:'hsl(200,65%,34%)', glow:'rgba(30,140,200,0.5)' },
      yellow: { bg:'hsl(240,65%,22%)', light:'hsl(240,60%,40%)', glow:'rgba(80,80,240,0.5)' },
      blue:   { bg:'hsl(180,60%,18%)', light:'hsl(180,55%,32%)', glow:'rgba(30,180,200,0.5)' },
    },
  },

  /* ── Jade Temple ───────────────────────────────────────────── */
  jade: {
    boardBg:     'linear-gradient(145deg,#0a2a1a 0%,#0d3d28 45%,#0a2a1a 100%)',
    cellBg:      'linear-gradient(145deg,#d4f7e8,#b8ead6)',
    cellBorder:  'rgba(30,140,80,0.35)',
    safeTint:    '45',
    texture:     `repeating-linear-gradient(0deg,transparent 0px,transparent 8px,rgba(255,255,255,0.03) 8px,rgba(255,255,255,0.03) 9px),repeating-linear-gradient(90deg,transparent 0px,transparent 8px,rgba(255,255,255,0.03) 8px,rgba(255,255,255,0.03) 9px)`,
    boardBorder: '3px solid rgba(80,200,120,0.4)',
    boxShadow:   '0 0 0 3px rgba(80,200,120,0.2),0 0 30px rgba(20,150,80,0.35),0 28px 60px rgba(0,0,0,0.7)',
    borderRadius: 18,
    centerGlow:  'rgba(80,200,120,0.4)',
    quadrant: {
      red:    { bg:'hsl(0,65%,28%)',   light:'hsl(0,60%,44%)',   glow:'rgba(180,40,40,0.5)' },
      green:  { bg:'hsl(140,65%,20%)', light:'hsl(140,60%,36%)', glow:'rgba(20,160,80,0.5)' },
      yellow: { bg:'hsl(80,60%,24%)',  light:'hsl(80,55%,40%)',  glow:'rgba(120,180,30,0.5)' },
      blue:   { bg:'hsl(180,65%,18%)', light:'hsl(180,60%,32%)', glow:'rgba(20,160,150,0.5)' },
    },
  },

  /* ── Neon Grid ─────────────────────────────────────────────── */
  neon: {
    boardBg:     'linear-gradient(145deg,#050510 0%,#0a0a1e 45%,#050510 100%)',
    cellBg:      'linear-gradient(145deg,#0d0d22,#080818)',
    cellBorder:  'rgba(0,255,200,0.3)',
    safeTint:    '40',
    texture:     `repeating-linear-gradient(0deg,transparent 0px,transparent 6.5%,rgba(0,255,200,0.04) 6.5%,rgba(0,255,200,0.04) 7%),repeating-linear-gradient(90deg,transparent 0px,transparent 6.5%,rgba(0,255,200,0.04) 6.5%,rgba(0,255,200,0.04) 7%)`,
    boardBorder: '2px solid rgba(0,255,200,0.5)',
    boxShadow:   '0 0 0 2px rgba(0,255,200,0.15),0 0 50px rgba(0,200,255,0.25),0 28px 60px rgba(0,0,0,0.9)',
    borderRadius: 16,
    centerGlow:  'rgba(0,255,200,0.5)',
    quadrant: {
      red:    { bg:'hsl(340,90%,16%)', light:'hsl(340,85%,32%)', glow:'rgba(255,20,100,0.55)' },
      green:  { bg:'hsl(160,90%,10%)', light:'hsl(160,85%,26%)', glow:'rgba(0,255,150,0.55)' },
      yellow: { bg:'hsl(55,90%,12%)',  light:'hsl(55,85%,28%)',  glow:'rgba(255,220,0,0.55)' },
      blue:   { bg:'hsl(200,90%,12%)', light:'hsl(200,85%,28%)', glow:'rgba(0,200,255,0.55)' },
    },
  },

  /* ── Ancient Scroll / Parchment ────────────────────────────── */
  parchment: {
    boardBg:     'linear-gradient(145deg,#c49a3c 0%,#a0722a 40%,#c49a3c 100%)',
    cellBg:      'linear-gradient(145deg,#fdf3d0,#f5e4a8)',
    cellBorder:  'rgba(120,80,20,0.4)',
    safeTint:    '35',
    texture:     `repeating-linear-gradient(45deg,transparent 0px,transparent 6px,rgba(100,60,10,0.06) 6px,rgba(100,60,10,0.06) 7px)`,
    boardBorder: '4px solid rgba(100,60,10,0.6)',
    boxShadow:   '0 0 0 3px rgba(180,120,30,0.3),0 24px 50px rgba(0,0,0,0.5),inset 0 2px 8px rgba(255,220,100,0.2)',
    borderRadius: 14,
    centerGlow:  'rgba(180,120,30,0.4)',
    quadrant: {
      red:    { bg:'hsl(0,65%,44%)',   light:'hsl(0,60%,58%)',   glow:'rgba(200,60,60,0.4)' },
      green:  { bg:'hsl(140,50%,34%)', light:'hsl(140,45%,48%)', glow:'rgba(50,160,90,0.4)' },
      yellow: { bg:'hsl(42,70%,40%)',  light:'hsl(42,65%,56%)',  glow:'rgba(200,150,30,0.4)' },
      blue:   { bg:'hsl(220,55%,36%)', light:'hsl(220,50%,50%)', glow:'rgba(50,90,200,0.4)' },
    },
  },
};
