import { useWeatherStore } from '../store/weatherStore'
import { rand } from '../utils/math'
import { audio, type SoundHandle } from './audioManager'
import {
  DEFAULT_FADE,
  RAIN_CUTOFF,
  RAIN_FADE,
  RAIN_VOLUME_RAMP,
  THUNDER_DELAY_MAX,
  THUNDER_DELAY_MIN,
  THUNDER_PITCH_MAX,
  THUNDER_PITCH_MIN,
  THUNDER_VOLUME_MIN,
} from './constants'

export function createWeatherSounds() {
  let rain: SoundHandle | null = null
  let strikes = useWeatherStore.getState().lightningStrikes
  const thunderTimers = new Set<number>()

  const followRain = (intensity: number) => {
    if (intensity > RAIN_CUTOFF) {
      if (rain?.active) rain.setVolume(intensity, RAIN_VOLUME_RAMP)
      else if (audio.ready)
        rain = audio.play('rain', { loop: true, fadeIn: RAIN_FADE, volume: intensity })
    } else if (rain) {
      rain.stop(RAIN_FADE)
      rain = null
    }
  }

  const scheduleThunder = () => {
    const timer = window.setTimeout(
      () => {
        thunderTimers.delete(timer)
        audio.play('thunder', {
          volume: rand(THUNDER_VOLUME_MIN, 1),
          rate: rand(THUNDER_PITCH_MIN, THUNDER_PITCH_MAX),
        })
      },
      rand(THUNDER_DELAY_MIN, THUNDER_DELAY_MAX) * 1000
    )
    thunderTimers.add(timer)
  }

  return {
    update() {
      const weather = useWeatherStore.getState()
      followRain(weather.rainIntensity)
      if (weather.lightningStrikes !== strikes) {
        strikes = weather.lightningStrikes
        if (audio.ready) scheduleThunder()
      }
    },
    dispose() {
      for (const timer of thunderTimers) window.clearTimeout(timer)
      thunderTimers.clear()
      rain?.stop(DEFAULT_FADE)
    },
  }
}
