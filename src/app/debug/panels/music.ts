import { button, levaStore, useControls } from 'leva'
import { MUSIC_TRACKS, type MusicTrack } from '@/audio/sounds'
import { useDebugStore } from '@/store/debugStore'
import type { MusicControls } from '../types'

const TRACK_PATH = 'Music.track'
const TRACKS = Object.values(MUSIC_TRACKS)
const DEFAULTS = useDebugStore.getInitialState().music

function stepTrack(current: MusicTrack, step: number): void {
  const index = (TRACKS.indexOf(current) + step + TRACKS.length) % TRACKS.length
  levaStore.setValueAtPath(TRACK_PATH, TRACKS[index], true)
}

export function useMusicControls() {
  return useControls(
    'Music',
    {
      enabled: { value: DEFAULTS.enabled, label: 'on' },
      track: { value: DEFAULTS.track, options: MUSIC_TRACKS, label: 'track' },
      previous: button((get) => stepTrack(get(TRACK_PATH), -1)),
      next: button((get) => stepTrack(get(TRACK_PATH), 1)),
    },
    { collapsed: true }
  ) as MusicControls
}
