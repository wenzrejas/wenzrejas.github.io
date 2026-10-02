import { useControls } from 'leva'
import { useDebugStore } from '@/store/debugStore'
import type { DayCycleControls } from '../types'
import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'

const DEFAULTS = useDebugStore.getInitialState().dayCycle

export function useDayCycleControls() {
  return useControls(
    'Day / Night',
    {
      cycleSpeed: {
        value: DEFAULTS.cycleSpeed,
        min: 0,
        max: 10,
        step: 0.1,
        label: 'speed (0 = pause)',
      },
      timeOfDay: {
        value: DEFAULTS.timeOfDay,
        options: ['auto', ...Object.keys(PHASES)],
        label: 'jump to (holds)',
      },
    },
    { collapsed: true }
  ) as DayCycleControls
}
