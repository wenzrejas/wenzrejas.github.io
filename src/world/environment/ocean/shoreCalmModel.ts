import * as THREE from 'three'
import type { Waterline } from '@/world/shore/shoreField'
import { SHORE_CALM_MAP_RESOLUTION } from './constants'
import { measureShoreCalm } from './shoreCalm'

const waveShares = new Uint8Array(SHORE_CALM_MAP_RESOLUTION ** 2).fill(255)

function createShoreCalmMap(): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    waveShares,
    SHORE_CALM_MAP_RESOLUTION,
    SHORE_CALM_MAP_RESOLUTION,
    THREE.RedFormat
  )
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

export const shoreCalmMap = createShoreCalmMap()

export function paintShoreCalm(waterlines: Waterline[]): void {
  measureShoreCalm(waterlines, waveShares)
  shoreCalmMap.needsUpdate = true
}
