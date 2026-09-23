import { useControls } from 'leva'
import {
  SPAWN_DELAY_MAX as BIRD_DELAY_MAX,
  SPAWN_DELAY_MIN as BIRD_DELAY_MIN,
} from '../../World/Birds/constants'
import {
  SPAWN_DELAY_MAX as FISH_DELAY_MAX,
  SPAWN_DELAY_MIN as FISH_DELAY_MIN,
} from '../../World/Fish/constants'
import {
  CHECK_INTERVAL as DOLPHIN_INTERVAL,
  SPAWN_CHANCE as DOLPHIN_CHANCE,
} from '../../World/Dolphins/constants'
import {
  CHECK_INTERVAL as TURTLE_INTERVAL,
  SPAWN_CHANCE as TURTLE_CHANCE,
} from '../../World/Turtles/constants'
import {
  CHECK_INTERVAL as WHALE_INTERVAL,
  SPAWN_CHANCE as WHALE_CHANCE,
} from '../../World/Whale/constants'
import type { WildlifeControls } from '../types'

export function useWildlifeControls() {
  return useControls(
    'Wildlife',
    {
      birdDelayMin: { value: BIRD_DELAY_MIN, min: 1, max: 120, step: 1, label: 'birds min delay' },
      birdDelayMax: { value: BIRD_DELAY_MAX, min: 1, max: 120, step: 1, label: 'birds max delay' },
      fishDelayMin: {
        value: FISH_DELAY_MIN,
        min: 0.5,
        max: 60,
        step: 0.5,
        label: 'fish min delay',
      },
      fishDelayMax: {
        value: FISH_DELAY_MAX,
        min: 0.5,
        max: 60,
        step: 0.5,
        label: 'fish max delay',
      },
      dolphinChance: {
        value: DOLPHIN_CHANCE,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'dolphin chance',
      },
      dolphinInterval: {
        value: DOLPHIN_INTERVAL,
        min: 1,
        max: 60,
        step: 1,
        label: 'dolphin check (s)',
      },
      turtleChance: {
        value: TURTLE_CHANCE,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'turtle chance',
      },
      turtleInterval: {
        value: TURTLE_INTERVAL,
        min: 1,
        max: 60,
        step: 1,
        label: 'turtle check (s)',
      },
      whaleChance: {
        value: WHALE_CHANCE,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'whale chance',
      },
      whaleInterval: {
        value: WHALE_INTERVAL,
        min: 1,
        max: 60,
        step: 1,
        label: 'whale check (s)',
      },
    },
    { collapsed: true }
  ) as WildlifeControls
}
