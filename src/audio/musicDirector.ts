import type { IslandKey } from '../world/islands/shared/constants'
import { ISLAND_ZONES, shoreGap } from '../world/islands/shared/islandZones'
import { useCycleStore } from '../store/cycleStore'
import { useDebugStore } from '../store/debugStore'
import { useRevealStore } from '../store/revealStore'
import { useShipStore } from '../store/shipStore'
import { isInDepths } from '../store/viewStore'
import { isRaining } from '../store/weatherStore'
import { audio } from './audioManager'
import {
  CHANNEL_VOLUMES,
  DEPTHS_MUSIC,
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

function islandInRange(currentIsland: IslandKey | null): IslandKey | null {
  const revealing = useRevealStore.getState().activeKey
  if (revealing && ISLAND_TUNES[revealing]) return revealing

  const ship = useShipStore.getState()
  let nearest: IslandKey | null = null
  let nearestGap = Infinity

  for (const zone of ISLAND_ZONES) {
    if (!ISLAND_TUNES[zone.key]) continue
    const gap = shoreGap(zone, ship.x, ship.z)
    const range = zone.key === currentIsland ? ISLAND_MUSIC_RELEASE : ISLAND_MUSIC_RANGE
    if (gap < range && gap < nearestGap) {
      nearest = zone.key
      nearestGap = gap
    }
  }
  return nearest
}

function chooseMusic(currentIsland: IslandKey | null) {
  const { track } = useDebugStore.getState().music
  const raining = isRaining()
  const { timeOfDay } = useCycleStore.getState()
  const night = timeOfDay >= NIGHT_MUSIC_FROM || timeOfDay < NIGHT_MUSIC_UNTIL
  const island = islandInRange(currentIsland)
  const islandTune = island ? ISLAND_TUNES[island] : undefined

  if (isInDepths()) return { island, track: DEPTHS_MUSIC, context: 'depths' }

  return {
    island,
    track: raining ? RAIN_MUSIC : night ? NIGHT_MUSIC : (islandTune ?? track),
    context: raining ? 'rain' : night ? 'night' : (island ?? 'open water'),
  }
}

export const openingMusic = () => chooseMusic(null).track

export function createMusicDirector() {
  let island: IslandKey | null = null
  let previousContext = ''
  let soundOn: boolean | null = null

  return {
    update() {
      const { enabled } = useDebugStore.getState().music
      const choice = chooseMusic(island)
      island = choice.island

      const crossfade =
        choice.context === previousContext ? MUSIC_CROSSFADE : WEATHER_MUSIC_CROSSFADE
      previousContext = choice.context

      if (enabled !== soundOn) {
        soundOn = enabled
        for (const channel of ['sfx', 'ambience'] as const) {
          audio.setChannelVolume(channel, enabled ? CHANNEL_VOLUMES[channel] : 0)
        }
      }

      if (!enabled) audio.stopMusic()
      else audio.playMusic(choice.track, crossfade)
    },
  }
}
