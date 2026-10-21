import * as THREE from 'three'
import GLOW_POINT_FRAG from '@/shaders/glowPoint.frag.glsl'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import type { SwarmBuffers } from './beeFlight'
import {
  BEE_BODY_COLOR,
  BEE_COUNT,
  BEE_FLAP_RATE,
  BEE_STRIPE_COLOR,
  BEE_TRAIL_COLOR,
  BEE_TRAIL_DOTS,
  BEE_TRAIL_STRENGTH,
  BEE_WING_COLOR,
} from './constants'
import BEE_VERT from './shaders/bee.vert.glsl'
import BEE_FRAG from './shaders/bee.frag.glsl'
import BEE_TRAIL_VERT from './shaders/beeTrail.vert.glsl'

const dynamicAttribute = (values: Float32Array, size: number) =>
  new THREE.BufferAttribute(values, size).setUsage(THREE.DynamicDrawUsage)

export function buildSwarmGeometries() {
  const buffers: SwarmBuffers = {
    bees: new Float32Array(BEE_COUNT * 3),
    previous: new Float32Array(BEE_COUNT * 3),
    beeFades: new Float32Array(BEE_COUNT),
    trail: new Float32Array(BEE_COUNT * BEE_TRAIL_DOTS * 3),
    trailFades: new Float32Array(BEE_COUNT * BEE_TRAIL_DOTS),
  }

  const bees = new THREE.BufferGeometry()
  bees.setAttribute('position', dynamicAttribute(buffers.bees, 3))
  bees.setAttribute('aPrevious', dynamicAttribute(buffers.previous, 3))
  bees.setAttribute('aFade', dynamicAttribute(buffers.beeFades, 1))
  bees.setAttribute(
    'aSeed',
    new THREE.BufferAttribute(
      Float32Array.from({ length: BEE_COUNT }, () => Math.random()),
      1
    )
  )

  const trail = new THREE.BufferGeometry()
  trail.setAttribute('position', dynamicAttribute(buffers.trail, 3))
  trail.setAttribute('aFade', dynamicAttribute(buffers.trailFades, 1))
  return { bees, trail, buffers }
}

export function markSwarmChanged(bees: THREE.BufferGeometry, trail: THREE.BufferGeometry): void {
  for (const name of ['position', 'aPrevious', 'aFade']) bees.getAttribute(name).needsUpdate = true
  for (const name of ['position', 'aFade']) trail.getAttribute(name).needsUpdate = true
}

export const createBeeMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: BEE_VERT,
    fragmentShader: BEE_FRAG,
    defines: floatDefines({ FLAP_RATE: BEE_FLAP_RATE }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uBodyColor: { value: displayColorOf(BEE_BODY_COLOR) },
      uStripeColor: { value: displayColorOf(BEE_STRIPE_COLOR) },
      uWingColor: { value: displayColorOf(BEE_WING_COLOR) },
    },
  })

export const createBeeTrailMaterial = () =>
  createAdditiveGlowMaterial(
    BEE_TRAIL_VERT,
    GLOW_POINT_FRAG,
    { STRENGTH: BEE_TRAIL_STRENGTH },
    { uSize: { value: 1 }, uColor: { value: displayColorOf(BEE_TRAIL_COLOR) } }
  )
