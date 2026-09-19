import { useControls } from 'leva'
import type { RevealControls } from '../types'
import { WORLD_LOCATIONS } from '../../World/Islands/constants'

export function useRevealControls() {
  return useControls(
    'Island Reveal',
    {
      previewCard: {
        value: 'off',
        options: ['off', ...Object.keys(WORLD_LOCATIONS)],
        label: 'pin title card',
      },
    },
    { collapsed: true }
  ) as RevealControls
}
