// ── Patches (scattered around the ship like the glowing algae) ────────────────
export const JELLY_MAX_PATCHES = 6
export const JELLY_PATCH_CHECK_SECONDS = 5
export const JELLY_PATCH_CHANCE = 0.6
export const JELLY_PATCH_RADIUS_MIN = 90
export const JELLY_PATCH_RADIUS_MAX = 180
export const JELLY_PATCH_LUMPS = [
  { waves: 2, size: 0.2 },
  { waves: 3, size: 0.13 },
  { waves: 5, size: 0.07 },
]
export const JELLY_PATCH_EDGE_REACH = JELLY_PATCH_LUMPS.reduce((reach, { size }) => reach + size, 1)
export const JELLY_PATCH_EDGE_SPACING = 1.8
export const JELLY_PATCH_SPOT_ATTEMPTS = 12
export const JELLY_PATCH_APART = 60
export const JELLY_PATCH_BESIDE_SHIP_SHARE = 1.15
export const JELLY_PATCH_BESIDE_SHIP_MIN = 15
export const JELLY_PATCH_BESIDE_SHIP_MAX = 50
export const JELLY_PATCH_BESIDE_SHIP_SPREAD = 0.5
export const JELLY_PATCH_BEYOND_VIEW = 200
export const JELLY_PATCH_DESPAWN_DISTANCE = 1100

// ── How many, and how they settle in a patch ──────────────────────────────────
export const JELLY_COUNT = 700
export const JELLY_COUNT_SMOOTH = 260
export const JELLY_AREA_EACH = 240
export const JELLY_PATCH_SMALLEST = 12
export const JELLY_ZOOMED_OUT_BOOST_MAX = 1.3
export const JELLY_SHORE_GAP = 20
export const JELLY_NEAR_SHORE_MARGIN = 60
export const JELLY_SPOT_ATTEMPTS = 20
export const JELLY_PLACED_PER_FRAME = 20
export const JELLY_CLEAR_OF_SHIP = 35

// ── Batches ───────────────────────────────────────────────────────────────────
export const JELLY_BATCH_SIZE = 16
export const JELLY_BATCH_SECONDS = 4
export const JELLY_BATCH_SPREAD_SECONDS = 1.5
export const BLOOM_SPOTTED_RISE = 0.5

// ── Body (world units) ────────────────────────────────────────────────────────
export const JELLY_SMALLEST_RADIUS = 1.4
export const JELLY_LARGEST_RADIUS = 1.9
export const JELLY_SHALLOWEST = 3
export const JELLY_DEEPEST = 11
export const JELLY_SINK_DEPTH = 14

// ── Colour and glow ───────────────────────────────────────────────────────────
export const JELLY_TINT = '#b07cff'
export const JELLY_BRIGHTNESS = 0.85
export const JELLY_DEEPEST_BRIGHTNESS = 0.65
export const JELLY_HALO_SIZE = 8
export const JELLY_HALO_LIFT = 0.25
export const JELLY_HALO_STRENGTH = 0.34

// ── Under the water (rides the ocean's waves, brighter on crests like the algae)
export const JELLY_CREST_DIM = 0.7
export const JELLY_CREST_BRIGHT = 1.25
export const JELLY_WOBBLE_GRAIN = 0.8
export const JELLY_WOBBLE_RATE = 1.6
export const JELLY_WOBBLE_SIZE = 0.3

// ── Motion (all ride one current; neighbours also sway together in slow circles)
export const JELLY_LEAN_RATE = 0.24
export const JELLY_CURRENT_SPEED = 1.5
export const JELLY_WANDER_SPEED = 0.6
export const JELLY_WANDER_TURN_RATE = 0.4
export const JELLY_WANDER_GRAIN = 0.03
export const JELLY_WANDER_SPREAD = 1
export const JELLY_RISE_SECONDS = 8

// ── Brushing the hull: pushed clear first, then a slow dive ───────────────────
export const JELLY_BRUSH_REACH = 3
export const JELLY_BRUSH_CHECK_DISTANCE = 60
export const JELLY_BRUSHABLE_RISE = 0.5
export const JELLY_CLEAR_SPEED = 4
export const JELLY_CLEAR_EASE_SECONDS = 0.8
export const JELLY_CLEARANCE = 11
export const JELLY_CLEAR_SECONDS_MIN = 0.8
export const JELLY_CLEAR_SECONDS_MAX = 5
export const JELLY_DIVE_SECONDS = 6
export const JELLY_RETURN_SECONDS_MIN = 8
export const JELLY_RETURN_SECONDS_MAX = 16
