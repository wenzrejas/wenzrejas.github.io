import { alphaMaskUrl } from '../procedural/alphaMask'
import { SPLASH_PIXELS } from './constants'
import { splashAlphas } from './splash'

let masks: string[] | null = null

export function cacheSplashMasks(alphas: Uint8ClampedArray[]) {
  masks ??= alphas.map((alpha) => alphaMaskUrl(alpha, SPLASH_PIXELS, SPLASH_PIXELS))
  return masks
}

export const splashMasks = () => masks ?? cacheSplashMasks(splashAlphas())
