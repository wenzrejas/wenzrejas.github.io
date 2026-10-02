import { BOUNDARY_RADIUS } from '@/world/environment/boundary/constants'
import type { IslandKey } from '@/world/islands/shared/constants'

// ── Chart ─────────────────────────────────────────────────────────────────────
export const CHART_WORLD_RADIUS = BOUNDARY_RADIUS

// ── Island outlines ───────────────────────────────────────────────────────────
export const OUTLINE_POINTS = 18
export const LOBE_COUNT = 2
export const LOBE_DEPTH = 0.16
export const COVE_COUNT = 5
export const COVE_DEPTH = 0.08
export const OUTLINE_PHASE_STEP = 2.3

// ── Whirlpool ─────────────────────────────────────────────────────────────────
export const WHIRLPOOL_ISLAND: IslandKey = 'timewell'
export const WHIRLPOOL_TURNS = 2.25
export const WHIRLPOOL_STEPS_PER_TURN = 24
