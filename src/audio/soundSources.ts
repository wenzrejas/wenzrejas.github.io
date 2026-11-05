import type { SoundDefinition } from './sounds'

const MEDIA_TYPES: Record<string, string> = {
  webm: 'audio/webm; codecs="opus"',
  mp3: 'audio/mpeg',
}

let probe: HTMLAudioElement | null = null

function isPlayable(url: string): boolean {
  const type = MEDIA_TYPES[url.split('.').pop() ?? '']
  if (!type) return true
  probe ??= new Audio()
  return probe.canPlayType(type) !== ''
}

export const preferredSource = (definition: SoundDefinition): string =>
  definition.fallback && !isPlayable(definition.url) ? definition.fallback : definition.url

export async function downloadSource(url: string): Promise<void> {
  const response = await fetch(url)
  await response.arrayBuffer()
}

export function decodeSource(context: AudioContext, url: string): Promise<AudioBuffer> {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
}
