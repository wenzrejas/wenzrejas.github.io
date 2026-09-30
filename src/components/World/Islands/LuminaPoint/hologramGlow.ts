import { mix } from '../../../../utils/math'
import { dayNightGlow } from '../nightGlow'
import { HOVER_GLOW_GAIN, LOGO_DAY_SHARE, PROJECTOR_DAY_SHARE } from './constants'
import type { HologramUniforms } from './hologramModel'
import type { Monolith } from './monoliths'

const projectorGlow = () => dayNightGlow(PROJECTOR_DAY_SHARE)

export const inletGlow = ({ hoverBlend }: Monolith) =>
  projectorGlow() * mix(1, HOVER_GLOW_GAIN, hoverBlend)

const logoGlow = () => dayNightGlow(LOGO_DAY_SHARE)

export function lightHolograms(uniforms: HologramUniforms, time: number) {
  uniforms.uTime.value = time
  uniforms.projectorLevel.value = projectorGlow()
  uniforms.logoLevel.value = logoGlow()
}
