import { useEffect } from 'react'
import { audio } from './audioManager'
import { AMBIENCE_FADE_IN, DEFAULT_FADE, WEATHER_POLL_MILLISECONDS } from './constants'
import { createCricketSounds } from './cricketSounds'
import { createMusicDirector } from './musicDirector'
import { CHANNELS } from './sounds'
import { createWeatherSounds } from './weatherSounds'
import { useDebugStore } from '@/store/debugStore'
import { useHudStore } from '@/store/hudStore'
import { useLoadingStore } from '@/store/loadingStore'
import { useSettingsStore, type Settings } from '@/store/settingsStore'
import { isBelowSurface, useViewStore } from '@/store/viewStore'

const CLICK_TARGETS = 'button, a[href]'

function applyVolumes({ volumes }: Settings) {
  for (const channel of CHANNELS) audio.setVisitorVolume(channel, volumes[channel])
}

function playClick({ target }: MouseEvent) {
  if (target instanceof Element && target.closest(CLICK_TARGETS)) audio.play('click')
}

export default function Soundscape() {
  const hasSetSail = useLoadingStore((state) => state.hasSetSail)
  const isUnderwater = useViewStore(isBelowSurface)

  useEffect(() => {
    audio.install()
    audio.setMuted(true)
    applyVolumes(useSettingsStore.getState())
    return useSettingsStore.subscribe((state, previous) => {
      if (state.volumes !== previous.volumes) applyVolumes(state)
    })
  }, [])

  useEffect(() => {
    document.addEventListener('click', playClick)
    return () => document.removeEventListener('click', playClick)
  }, [])

  useEffect(() => {
    if (!hasSetSail) return
    audio.setMuted(!useHudStore.getState().isSoundOn)
    const music = createMusicDirector()
    music.update()

    const musicTimer = window.setInterval(() => music.update(), WEATHER_POLL_MILLISECONDS)

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
  }, [hasSetSail])

  useEffect(() => {
    if (!hasSetSail || isUnderwater) return
    const waves = audio.play('oceanWaves', { loop: true, fadeIn: AMBIENCE_FADE_IN })
    const weatherSounds = createWeatherSounds()
    const cricketSounds = createCricketSounds()
    const ambienceTimer = window.setInterval(() => {
      weatherSounds.update()
      cricketSounds.update()
    }, WEATHER_POLL_MILLISECONDS)

    return () => {
      window.clearInterval(ambienceTimer)
      weatherSounds.dispose()
      cricketSounds.dispose()
      waves.stop(DEFAULT_FADE)
    }
  }, [hasSetSail, isUnderwater])

  return null
}
