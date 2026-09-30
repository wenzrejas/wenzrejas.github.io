import { mix } from '../../../../utils/math'
import { nightGlow } from '../nightGlow'
import { LOGO_DAY_SHARE, PROJECTOR_DAY_SHARE } from './constants'
import type { HologramUniforms } from './hologramModel'

export const projectorGlow = () => mix(PROJECTOR_DAY_SHARE, 1, nightGlow())

const logoGlow = () => mix(LOGO_DAY_SHARE, 1, nightGlow())

export function lightHolograms(uniforms: HologramUniforms, time: number) {
  uniforms.uTime.value = time
  uniforms.projectorLevel.value = projectorGlow()
  uniforms.logoLevel.value = logoGlow()
}
