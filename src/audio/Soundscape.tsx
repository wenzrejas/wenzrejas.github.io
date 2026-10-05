import { useEffect } from 'react'
import { audio } from './audioManager'
import { AMBIENCE_FADE_IN, DEFAULT_FADE, WEATHER_POLL_MS } from './constants'
import { createMusicDirector } from './musicDirector'
import { createWeatherSounds } from './weatherSounds'
import { useDebugStore } from '../store/debugStore'
import { useHudStore } from '../store/hudStore'
import { hasPendingTasks, useLoadingStore } from '../store/loadingStore'
import { isDepthsScene, useViewStore } from '../store/viewStore'

export default function Soundscape() {
  const isLoading = useLoadingStore(hasPendingTasks)
  const isInDepths = useViewStore(isDepthsScene)

  useEffect(() => {
    audio.install()
    audio.setMuted(true)
  }, [])

  useEffect(() => {
    if (isLoading) return
    audio.setMuted(!useHudStore.getState().isSoundOn)
    const music = createMusicDirector()
    music.update()

    const musicTimer = window.setInterval(() => music.update(), WEATHER_POLL_MS)

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
      window.clearInterval(musicTimer)
      audio.stopMusic(DEFAULT_FADE)
    }
  }, [isLoading])

  useEffect(() => {
    if (isLoading || isInDepths) return
    const waves = audio.play('oceanWaves', { loop: true, fadeIn: AMBIENCE_FADE_IN })
    const weatherSounds = createWeatherSounds()
    const weatherTimer = window.setInterval(() => weatherSounds.update(), WEATHER_POLL_MS)

    return () => {
      window.clearInterval(weatherTimer)
      weatherSounds.dispose()
      waves.stop(DEFAULT_FADE)
    }
  }, [isLoading, isInDepths])

  return null
}
