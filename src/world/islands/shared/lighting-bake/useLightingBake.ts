import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { IslandModel } from '../islandModel'
import { updateLightingBakeLevels } from './lightingBakeLevels'
import { bakeIslandLighting, type LampZone } from './lightingBakeModel'

interface LightingBakeTuning {
  overheadShadowStrength: number
  lampLevel: (seconds: number) => number
  lampCeiling?: number
  lampZones?: LampZone[]
}

export function useLightingBake(
  island: IslandModel,
  { overheadShadowStrength, lampLevel, lampCeiling, lampZones }: LightingBakeTuning
) {
  const levels = useMemo(
    () => bakeIslandLighting(island, lampCeiling, lampZones),
    [island, lampCeiling, lampZones]
  )

  useFrame(({ clock }) =>
    updateLightingBakeLevels(levels, overheadShadowStrength, lampLevel(clock.getElapsedTime()))
  )
}
