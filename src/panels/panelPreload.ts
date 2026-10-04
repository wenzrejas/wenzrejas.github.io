import { PANEL_IMAGES } from './constants'
import type { PanelTextures } from './panelTextureWorker'
import { cacheMistMasks } from './shared/island-panel/mistModel'
import { cacheReliefTile } from './shared/parchment/paperTexture'
import { parchmentPixelRatio } from './shared/parchment/parchmentModel'
import { cacheSplashMasks } from './shared/splash/splashModel'

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

function decodeImage(url: string) {
  const image = new Image()
  image.src = url
  return image.decode()
}

async function preload() {
  await Promise.allSettled([
    ...PANEL_IMAGES.map(decodeImage),
    generateTextures(parchmentPixelRatio()),
  ])
}

export const preloadPanels = () => (preloading ??= preload())
