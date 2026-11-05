import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { mix } from '@/utils/math'
import { NIGHT_GLOW_FULL, NIGHT_GLOW_START } from './constants'

export interface GlowTarget {
  material: THREE.MeshStandardMaterial
  base: number
}

export const nightGlow = () =>
  THREE.MathUtils.smoothstep(
    useCycleStore.getState().nightFactor,
    NIGHT_GLOW_START,
    NIGHT_GLOW_FULL
  )

export const dayNightGlow = (dayShare: number) => mix(dayShare, 1, nightGlow())

export function lightGlows(glows: GlowTarget[], level: number) {
  for (const { material, base } of glows) material.emissiveIntensity = base * level
}

export function useNightGlow(glows: GlowTarget[]) {
  useFrame(() => lightGlows(glows, nightGlow()))
}
