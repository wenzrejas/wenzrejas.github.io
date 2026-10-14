// ── Sprite sheets (square frames, left to right then down) ────────────────────
export const FRAME_PIXELS = 256
export const SHEET_COLUMNS = 4

export const MASCOT_SHEETS = {
  appear: { url: '/images/wobbi/appear.webp', frameCount: 12 },
  idle: { url: '/images/wobbi/idle.webp', frameCount: 16 },
  talking: { url: '/images/wobbi/talking.webp', frameCount: 16 },
  happy: { url: '/images/wobbi/happy.webp', frameCount: 16 },
  excited: { url: '/images/wobbi/excited.webp', frameCount: 20 },
  curious: { url: '/images/wobbi/curious.webp', frameCount: 16 },
  surprised: { url: '/images/wobbi/surprised.webp', frameCount: 12 },
  confused: { url: '/images/wobbi/confused.webp', frameCount: 16 },
  achievement: { url: '/images/wobbi/achievement.webp', frameCount: 24 },
  exit: { url: '/images/wobbi/exit.webp', frameCount: 12 },
}

export type MascotAnimation = keyof typeof MASCOT_SHEETS
export type MascotMood = Exclude<MascotAnimation, 'appear' | 'exit'>

// ── Playback ──────────────────────────────────────────────────────────────────
export const EMOTE_FRAMES_PER_SECOND = 12
export const IDLE_FRAMES_PER_SECOND = 8

// ── Frame blending (share of sheet resolution read to find Wobbi per frame) ───
export const CENTROID_SAMPLE_SHARE = 0.25
