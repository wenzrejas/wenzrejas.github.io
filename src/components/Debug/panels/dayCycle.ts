import { useControls } from 'leva'
import type { DayCycleControls } from '../types'
import { PHASES } from '../../World/DayNightCycle/dayNightKeyframes'

export function useDayCycleControls() {
  return useControls(
    'Day / Night',
    {
      cycleSpeed: { value: 1, min: 0, max: 10, step: 0.1, label: 'speed (0 = pause)' },
      timeOfDay: {
        value: 'auto',
        options: ['auto', ...Object.keys(PHASES)],
        label: 'jump to (holds)',
      },
    },
    { collapsed: true }
  ) as DayCycleControls
}
