import { useMemo } from 'react'
import type * as THREE from 'three'
import { OCEAN_Y } from '../Ocean/constants'
import {
  COLLISION_REACH,
  COLLISION_RESOLUTION,
  SHORELINE_MARGIN,
  SHORELINE_RESOLUTION,
  WAVE_SMOOTHING,
} from './constants'
import { buildCoastFields, type CoastFields } from './shoreField'

export function useCoastFields(
  model: THREE.Object3D,
  islandScale: number,
  offsetY: number
): CoastFields | null {
  const waterY = (OCEAN_Y - offsetY) / islandScale
  return useMemo(
    () =>
      buildCoastFields(model, {
        waterY,
        margin: SHORELINE_MARGIN / islandScale,
        smoothing: WAVE_SMOOTHING / islandScale,
        resolution: SHORELINE_RESOLUTION,
        collisionReach: COLLISION_REACH / islandScale,
        collisionResolution: COLLISION_RESOLUTION,
      }),
    [model, waterY, islandScale]
  )
}
