import { BLOOM_SPOTTED_RISE } from './constants'

type JellyBrush = 'none' | 'clearing' | 'diving'

export interface Jelly {
  x: number
  z: number
  radius: number
  depth: number
  seed: number
  wakeAt: number
  rise: number
  brush: JellyBrush
  clearSeconds: number
  returnSeconds: number
}

export interface JellyPatch {
  x: number
  z: number
  radius: number
  lumpTurns: number[]
  size: number
  lastWake: number
  age: number
  isInView: boolean
  jellies: Jelly[]
}

export const bloom = {
  run: 0,
  checkSeconds: 0,
  patches: [] as JellyPatch[],
}

export const isInsideJellyPatch = (x: number, z: number) =>
  bloom.patches.some(
    ({ x: patchX, z: patchZ, radius, jellies }) =>
      Math.hypot(x - patchX, z - patchZ) < radius &&
      jellies.some(({ rise }) => rise >= BLOOM_SPOTTED_RISE)
  )
