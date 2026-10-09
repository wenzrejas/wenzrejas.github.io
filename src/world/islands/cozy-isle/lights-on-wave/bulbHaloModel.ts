import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import type { Bulb } from '../cafeLights'
import {
  BULB_FLASH,
  BULB_FLASH_DECAY_SECONDS,
  BULB_HALO_COLOR,
  BULB_HALO_GROWTH,
  BULB_HALO_SIZE,
  BULB_HALO_STRENGTH,
  BULB_LIGHT_SECONDS,
} from './constants'
import BULB_HALO_VERT from './shaders/bulbHalo.vert.glsl'
import BULB_HALO_FRAG from './shaders/bulbHalo.frag.glsl'

export function buildBulbHaloGeometry(bulbs: Bulb[]): THREE.BufferGeometry {
  const positions = new Float32Array(bulbs.length * 3)
  const delays = new Float32Array(bulbs.length)
  bulbs.forEach(({ center, waveDelay }, i) => {
    positions.set([center.x, center.y, center.z], i * 3)
    delays[i] = waveDelay
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1))
  geometry.computeBoundingSphere()
  geometry.boundingSphere!.radius += BULB_HALO_SIZE * (1 + BULB_HALO_GROWTH)
  return geometry
}

export const createBulbHaloMaterial = () =>
  createAdditiveGlowMaterial(
    BULB_HALO_VERT,
    BULB_HALO_FRAG,
    {
      LIGHT_SECONDS: BULB_LIGHT_SECONDS,
      FLASH: BULB_FLASH,
      FLASH_DECAY_SECONDS: BULB_FLASH_DECAY_SECONDS,
      GROWTH: BULB_HALO_GROWTH,
      STRENGTH: BULB_HALO_STRENGTH,
    },
    {
      uSeconds: { value: 0 },
      uSize: { value: 1 },
      uColor: { value: displayColorOf(BULB_HALO_COLOR) },
    }
  )
