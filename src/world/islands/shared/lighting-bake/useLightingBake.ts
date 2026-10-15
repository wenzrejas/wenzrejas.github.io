import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { IslandModel } from '../islandModel'
import { updateLightingBakeLevels } from './lightingBakeLevels'
import { bakeIslandLighting } from './lightingBakeModel'

interface LightingBakeTuning {
  overheadShadowStrength: number
  lampLevel: (seconds: number) => number
}

export function useLightingBake(
  island: IslandModel,
  { overheadShadowStrength, lampLevel }: LightingBakeTuning
) {
  const levels = useMemo(() => bakeIslandLighting(island), [island])

  useFrame(({ clock }) =>
    updateLightingBakeLevels(levels, overheadShadowStrength, lampLevel(clock.getElapsedTime()))
  )
}
