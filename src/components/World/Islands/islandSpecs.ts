import type { IslandKey } from './constants'
import type { IslandModelTuning, IslandSpec } from './islandSpec'
import { COZY_SPEC } from './CozyIsle/constants'
import { LUMINA_SPEC } from './LuminaPoint/constants'
import { TECH_SPEC } from './TechGrove/constants'
import { placeholderSpec } from './PlaceholderIsland/constants'

export const ISLAND_SPECS: Record<IslandKey, IslandSpec> = {
  timewell: placeholderSpec(),
  cozy: COZY_SPEC,
  lumina: LUMINA_SPEC,
  buildshore: placeholderSpec(),
  tech: TECH_SPEC,
}

export const ISLAND_KEYS = Object.keys(ISLAND_SPECS) as IslandKey[]

export const ISLAND_MODEL_DEFAULTS = Object.fromEntries(
  ISLAND_KEYS.map((key) => [key, { ...ISLAND_SPECS[key].tuning }])
) as Record<IslandKey, IslandModelTuning>
