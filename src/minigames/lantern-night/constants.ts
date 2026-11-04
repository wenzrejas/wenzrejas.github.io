import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'

// ── Night ─────────────────────────────────────────────────────────────────────
export const LANTERNS_APPEAR_FROM = PHASES.night
export const LANTERNS_APPEAR_UNTIL = PHASES['first light']

// ── Flock ─────────────────────────────────────────────────────────────────────
export const LANTERN_AFLOAT_COUNT = 12
export const LANTERN_FINALE_COUNT = 150
export const LANTERN_FINALE_COUNT_SMOOTH = 90
export const LANTERN_CAPACITY = LANTERN_AFLOAT_COUNT + LANTERN_FINALE_COUNT
export const LANTERN_VIEW_MARGIN = 1.25
export const LANTERN_ZOOMED_OUT_BOOST_MAX = 1.3

// ── Cluster (world units) ─────────────────────────────────────────────────────
export const LANTERN_CLUSTER_ATTEMPTS = 12
export const LANTERN_CLUSTER_SPOT_ATTEMPTS = 16
export const LANTERN_CLUSTER_BEARING_SPREAD = 2.4
export const LANTERN_CLUSTER_SPREAD_MIN = 120
export const LANTERN_CLUSTER_SPREAD_MAX = 230
export const LANTERN_CLUSTER_STRETCH_MAX = 1.5
export const LANTERN_CLUSTER_CENTRE_MIN = 0.3
export const LANTERN_CLUSTER_CENTRE_MAX = 1
export const LANTERN_CLUSTER_GAP_ACROSS = 14
export const LANTERN_CLUSTER_GAP_UP = 14
export const LANTERN_NEAREST_GAP_MIN = 75
export const LANTERN_NEAREST_GAP_MAX = 115
export const LANTERN_NEAREST_VIEW_SHARE = 0.7
export const LANTERN_SHORE_GAP = 45
export const LANTERN_BOUNDARY_GAP = 120
export const LANTERN_REGATHER_DISTANCE = 700

// ── Reach (world units from the hull) ─────────────────────────────────────────
export const LANTERN_TOUCH_REACH = 9
export const LANTERN_TOUCH_CHECK_DISTANCE = 70
export const LANTERN_SPOTTED_REACH = 220

// ── Finale (gaps are on screen, in camera units, so lanterns never overlap) ───
export const LANTERN_FINALE_SECONDS = 20
export const LANTERN_FINALE_SPOT_ATTEMPTS = 16
export const LANTERN_FINALE_SHORE_GAP = 6
export const LANTERN_FINALE_SHIP_GAP = 45
export const LANTERN_FINALE_ACROSS = 1.1
export const LANTERN_FINALE_LOWEST = -1.15
export const LANTERN_FINALE_HIGHEST = 0.5
export const LANTERN_FINALE_GAP_ACROSS = 9
export const LANTERN_FINALE_GAP_UP = 12

// ── Shape (world units, base to top; round at the base, softly square on top) ─
export const LANTERN_PROFILE = [
  { height: 0, radius: 3.5, squareShare: 0, cap: 0 },
  { height: 0.9, radius: 3.65, squareShare: 0.05, cap: 0 },
  { height: 4.5, radius: 3.75, squareShare: 0.3, cap: 0 },
  { height: 7.8, radius: 3.55, squareShare: 0.7, cap: 0 },
  { height: 8.9, radius: 3.35, squareShare: 0.95, cap: 0 },
  { height: 9.2, radius: 3, squareShare: 1, cap: 1 },
]
export const LANTERN_CAP_HEIGHT = 9.35
export const LANTERN_SEGMENTS = 24
export const LANTERN_SQUARE_POWER = 4
export const LANTERN_SCALE = 0.65

// ── Paper ─────────────────────────────────────────────────────────────────────
export const LANTERN_TOP_COLOR = '#c98d55'
export const LANTERN_MID_COLOR = '#e38f42'
export const LANTERN_HOT_COLOR = '#ffc87e'
export const LANTERN_HOOP_COLOR = '#8f4f1e'
export const LANTERN_UNLIT_COLOR = '#f3e4c4'
export const LANTERN_UNLIT_HOOP_COLOR = '#7d6547'
export const LANTERN_UNLIT_SHADE_LOW = 0.46
export const LANTERN_UNLIT_SHADE_HIGH = 0.82
export const LANTERN_UNLIT_EMBER = 0.16
export const LANTERN_UNLIT_EMBER_TIGHTNESS = 7
export const LANTERN_HOT_HEIGHT = 0.22
export const LANTERN_HOT_SPREAD = 0.5
export const LANTERN_EDGE_SHADE = 0.78
export const LANTERN_SEAM_WIDTH = 0.05
export const LANTERN_SEAM_SHADE = 0.9
export const LANTERN_HOOP_SHARE = 0.07
export const LANTERN_CAP_TONE = 0.78
export const LANTERN_TONE_VARIATION = 0.1
export const LANTERN_FLICKER = 0.05
export const LANTERN_FLICKER_RATE = 7

// ── Afloat ────────────────────────────────────────────────────────────────────
export const LANTERN_APPEAR_SECONDS = 0.8
export const LANTERN_LEAVE_SECONDS = 1.6
export const LANTERN_LEAVE_SINK = 3
export const LANTERN_FLOAT_HEIGHT = 0.6
export const LANTERN_WAVE_TILT = 0.6
export const LANTERN_CREST_DIM = 0.8
export const LANTERN_CREST_BRIGHT = 1.2

// ── Flight ────────────────────────────────────────────────────────────────────
export const LANTERN_IGNITE_SECONDS = 0.9
export const LANTERN_LIFT_DELAY = 0.7
export const LANTERN_RISE_SPEED = 15
export const LANTERN_RISE_EASE_SECONDS = 2
export const LANTERN_CLEAR_OF_WATER = 4
export const LANTERN_SWAY = 1.5
export const LANTERN_SWAY_RATE = 0.6
export const LANTERN_ROLL = 0.05
export const LANTERN_WIND_DRIFT = 1.5
export const LANTERN_SWAY_FULL_HEIGHT = 15

// ── Glow ──────────────────────────────────────────────────────────────────────
export const LANTERN_GLOW_COLOR = '#ffae5e'
export const LANTERN_HALO_SIZE = 26
export const LANTERN_HALO_STRENGTH = 0.2
export const LANTERN_HALO_CENTRE = 4.6
export const LANTERN_IGNITE_FLARE = 0.8
export const LANTERN_IGNITE_FLARE_SECONDS = 1.4
export const LANTERN_UNLIT_HALO = 0.04

// ── Light on the sea (stays where the lantern lifted off, shrinking as it climbs) ─
export const LANTERN_POOL_SIZE = 44
export const LANTERN_POOL_Y = 0.3
export const LANTERN_POOL_STRENGTH = 0.38
export const LANTERN_POOL_GONE_HEIGHT = 110
