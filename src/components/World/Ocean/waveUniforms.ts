import * as THREE from 'three'
import { MAX_SHORE_ISLANDS, OCEAN_DEFAULTS, SHORE_CALM_BAND } from './constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '../Islands/islandSpecs'
import { createIslandTransform, islandTransform } from '../Islands/islandTransform'

const SHORE_ISLANDS: THREE.Vector4[] = ISLAND_KEYS.slice(0, MAX_SHORE_ISLANDS).map((key) => {
  const spec = ISLAND_SPECS[key]
  const { x, z, scale } = islandTransform(key, spec.tuning, createIslandTransform())
  return new THREE.Vector4(x, z, spec.calm.inner * scale, spec.calm.outer * scale)
})
while (SHORE_ISLANDS.length < MAX_SHORE_ISLANDS) {
  SHORE_ISLANDS.push(new THREE.Vector4(1e6, 1e6, 1, 1))
}

export const waveUniforms = {
  uTime: { value: 0 },
  uWaveAmp: { value: OCEAN_DEFAULTS.waveAmp },
  uWaveSpeed: { value: OCEAN_DEFAULTS.waveSpeed },
  uWindAmp: { value: 1.0 },
  uIslands: { value: SHORE_ISLANDS },
  uShoreCalmBand: { value: SHORE_CALM_BAND },
}
