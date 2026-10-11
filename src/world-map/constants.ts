// ── Motion (keyframe names in WorldMap.scss) ──────────────────────────────────
export const UNFOLD_ANIMATION = 'world-map-unfold'
export const FOLD_ANIMATION = 'world-map-fold'

// ── Fast travel (world units, side turns in radians) ──────────────────────────
export const ARRIVAL_SHORE_GAP = 35
export const ARRIVAL_BOUNDARY_GAP = 60
export const ARRIVAL_SEARCH_STEP = 4
export const ARRIVAL_SEARCH_REACH = 400
export const ARRIVAL_SIDE_TURNS = [
  0,
  Math.PI / 4,
  -Math.PI / 4,
  Math.PI / 2,
  -Math.PI / 2,
  (3 * Math.PI) / 4,
  (-3 * Math.PI) / 4,
  Math.PI,
]
