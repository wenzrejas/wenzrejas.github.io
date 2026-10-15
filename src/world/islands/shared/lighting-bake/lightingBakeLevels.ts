import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { OVERHEAD_LIGHT_HIGH_HEIGHT, OVERHEAD_LIGHT_LOW_HEIGHT } from './constants'
import type { LightingBakeLevels } from './lightingBakeModel'

function overheadLightLevel(sunHeight: number, moonHeight: number): number {
  const lightHeight = sunHeight > 0 ? sunHeight : moonHeight
  return THREE.MathUtils.smoothstep(
    lightHeight,
    OVERHEAD_LIGHT_LOW_HEIGHT,
    OVERHEAD_LIGHT_HIGH_HEIGHT
  )
}

export function updateLightingBakeLevels(
  levels: LightingBakeLevels,
  overheadShadowStrength: number,
  lampLevel: number
): void {
  const { clockSunHeight, oceanMoonDir } = useCycleStore.getState()
  levels.uOverheadShadow.value =
    overheadLightLevel(clockSunHeight, oceanMoonDir.y) * overheadShadowStrength
  levels.uLampSpill.value = lampLevel
}
