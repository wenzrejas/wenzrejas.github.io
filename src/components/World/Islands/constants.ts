export const WORLD_LOCATIONS = {
  timewell: {
    label: 'Timewell Depth',
    description: 'Experience & Journey',
    position: [-150, 0, 800] as [number, number, number],
    radius: 70,
    color: '#4a90d9',
  },
  cozy: {
    label: 'Cozy Isle',
    description: 'Coffee & Support',
    position: [-788, 0, 265] as [number, number, number],
    radius: 55,
    color: '#5aab61',
  },
  lumina: {
    label: 'Lumina Point',
    description: 'Contact & Connect',
    position: [650, 0, 400] as [number, number, number],
    radius: 45,
    color: '#e07b39',
  },
  buildshore: {
    label: 'Buildshore Archipelago',
    description: 'Projects & Works',
    position: [-300, 0, -670] as [number, number, number],
    radius: 80,
    color: '#9b59b6',
  },
  tech: {
    label: 'Tech Grove',
    description: 'Skills & Technologies',
    position: [730, 0, -450] as [number, number, number],
    radius: 30,
    color: '#f0a500',
  },
} as const

export const ISLAND_INTERACTION = false

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
