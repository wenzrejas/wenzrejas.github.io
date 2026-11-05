export const WORLD_LOCATIONS = {
  timewell: {
    position: [-200, 0, 900] as [number, number, number],
    radius: 70,
  },
  cozy: {
    position: [-850, 0, 300] as [number, number, number],
    radius: 55,
  },
  lumina: {
    position: [680, 0, 500] as [number, number, number],
    radius: 45,
  },
  buildshore: {
    position: [-527.33, 0, -628.45] as [number, number, number],
    radius: 80,
  },
  tech: {
    position: [750, 0, -450] as [number, number, number],
    radius: 30,
  },
} as const

export const VIEW_MARGIN = 80
export const ISLAND_ROOT_NAME = 'island-root'

// ── First-approach reveal ─────────────────────────────────────────────────────
export const REVEAL_LEAD = 36
export const REVEAL_RISE = 3.5
export const REVEAL_HOLD = 2.8
export const REVEAL_FALL = 3.2
export const REVEAL_ZOOM = 0.9
export const REVEAL_STOP_SHORT = 60
export const REVEAL_FOCUS_HEIGHT_SHARE = 0.7
export const REVEAL_SPEED = 0.32
export const REVEAL_TITLE_IN = 0.4
export const REVEAL_TITLE_ROOM = 0.23
export const REVEAL_SUBTITLE_COLORS: Record<IslandKey, string> = {
  timewell: '#9b59b6',
  cozy: '#ff5a16',
  lumina: '#f0a500',
  buildshore: '#96caff',
  tech: '#5aab61',
}
export const ISLAND_LEAVE_MARGIN = 120

export type IslandKey = keyof typeof WORLD_LOCATIONS
export type IslandConfig = (typeof WORLD_LOCATIONS)[IslandKey]

// ── Night glow ────────────────────────────────────────────────────────────────
export const NIGHT_GLOW_START = 0.05
export const NIGHT_GLOW_FULL = 0.42

// ── Model and title defaults ──────────────────────────────────────────────────
export const DEFAULT_ISLAND_BRIGHTNESS = 1.05
export const TITLE_RISE_PIXELS = 16

// ── Ground glow motes ─────────────────────────────────────────────────────────
export const GROUND_MOTE_SIZE_JITTER = [0.6, 1.2] as const
