import { audio } from '@/audio/audioManager'
import { openingMusic } from '@/audio/musicDirector'
import type { SoundName } from '@/audio/sounds'
import { isRaining } from '@/store/weatherStore'

const LATIN_CAPITAL_A = 0x41

let preloading: Promise<void> | null = null

function coversLatin({ unicodeRange }: FontFace) {
  return unicodeRange.split(',').some((range) => {
    const [first, last = first] = range
      .trim()
      .replace('U+', '')
      .split('-')
      .map((hex) => parseInt(hex, 16))
    return first <= LATIN_CAPITAL_A && LATIN_CAPITAL_A <= last
  })
}

async function preloadFonts() {
  await document.fonts.ready
  await Promise.all([...document.fonts].filter(coversLatin).map((face) => face.load()))
}

const openingStreams = (): SoundName[] =>
  isRaining() ? [openingMusic(), 'rain'] : [openingMusic()]

async function preload() {
  audio.install()
  await Promise.allSettled([
    preloadFonts(),
    audio.preloadBuffers(),
    ...openingStreams().map((name) => audio.preload(name)),
  ])
}

export const preloadAssets = () => (preloading ??= preload())
