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

// ── Island styles ─────────────────────────────────────────────────────────────
export const ELLIPSE_ISLANDS: IslandKey[] = ['lumina']
export const ELLIPSE_STRETCH = 0.12
export const ELLIPSE_TILT = 0.5
export const ROUNDED_ISLAND_LOBES: Partial<Record<IslandKey, number>> = { tech: 6 }
export const ROUND_SAMPLES = 96

// ── Facets ────────────────────────────────────────────────────────────────────
export const FACET_LENGTH = 13
export const FACET_SHIFT = 0.6
export const FACET_DEPTH = 0.07
export const FACET_SEED = 7
