import { useFrame } from '@react-three/fiber'
import { dayNightGlow, lightGlows, type GlowTarget } from '../shared/nightGlow'
import {
  GLOW_DAY_SHARE,
  GLOW_EMISSIVE_GAIN,
  ORB_GLOW_DAY_SHARE,
  PEDESTAL_LABEL_DAY_SHARE,
} from './constants'

export const sanctuaryGlow = () => dayNightGlow(GLOW_DAY_SHARE)

export const orbGlow = () => dayNightGlow(ORB_GLOW_DAY_SHARE)

export function useSanctuaryGlow(glows: GlowTarget[]) {
  useFrame(() => lightGlows(glows, sanctuaryGlow() * GLOW_EMISSIVE_GAIN))
}

export function useLabelGlow(labels: GlowTarget[]) {
  useFrame(() => lightGlows(labels, dayNightGlow(PEDESTAL_LABEL_DAY_SHARE)))
}
