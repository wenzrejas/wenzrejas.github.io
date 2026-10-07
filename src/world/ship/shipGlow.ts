import { useFrame } from '@react-three/fiber'
import { lightGlows, nightGlow, type GlowTarget } from '../islands/shared/nightGlow'
import { GLOW_NIGHT_GAIN } from './constants'

export function useShipGlow(glows: GlowTarget[]) {
  useFrame(() => lightGlows(glows, nightGlow() * GLOW_NIGHT_GAIN))
}
