import { useControls, folder } from 'leva'
import { OCEAN_DEFAULTS } from '../../World/Ocean/constants'
import type { OceanControls } from '../types'

export function useOceanControls() {
  return useControls(
    'Ocean',
    {
      Wave: folder({
        waveAmp: { value: OCEAN_DEFAULTS.waveAmp, min: 0, max: 15, step: 0.1 },
        waveSpeed: { value: OCEAN_DEFAULTS.waveSpeed, min: 0, max: 5, step: 0.05 },
      }),
      Cell: folder({
        waterScale: { value: OCEAN_DEFAULTS.waterScale, min: 0.01, max: 1, step: 0.01 },
        cellSmoothness: { value: OCEAN_DEFAULTS.cellSmoothness, min: 0, max: 1, step: 0.01 },
        edgeThreshold: { value: OCEAN_DEFAULTS.edgeThreshold, min: 0, max: 0.5, step: 0.005 },
        edgeSoftness: { value: OCEAN_DEFAULTS.edgeSoftness, min: 0, max: 0.3, step: 0.005 },
        cellSpeed: { value: OCEAN_DEFAULTS.cellSpeed, min: 0, max: 3, step: 0.05 },
      }),
      Flow: folder({
        flowX: { value: OCEAN_DEFAULTS.flowX, min: -1, max: 1, step: 0.01 },
        flowZ: { value: OCEAN_DEFAULTS.flowZ, min: -1, max: 1, step: 0.01 },
        noiseScale: { value: OCEAN_DEFAULTS.noiseScale, min: 0.1, max: 5, step: 0.01 },
        noiseFlowSpeed: { value: OCEAN_DEFAULTS.noiseFlowSpeed, min: 0, max: 2, step: 0.01 },
        distortAmount: { value: OCEAN_DEFAULTS.distortAmount, min: 0, max: 1, step: 0.01 },
      }),
      Color: folder({
        deepColor: { value: OCEAN_DEFAULTS.deepColor },
        midColor: { value: OCEAN_DEFAULTS.midColor },
        midPos: { value: OCEAN_DEFAULTS.midPos, min: 0, max: 1, step: 0.01 },
        highlightColor: { value: OCEAN_DEFAULTS.highlightColor },
        opacity: { value: OCEAN_DEFAULTS.opacity, min: 0, max: 1, step: 0.01 },
        deepOpacity: { value: OCEAN_DEFAULTS.deepOpacity, min: 0, max: 1, step: 0.01 },
      }),
      Fresnel: folder({
        fresnelPower: { value: OCEAN_DEFAULTS.fresnelPower, min: 0, max: 10, step: 0.1 },
        fresnelStrength: { value: OCEAN_DEFAULTS.fresnelStrength, min: 0, max: 1, step: 0.01 },
      }),
      foamAmount: { value: OCEAN_DEFAULTS.foamAmount, min: 0, max: 1, step: 0.01 },
      Specular: folder({
        specularStrength: { value: OCEAN_DEFAULTS.specularStrength, min: 0, max: 1, step: 0.01 },
        specularPower: { value: OCEAN_DEFAULTS.specularPower, min: 1, max: 64, step: 0.5 },
      }),
      crestStrength: { value: OCEAN_DEFAULTS.crestStrength, min: 0, max: 1, step: 0.01 },
      Light: folder({
        sunX: { value: OCEAN_DEFAULTS.sunX, min: -20, max: 20, step: 0.5, label: 'sun X' },
        sunY: { value: OCEAN_DEFAULTS.sunY, min: 0, max: 20, step: 0.5, label: 'sun Y' },
        sunZ: { value: OCEAN_DEFAULTS.sunZ, min: -20, max: 20, step: 0.5, label: 'sun Z' },
      }),
    },
    { collapsed: true }
  ) as OceanControls
}
