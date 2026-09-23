import type { IslandKey } from '../components/World/Islands/constants'
import { ISLAND_ZONES, shoreGap } from '../components/World/Islands/islandZones'
import { useCycleStore } from '../store/cycleStore'
import { useDebugStore } from '../store/debugStore'
import { useRevealStore } from '../store/revealStore'
import { useShipStore } from '../store/shipStore'
import { isRaining } from '../store/weatherStore'
import { audio } from './audioManager'
import {
  CHANNEL_VOLUMES,
  ISLAND_MUSIC_RANGE,
  ISLAND_MUSIC_RELEASE,
  MUSIC_CROSSFADE,
  NIGHT_MUSIC,
  NIGHT_MUSIC_FROM,
  NIGHT_MUSIC_UNTIL,
  RAIN_MUSIC,
  WEATHER_MUSIC_CROSSFADE,
} from './constants'
import { ISLAND_TUNES } from './sounds'

export function createMusicDirector() {
  let island: IslandKey | null = null
  let previousContext = ''
  let soundOn: boolean | null = null

  const islandInRange = (): IslandKey | null => {
    const revealing = useRevealStore.getState().activeKey
    if (revealing && ISLAND_TUNES[revealing]) return revealing

    const ship = useShipStore.getState()
    let nearest: IslandKey | null = null
    let nearestGap = Infinity

    for (const zone of ISLAND_ZONES) {
      if (!ISLAND_TUNES[zone.key]) continue
      const gap = shoreGap(zone, ship.x, ship.z)
      const range = zone.key === island ? ISLAND_MUSIC_RELEASE : ISLAND_MUSIC_RANGE
      if (gap < range && gap < nearestGap) {
        nearest = zone.key
        nearestGap = gap
      }
    }
    return nearest
  }

  return {
    update() {
      const { enabled, track } = useDebugStore.getState().music
      const raining = isRaining()
      const { timeOfDay } = useCycleStore.getState()
      const night = timeOfDay >= NIGHT_MUSIC_FROM || timeOfDay < NIGHT_MUSIC_UNTIL
      island = islandInRange()

      const islandTune = island ? ISLAND_TUNES[island] : undefined
      const selected = raining ? RAIN_MUSIC : night ? NIGHT_MUSIC : (islandTune ?? track)

      const context = raining ? 'rain' : night ? 'night' : (island ?? 'open water')
      const crossfade = context === previousContext ? MUSIC_CROSSFADE : WEATHER_MUSIC_CROSSFADE
      previousContext = context

      if (enabled !== soundOn) {
        soundOn = enabled
        for (const channel of ['sfx', 'ambience'] as const) {
          audio.setChannelVolume(channel, enabled ? CHANNEL_VOLUMES[channel] : 0)
        }
      }

      if (!enabled) audio.stopMusic()
      else audio.playMusic(selected, crossfade)
    },
  }
}
