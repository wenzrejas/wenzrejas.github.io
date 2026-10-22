import { OCEAN_DEFAULTS, OCEAN_PLANE_SIZE } from './constants'
import { shoreCalmMap } from './shoreCalmModel'

export const waveUniforms = {
  uTime: { value: 0 },
  uWaveAmp: { value: OCEAN_DEFAULTS.waveAmp },
  uWaveSpeed: { value: OCEAN_DEFAULTS.waveSpeed },
  uWindAmp: { value: 1.0 },
  uShoreCalmMap: { value: shoreCalmMap },
  uShoreCalmMapSize: { value: OCEAN_PLANE_SIZE },
}
