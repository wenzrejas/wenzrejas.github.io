import { eventDelta } from '@/store/cinematicStore'
import type { WeatherState } from '@/store/weatherStore'
import { rand } from '@/utils/math'
import {
  LIGHTNING_DELAY_MAX,
  LIGHTNING_DELAY_MIN,
  LIGHTNING_ECHO_CHANCE,
  LIGHTNING_ECHO_FADE,
  LIGHTNING_ECHO_FLASH,
  LIGHTNING_ECHO_SECONDS,
  LIGHTNING_FIRST_DELAY_MAX,
  LIGHTNING_FIRST_DELAY_MIN,
  LIGHTNING_GAP_SECONDS,
  LIGHTNING_STRIKE_FADE,
  LIGHTNING_STRIKE_SECONDS,
} from './constants'

type FlashPhase = 'idle' | 'strike' | 'gap' | 'echo'

export interface Lightning {
  untilNext: number
  phase: FlashPhase
  elapsed: number
}

export const createLightning = (): Lightning => ({
  untilNext: rand(LIGHTNING_FIRST_DELAY_MIN, LIGHTNING_FIRST_DELAY_MAX),
  phase: 'idle',
  elapsed: 0,
})

function rest(lightning: Lightning) {
  lightning.phase = 'idle'
  lightning.untilNext = rand(LIGHTNING_DELAY_MIN, LIGHTNING_DELAY_MAX)
}

export function advanceLightning(lightning: Lightning, weather: WeatherState, dt: number) {
  if (weather.type !== 'rainy') {
    weather.lightningFlash = 0
    lightning.phase = 'idle'
    return
  }

  lightning.untilNext -= eventDelta(dt)

  if (lightning.phase === 'idle') {
    if (lightning.untilNext > 0) return
    lightning.phase = 'strike'
    lightning.elapsed = 0
    weather.lightningFlash = 1
    weather.lightningStrikes += 1
    return
  }

  lightning.elapsed += dt

  if (lightning.phase === 'strike') {
    weather.lightningFlash = Math.max(0, 1 - lightning.elapsed * LIGHTNING_STRIKE_FADE)
    if (lightning.elapsed <= LIGHTNING_STRIKE_SECONDS) return
    lightning.elapsed = 0
    if (Math.random() < LIGHTNING_ECHO_CHANCE) lightning.phase = 'gap'
    else rest(lightning)
  } else if (lightning.phase === 'gap') {
    weather.lightningFlash = 0
    if (lightning.elapsed <= LIGHTNING_GAP_SECONDS) return
    lightning.phase = 'echo'
    lightning.elapsed = 0
    weather.lightningFlash = LIGHTNING_ECHO_FLASH
  } else {
    weather.lightningFlash = Math.max(
      0,
      LIGHTNING_ECHO_FLASH - lightning.elapsed * LIGHTNING_ECHO_FADE
    )
    if (lightning.elapsed > LIGHTNING_ECHO_SECONDS) rest(lightning)
  }
}
