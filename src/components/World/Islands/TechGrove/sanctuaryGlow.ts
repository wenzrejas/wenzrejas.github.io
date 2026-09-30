import { useFrame } from '@react-three/fiber'
import { dayNightGlow, lightGlows, type GlowTarget } from '../nightGlow'
import { GLOW_DAY_SHARE, GLOW_EMISSIVE_GAIN } from './constants'

export const sanctuaryGlow = () => dayNightGlow(GLOW_DAY_SHARE)

export function useSanctuaryGlow(glows: GlowTarget[]) {
  useFrame(() => lightGlows(glows, sanctuaryGlow() * GLOW_EMISSIVE_GAIN))
}
