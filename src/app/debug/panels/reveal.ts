import { useControls } from 'leva'
import { useDebugStore } from '@/store/debugStore'
import type { RevealControls } from '../types'
import { WORLD_LOCATIONS } from '@/world/islands/shared/constants'

const DEFAULTS = useDebugStore.getInitialState().reveal

export function useRevealControls() {
  return useControls(
    'Island Reveal',
    {
      previewCard: {
        value: DEFAULTS.previewCard,
        options: ['off', ...Object.keys(WORLD_LOCATIONS)],
        label: 'pin title card',
      },
    },
    { collapsed: true }
  ) as RevealControls
}
