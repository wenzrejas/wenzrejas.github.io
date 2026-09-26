import { useFrame } from '@react-three/fiber'
import { mix } from '../../../../utils/math'
import { lightGlows, nightGlow, type GlowTarget } from '../nightGlow'
import { GLOW_DAY_SHARE, GLOW_EMISSIVE_GAIN } from './constants'

export const sanctuaryGlow = () => mix(GLOW_DAY_SHARE, 1, nightGlow())

export function useSanctuaryGlow(glows: GlowTarget[]) {
  useFrame(() => lightGlows(glows, sanctuaryGlow() * GLOW_EMISSIVE_GAIN))
}
