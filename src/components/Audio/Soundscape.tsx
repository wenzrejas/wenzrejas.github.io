import { useEffect } from 'react'
import { audio } from '../../audio/audioManager'
import { AMBIENCE_FADE_IN, DEFAULT_FADE, WEATHER_POLL_MS } from '../../audio/constants'
import { createMusicDirector } from '../../audio/musicDirector'
import { createWeatherSounds } from '../../audio/weatherSounds'
import { useDebugStore } from '../../store/debugStore'

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

    return () => {
      unsubscribe()
      window.clearInterval(weatherTimer)
      weatherSounds.dispose()
      waves.stop(DEFAULT_FADE)
      audio.stopMusic(DEFAULT_FADE)
    }
  }, [])

  return null
}
