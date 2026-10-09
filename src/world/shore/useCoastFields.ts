import { useMemo } from 'react'
import type * as THREE from 'three'
import { OCEAN_Y } from '../environment/ocean/constants'
import {
  COLLISION_REACH,
  COLLISION_RESOLUTION,
  SHORELINE_MARGIN,
  SHORELINE_RESOLUTION,
  WAVE_SMOOTHING,
} from './constants'
import { buildCoastFields, type CoastFields } from './shoreField'
import { islandLocalY } from '@/world/islands/shared/islandSpec'

export function useCoastFields(
  model: THREE.Object3D,
  islandScale: number,
  offsetY: number
): CoastFields | null {
  const waterY = islandLocalY(OCEAN_Y, islandScale, offsetY)
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
