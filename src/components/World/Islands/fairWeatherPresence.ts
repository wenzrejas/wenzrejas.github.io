import { isRaining } from '../../../store/weatherStore'
import { MAX_DT } from '../../../utils/time'

export interface FairWeatherPresence {
  level: number
  dryness: number
}

export const createFairWeatherPresence = (): FairWeatherPresence => ({ level: 0, dryness: 1 })

export function advanceFairWeatherPresence(
  presence: FairWeatherPresence,
  scheduled: number,
  delta: number,
  presenceRate: number,
  rainRate: number
): number {
  const dt = Math.min(delta, MAX_DT)
  const dry = isRaining() ? 0 : 1
  presence.dryness += (dry - presence.dryness) * Math.min(1, rainRate * dt)

  const target = scheduled * presence.dryness
  presence.level += (target - presence.level) * Math.min(1, presenceRate * dt)
  return presence.level
}
