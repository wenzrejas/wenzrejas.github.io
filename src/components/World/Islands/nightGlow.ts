import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'

const GLOW_START = 0.05
const GLOW_FULL = 0.42

export interface GlowTarget {
  mat: THREE.MeshStandardMaterial
  base: number
}

export const nightGlow = () =>
  THREE.MathUtils.smoothstep(useCycleStore.getState().nightFactor, GLOW_START, GLOW_FULL)

export function useNightGlow(glows: GlowTarget[]) {
  useFrame(() => {
    const level = nightGlow()
    for (const { mat, base } of glows) mat.emissiveIntensity = base * level
  })
}
