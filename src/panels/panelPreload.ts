import { decodeImage } from '@/utils/image'
import { PANEL_SPECS } from './panelSpecs'
import type { PanelTextures } from './panelTextureWorker'
import { CLOSE_BUTTON_URL } from './shared/close-button/constants'
import { cacheMistMasks } from './shared/island-panel/mistModel'
import { cacheReliefTile } from './shared/parchment/paperTexture'
import { parchmentPixelRatio } from './shared/parchment/parchmentModel'
import { cacheSplashMasks } from './shared/splash/splashModel'
import { TOOL_LOGO_SPRITE_URL } from './toolkit/constants'

const PANEL_IMAGES = [
  ...new Set([
    ...Object.values(PANEL_SPECS).flatMap(({ splashUrl }) => (splashUrl ? [splashUrl] : [])),
    TOOL_LOGO_SPRITE_URL,
    CLOSE_BUTTON_URL,
  ]),
]

let preloading: Promise<void> | null = null

function cacheTextures({ pixelRatio, mist, splashes, relief }: PanelTextures) {
  cacheMistMasks(mist)
  cacheSplashMasks(splashes)
  cacheReliefTile(pixelRatio, relief)
}

function generateTextures(pixelRatio: number) {
  const worker = new Worker(new URL('./panelTextureWorker.ts', import.meta.url), {
    type: 'module',
  })
  const textures = new Promise<PanelTextures>((resolve, reject) => {
    worker.onmessage = ({ data }: MessageEvent<PanelTextures>) => resolve(data)
    worker.onerror = reject
  })
  worker.postMessage(pixelRatio)
  return textures.then(cacheTextures).finally(() => worker.terminate())
}

async function preload() {
  await Promise.allSettled([
    ...PANEL_IMAGES.map(decodeImage),
    generateTextures(parchmentPixelRatio()),
  ])
}

export const preloadPanels = () => (preloading ??= preload())
