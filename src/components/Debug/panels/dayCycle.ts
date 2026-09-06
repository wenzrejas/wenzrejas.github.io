import { useControls } from 'leva'
import type { DayCycleControls } from '../types'

export function useDayCycleControls() {
  return useControls(
    'Day / Night',
    {
      cycleSpeed: { value: 1, min: 0, max: 10, step: 0.1, label: 'speed (0 = pause)' },
    },
    { collapsed: true }
  ) as DayCycleControls
}
