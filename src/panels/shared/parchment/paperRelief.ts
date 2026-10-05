import { seededRandom, type Random } from '@/utils/random'
import { addNoiseOctaves, noiseGrid, type NoiseGrid } from '../procedural/valueNoise'
import { RELIEF_GRAIN, RELIEF_OCTAVES, RELIEF_SEED, RELIEF_TILE_PIXELS } from './constants'

export function greyShades({ values }: NoiseGrid, grain: number, random: Random) {
  const shades = new Uint8ClampedArray(values.length * 4)
  for (let i = 0; i < values.length; i++) {
    const shade = (values[i] + (random() - 0.5) * grain) * 255
    shades[i * 4] = shade
    shades[i * 4 + 1] = shade
    shades[i * 4 + 2] = shade
    shades[i * 4 + 3] = 255
  }
  return shades
}

export const reliefTileSize = (pixelRatio: number) => Math.round(RELIEF_TILE_PIXELS * pixelRatio)

export function reliefShades(pixelRatio: number) {
  const size = reliefTileSize(pixelRatio)
  const random = seededRandom(RELIEF_SEED)
  const grid = noiseGrid(size, size)
  addNoiseOctaves(grid, RELIEF_OCTAVES, random, RELIEF_TILE_PIXELS, RELIEF_TILE_PIXELS)
  return greyShades(grid, RELIEF_GRAIN, random)
}
