import * as THREE from 'three'
import {
  createProximityLoop,
  holdLoopAt,
  nearnessOf,
  type ProximityLoop,
} from '@/audio/proximityLoop'
import {
  WATERFALL_SOUND_FADE_SECONDS,
  WATERFALL_SOUND_FULL_DISTANCE,
  WATERFALL_SOUND_LEVEL_STEP,
  WATERFALL_SOUND_RAMP_SECONDS,
  WATERFALL_SOUND_SILENT_DISTANCE,
} from './constants'
import type { SplashSite } from './waterfallSplash'

export const createWaterfallSound = () =>
  createProximityLoop('waterfall', {
    rampSeconds: WATERFALL_SOUND_RAMP_SECONDS,
    fadeSeconds: WATERFALL_SOUND_FADE_SECONDS,
    levelStep: WATERFALL_SOUND_LEVEL_STEP,
  })

const _fall = new THREE.Vector3()

function nearestFallDistance(sites: SplashSite[], toWorld: THREE.Matrix4, x: number, z: number) {
  let nearest = Infinity
  for (const site of sites) {
    _fall.set(site.x, site.y, site.z).applyMatrix4(toWorld)
    nearest = Math.min(nearest, Math.hypot(_fall.x - x, _fall.z - z))
  }
  return nearest
}

export function followWaterfallSound(
  sound: ProximityLoop,
  sites: SplashSite[],
  toWorld: THREE.Matrix4,
  shipX: number,
  shipZ: number,
  isAudible: boolean
) {
  const distance = nearestFallDistance(sites, toWorld, shipX, shipZ)
  const nearness = nearnessOf(
    distance,
    WATERFALL_SOUND_FULL_DISTANCE,
    WATERFALL_SOUND_SILENT_DISTANCE
  )
  holdLoopAt(sound, isAudible ? nearness : 0)
}
