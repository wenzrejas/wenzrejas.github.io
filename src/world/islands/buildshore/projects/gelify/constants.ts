import type { CornerSparkleTuning } from '@/world/islands/shared/gem-sparkles/sparkleSpots'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const FLOATING_CARD_NODES = [
  'GEL_Editor_AdjustmentsCard',
  'GEL_Editor_ImageCard_Amber',
  'GEL_Editor_ImageCard_Purple',
  'GEL_Editor_PlayCard',
]
export const ACCENT_CUBE_NODES = ['GEL_Editor_AccentCube_blue', 'GEL_Editor_AccentCube_violet']
export const MONITOR_SCREEN_NODE = 'GEL Editor | Monitor screen'
export const ANGULAR_CUBE_PREFIX = 'GEL_Angular_Cube_'
export const ANGULAR_GEM_NODE = 'GEL_Angular_Gem'

// ── Editor in motion (model units, seconds) ───────────────────────────────────
export const EDITOR_RISE_SECONDS = 0.5
export const CARD_BOB = 0.07
export const CARD_BOB_RATE = 0.35
export const ACCENT_LIFT = 0.35
export const ACCENT_BOB = 0.08
export const ACCENT_BOB_RATE = 0.8
export const ACCENT_SPIN_RATE = 1.8
export const ACCENT_TUMBLE = 0.5
export const ACCENT_TUMBLE_RATE = 0.9

// ── Playhead (screen width shares, seconds) ───────────────────────────────────
export const PLAYHEAD_MIN_BRIGHTNESS = 0.9
export const PLAYHEAD_START_SHARE = 0.22
export const PLAYHEAD_END_SHARE = 0.91
export const PLAYHEAD_SWEEP_SECONDS = 3

// ── Angular blocks (model units, seconds) ─────────────────────────────────────
export const BLOCK_LIFT = 0.45
export const BLOCK_HOP_SECONDS = 0.55
export const BLOCK_STAGGER_SECONDS = 0.1
export const BLOCK_WAVE_SECONDS = 3.2
export const STACK_TOLERANCE = 0.1

// ── Angular gem (model units, seconds) ────────────────────────────────────────
export const ANGULAR_GEM_LIFT = 1.8
export const ANGULAR_GEM_FORWARD = 0.4
export const ANGULAR_GEM_RISE_SECONDS = 0.6
export const ANGULAR_GEM_STEP_SECONDS = 0.7
export const ANGULAR_GEM_PAUSE_SECONDS = 1
export const ANGULAR_GEM_GLOW_DAY_SHARE = 0.25
export const ANGULAR_GEM_GLOW_GAIN = 1.2

// ── Angular gem sparkles (model units, seconds) ───────────────────────────────
export const ANGULAR_GEM_SPARKLES: CornerSparkleTuning = {
  color: '#c4e9ff',
  count: 7,
  size: 0.85,
  periodMinSeconds: 1.2,
  periodMaxSeconds: 2.6,
  flashShare: 0.22,
  lift: 1.04,
  rayWidth: 0.14,
  tintShare: 1,
}

// ── Sapphire facets (view-space light) ────────────────────────────────────────
export const FACET_LIGHT_DIRECTION: [number, number, number] = [-0.4, 0.8, 0.45]
export const FACET_TILT_GAIN = 7.5
export const FACET_SHARPNESS = 2
export const FACET_SHADE_FLOOR = 0.35
