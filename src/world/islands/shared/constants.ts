export const WORLD_LOCATIONS = {
  timewell: {
    position: [-200, 0, 900] as [number, number, number],
    radius: 70,
    color: '#4a90d9',
  },
  cozy: {
    position: [-850, 0, 300] as [number, number, number],
    radius: 55,
    color: '#5aab61',
  },
  lumina: {
    position: [680, 0, 500] as [number, number, number],
    radius: 45,
    color: '#e07b39',
  },
  buildshore: {
    position: [-300, 0, -670] as [number, number, number],
    radius: 80,
    color: '#9b59b6',
  },
  tech: {
    position: [750, 0, -450] as [number, number, number],
    radius: 30,
    color: '#f0a500',
  },
} as const

export const VIEW_MARGIN = 80

// ── First-approach reveal ─────────────────────────────────────────────────────
export const REVEAL_LEAD = 40
export const REVEAL_RISE = 2.6
export const REVEAL_HOLD = 2.8
export const REVEAL_FALL = 2.2
export const REVEAL_ZOOM = 0.82
export const REVEAL_PAN = 90
export const REVEAL_SPEED = 0.32
export const REVEAL_TITLE_IN = 0.55

export type IslandKey = keyof typeof WORLD_LOCATIONS
export type IslandConfig = (typeof WORLD_LOCATIONS)[IslandKey]
