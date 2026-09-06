import { useControls, folder } from 'leva'
import { ISLAND_MODEL_DEFAULTS } from '../../World/Islands/constants'
import type { IslandControls } from '../types'

export function useIslandControls() {
  return useControls(
    'Island',
    {
      scale: { value: ISLAND_MODEL_DEFAULTS.scale, min: 0.1, max: 4, step: 0.05 },
      rotation: {
        value: ISLAND_MODEL_DEFAULTS.rotation,
        min: -180,
        max: 180,
        step: 1,
        label: 'rotation (deg)',
      },
      Position: folder({
        offsetX: {
          value: ISLAND_MODEL_DEFAULTS.offsetX,
          min: -150,
          max: 150,
          step: 0.5,
          label: 'X',
        },
        offsetY: { value: ISLAND_MODEL_DEFAULTS.offsetY, min: -60, max: 60, step: 0.1, label: 'Y' },
        offsetZ: {
          value: ISLAND_MODEL_DEFAULTS.offsetZ,
          min: -150,
          max: 150,
          step: 0.5,
          label: 'Z',
        },
      }),
      brightness: { value: ISLAND_MODEL_DEFAULTS.brightness, min: 0.2, max: 1.5, step: 0.01 },
    },
    { collapsed: true }
  ) as IslandControls
}
