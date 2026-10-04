import { mistAlphas, type MistAlphas } from './shared/island-panel/mist'
import { reliefShades } from './shared/parchment/paperRelief'
import { splashAlphas } from './shared/splash/splash'

export interface PanelTextures {
  pixelRatio: number
  mist: MistAlphas
  splashes: Uint8ClampedArray<ArrayBuffer>[]
  relief: Uint8ClampedArray<ArrayBuffer>
}

self.onmessage = ({ data: pixelRatio }: MessageEvent<number>) => {
  const textures: PanelTextures = {
    pixelRatio,
    mist: mistAlphas(),
    splashes: splashAlphas(),
    relief: reliefShades(pixelRatio),
  }
  const { mist, splashes, relief } = textures
  const transfer = [mist.top, mist.bottom, ...splashes, relief].map((pixels) => pixels.buffer)
  self.postMessage(textures, { transfer })
}
