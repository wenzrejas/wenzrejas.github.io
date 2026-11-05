import { SILENCE_THRESHOLD } from './constants'

interface AudibleRange {
  start: number
  end: number
}

const knownRanges = new WeakMap<AudioBuffer, AudibleRange>()

export function audibleRangeOf(buffer: AudioBuffer): AudibleRange {
  const known = knownRanges.get(buffer)
  if (known) return known

  const samples = buffer.getChannelData(0)
  let first = 0
  while (first < samples.length && Math.abs(samples[first]) < SILENCE_THRESHOLD) first++
  let last = samples.length - 1
  while (last > first && Math.abs(samples[last]) < SILENCE_THRESHOLD) last--

  const range = { start: first / buffer.sampleRate, end: (last + 1) / buffer.sampleRate }
  knownRanges.set(buffer, range)
  return range
}
