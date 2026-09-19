import type { IslandKey } from './constants'
import type { IslandModelTuning, IslandSpec } from './islandSpec'
import { COZY_SPEC } from './CozyIsle/constants'
import { BEACON_SPEC } from './BeaconIsle/constants'
import { placeholderSpec } from './PlaceholderIsland/constants'

export const ISLAND_SPECS: Record<IslandKey, IslandSpec> = {
  archipelago: placeholderSpec(),
  cozy: COZY_SPEC,
  beacon: BEACON_SPEC,
  whirlpool: placeholderSpec(),
  sanctuary: placeholderSpec(),
}

export const ISLAND_KEYS = Object.keys(ISLAND_SPECS) as IslandKey[]

export const ISLAND_MODEL_DEFAULTS = Object.fromEntries(
  ISLAND_KEYS.map((key) => [key, { ...ISLAND_SPECS[key].tuning }])
) as Record<IslandKey, IslandModelTuning>
