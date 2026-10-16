import { useFrame } from '@react-three/fiber'
import { dayNightGlow, lightGlows, nightGlow, type GlowTarget } from '../shared/nightGlow'
import {
  GLOW_DAY_SHARE,
  GLOW_EMISSIVE_GAIN,
  ORB_GLOW_DAY_SHARE,
  PEDESTAL_LABEL_DAY_SHARE,
  PEDESTAL_LABEL_MATERIAL,
  SHRINE_SPILL_STRENGTH,
} from './constants'

export const sanctuaryGlow = () => dayNightGlow(GLOW_DAY_SHARE)

export const orbGlow = () => dayNightGlow(ORB_GLOW_DAY_SHARE)

export const shrineSpillLevel = () => nightGlow() * SHRINE_SPILL_STRENGTH

const isPedestalLabel = ({ mat }: GlowTarget) => mat.name === PEDESTAL_LABEL_MATERIAL

export const sortSanctuaryGlows = (glows: GlowTarget[]) => ({
  shrineGlows: glows.filter((glow) => !isPedestalLabel(glow)),
  labelGlows: glows.filter(isPedestalLabel),
})

export function useSanctuaryGlow(glows: GlowTarget[]) {
  useFrame(() => lightGlows(glows, sanctuaryGlow() * GLOW_EMISSIVE_GAIN))
}

export function useLabelGlow(labels: GlowTarget[]) {
  useFrame(() => lightGlows(labels, dayNightGlow(PEDESTAL_LABEL_DAY_SHARE)))
}
