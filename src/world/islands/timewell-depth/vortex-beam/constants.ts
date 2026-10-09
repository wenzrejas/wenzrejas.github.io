// ── Vortex beam ───────────────────────────────────────────────────────────────
export const VORTEX_BEAM_RADIUS = 0.05
export const VORTEX_BEAM_HEIGHT = 0.9
export const VORTEX_BEAM_SEGMENTS = 24
export const VORTEX_BEAM_FLOW_DENSITY = 5
export const VORTEX_BEAM_FLOW_DEPTH = 0.35
export const VORTEX_BEAM_TOP_FADE = 0.6
export const VORTEX_BEAM_LAYERS = [
  { spread: 1, height: 1, sharpness: 6, strength: 0.9, flowRate: 0.8 },
  { spread: 2.2, height: 0.85, sharpness: 2.5, strength: 0.45, flowRate: 1.4 },
  { spread: 4, height: 0.7, sharpness: 1.2, strength: 0.2, flowRate: 0.5 },
]
