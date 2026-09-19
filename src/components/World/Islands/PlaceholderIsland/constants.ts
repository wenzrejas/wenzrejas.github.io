import { BASE_TUNING, type IslandSpec } from '../islandSpec'

const PLACEHOLDER_FOOTPRINT = 2

export const placeholderSpec = (): IslandSpec => ({
  tuning: { ...BASE_TUNING },
  footprint: PLACEHOLDER_FOOTPRINT,
  height: 0.7,
  collision: [],
  shore: [{ x: 0, z: 0, radius: 1 }],
  calm: { inner: 1, outer: 1 },
})
