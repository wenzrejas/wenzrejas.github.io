import { useMemo } from 'react'
import type * as THREE from 'three'
import type { IslandKey } from '../Islands/constants'
import { OCEAN_Y } from '../Ocean/constants'
import {
  COLLISION_REACH,
  COLLISION_RESOLUTION,
  SHORELINE_MARGIN,
  SHORELINE_RESOLUTION,
  WAVE_SMOOTHING,
} from './constants'
import { buildCoastFields } from './shoreField'
import CoastCollider from './CoastCollider'
import Shoreline from './Shoreline'

interface CoastProps {
  islandKey: IslandKey
  model: THREE.Object3D
  islandScale: number
  offsetY: number
}

export default function Coast({ islandKey, model, islandScale, offsetY }: CoastProps) {
  const waterY = (OCEAN_Y - offsetY) / islandScale
  const fields = useMemo(
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

  if (!fields) return null

  return (
    <>
      <Shoreline field={fields.shoreline} islandScale={islandScale} offsetY={offsetY} />
      <CoastCollider islandKey={islandKey} field={fields.collision} islandScale={islandScale} />
    </>
  )
}
