import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../../store/cycleStore'
import { useWeatherStore } from '../../../../store/weatherStore'

const GLOW_START = 0.05
const GLOW_FULL = 0.42

const FLICKER_DEPTH = 0.3

const FIRE_MATERIALS = new Set(['Flame', 'FlameHot'])

export type GlowTarget = { mat: THREE.MeshStandardMaterial; base: number; fire: boolean }

export const isFireMaterial = (name: string) => FIRE_MATERIALS.has(name)

const nightGlow = () =>
  THREE.MathUtils.smoothstep(useCycleStore.getState().nightFactor, GLOW_START, GLOW_FULL)

export const fireGlow = () => nightGlow() * (1 - useWeatherStore.getState().rainIntensity)

export function useNightGlow(glows: GlowTarget[]) {
  useFrame(({ clock }) => {
    const lamps = nightGlow()

    const t = clock.getElapsedTime()
    const n =
      Math.sin(t * 6.7) * 0.34 +
      Math.sin(t * 14.3) * 0.28 +
      Math.sin(t * 27.1) * 0.22 +
      Math.sin(t * 43.9) * 0.16
    const flames = fireGlow() * (1 - FLICKER_DEPTH * (0.5 - 0.5 * n))

    for (const { mat, base, fire } of glows) {
      mat.emissiveIntensity = base * (fire ? flames : lamps)
    }
  })
}
