import { NOTE_LIFETIME } from './constants'

export interface Melody {
  seconds: number
  lastLaunchSeconds: number
}

export const createMelody = (): Melody => ({ seconds: 0, lastLaunchSeconds: -Infinity })

export const hasNotesInFlight = ({ seconds, lastLaunchSeconds }: Melody) =>
  seconds < lastLaunchSeconds + NOTE_LIFETIME

export function stepMelody(melody: Melody, isPlaying: boolean, dt: number) {
  if (isPlaying && !hasNotesInFlight(melody)) melody.seconds = 0
  melody.seconds += dt
  if (isPlaying) melody.lastLaunchSeconds = melody.seconds
}
