import { OCEAN_DEFAULTS, OCEAN_PLANE_SIZE } from './constants'
import { shoreCalmMap } from './shoreCalmModel'

export const waveUniforms = {
  uTime: { value: 0 },
  uWaveAmplitude: { value: OCEAN_DEFAULTS.waveAmplitude },
  uWaveSpeed: { value: OCEAN_DEFAULTS.waveSpeed },
  uWindAmplitude: { value: 1.0 },
  uShoreCalmMap: { value: shoreCalmMap },
  uShoreCalmMapSize: { value: OCEAN_PLANE_SIZE },
}
