import { spoilsNightEvent, type NightEventKind } from '@/store/nightEventStore'
import type { WeatherState } from '@/store/weatherStore'
import { JELLYFISH_BLOOM_SHARE, LANTERN_NIGHT_SHARE } from './constants'

export function chooseNightEvent(random: () => number): NightEventKind {
  const roll = random()
  if (roll < LANTERN_NIGHT_SHARE) return 'lanterns'
  if (roll < LANTERN_NIGHT_SHARE + JELLYFISH_BLOOM_SHARE) return 'jellyfish'
  return 'none'
}

export const canHoldNightEvent = ({
  type,
  comingType,
}: Pick<WeatherState, 'type' | 'comingType'>) =>
  !spoilsNightEvent(type) && !spoilsNightEvent(comingType)
