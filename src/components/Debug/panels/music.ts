import { button, levaStore, useControls } from 'leva'
import { DEFAULT_MUSIC } from '../../../audio/constants'
import { MUSIC_TRACKS, type MusicTrack } from '../../../audio/sounds'
import type { MusicControls } from '../types'

const TRACK_PATH = 'Music.track'
const TRACKS = Object.values(MUSIC_TRACKS)

function stepTrack(current: MusicTrack, step: number): void {
  const index = (TRACKS.indexOf(current) + step + TRACKS.length) % TRACKS.length
  levaStore.setValueAtPath(TRACK_PATH, TRACKS[index], true)
}

export function useMusicControls() {
  return useControls(
    'Music',
    {
      enabled: { value: true, label: 'on' },
      track: { value: DEFAULT_MUSIC as MusicTrack, options: MUSIC_TRACKS, label: 'track' },
      previous: button((get) => stepTrack(get(TRACK_PATH), -1)),
      next: button((get) => stepTrack(get(TRACK_PATH), 1)),
    },
    { collapsed: true }
  ) as MusicControls
}
