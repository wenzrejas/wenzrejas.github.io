import * as THREE from 'three'
import { createAdditiveGlowMaterial } from '../GroundGlow/groundGlowModel'
import type { GlowSite } from '../GroundGlow/glowSites'
import {
  RISING_GLOW_FALLOFF,
  RISING_GLOW_FLOW_DENSITY,
  RISING_GLOW_FLOW_DEPTH,
  RISING_GLOW_FLOW_SPEED,
  RISING_GLOW_HEIGHT,
  RISING_GLOW_SEGMENTS,
  RISING_GLOW_SPREAD,
  RISING_GLOW_STRENGTH,
} from './constants'
import RISING_GLOW_VERT from './shaders/risingGlow.vert.glsl'
import RISING_GLOW_FRAG from './shaders/risingGlow.frag.glsl'

export function buildRisingGlowGeometry({ radius }: GlowSite): THREE.BufferGeometry {
  const wallRadius = radius * RISING_GLOW_SPREAD
  const geometry = new THREE.CylinderGeometry(
    wallRadius,
    wallRadius,
    RISING_GLOW_HEIGHT,
    RISING_GLOW_SEGMENTS,
    1,
    true
  )
  geometry.translate(0, RISING_GLOW_HEIGHT / 2, 0)
  return geometry
}

export function createRisingGlowMaterial({ color }: GlowSite): THREE.ShaderMaterial {
  const material = createAdditiveGlowMaterial(
    RISING_GLOW_VERT,
    RISING_GLOW_FRAG,
    {
      STRENGTH: RISING_GLOW_STRENGTH,
      FALLOFF: RISING_GLOW_FALLOFF,
      FLOW_DENSITY: RISING_GLOW_FLOW_DENSITY,
      FLOW_SPEED: RISING_GLOW_FLOW_SPEED,
      FLOW_DEPTH: RISING_GLOW_FLOW_DEPTH,
    },
    { uColor: { value: color }, uTime: { value: 0 } }
  )
  material.side = THREE.DoubleSide
  return material
}
