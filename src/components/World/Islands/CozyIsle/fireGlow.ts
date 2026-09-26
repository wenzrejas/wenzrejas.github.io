import { useFrame } from '@react-three/fiber'
import { useWeatherStore } from '../../../../store/weatherStore'
import { lightGlows, nightGlow, type GlowTarget } from '../nightGlow'

const FLICKER_DEPTH = 0.3

const FIRE_MATERIALS = new Set(['Flame', 'FlameHot'])

export const isFireMaterial = (name: string) => FIRE_MATERIALS.has(name)

export const fireGlow = () => nightGlow() * (1 - useWeatherStore.getState().rainIntensity)

export function useFireGlow(flames: GlowTarget[]) {
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const n =
      Math.sin(t * 6.7) * 0.34 +
      Math.sin(t * 14.3) * 0.28 +
      Math.sin(t * 27.1) * 0.22 +
      Math.sin(t * 43.9) * 0.16
    lightGlows(flames, fireGlow() * (1 - FLICKER_DEPTH * (0.5 - 0.5 * n)))
  })
}
