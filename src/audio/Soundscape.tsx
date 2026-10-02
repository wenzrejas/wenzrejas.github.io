import { useEffect } from 'react'
import { audio } from './audioManager'
import { AMBIENCE_FADE_IN, DEFAULT_FADE, WEATHER_POLL_MS } from './constants'
import { createMusicDirector } from './musicDirector'
import { createWeatherSounds } from './weatherSounds'
import { useDebugStore } from '../store/debugStore'
import { useHudStore } from '../store/hudStore'

export default function Soundscape() {
  useEffect(() => {
    audio.install()
    const waves = audio.play('oceanWaves', { loop: true, fadeIn: AMBIENCE_FADE_IN })
    const weatherSounds = createWeatherSounds()
    const music = createMusicDirector()
    music.update()

    const weatherTimer = window.setInterval(() => {
      weatherSounds.update()
      music.update()
    }, WEATHER_POLL_MS)

    const unsubscribe = useDebugStore.subscribe((state, previous) => {
      const { enabled, track } = state.music
      if (enabled !== previous.music.enabled || track !== previous.music.track) music.update()
    })
    const unsubscribeMute = useHudStore.subscribe((state, previous) => {
      if (state.isSoundOn !== previous.isSoundOn) audio.setMuted(!state.isSoundOn)
    })

    return () => {
      unsubscribe()
      unsubscribeMute()
      window.clearInterval(weatherTimer)
      weatherSounds.dispose()
      waves.stop(DEFAULT_FADE)
      audio.stopMusic(DEFAULT_FADE)
    }
  }, [])

  return null
}
