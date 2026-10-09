import * as THREE from 'three'
import UV_QUAD_VERT from '@/shaders/uvQuad.vert.glsl'
import { rand } from '@/utils/math'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import {
  RING_CORE_WHITENESS,
  RING_COUNTER_SHARE,
  RING_GLOW_STRENGTH,
  RING_GLOW_WIDTH,
  RING_INNER_RADIUS,
  RING_LAYER_FADE,
  RING_LAYER_RISE,
  RING_LAYER_SHRINK,
  RING_LIFT,
  RING_LINE_FLOOR,
  RING_LINE_WIDTH,
  RING_OUTER_RADIUS,
  RING_OUTER_STRENGTH,
  RING_REACH,
  RING_SPARKLE_COUNT,
  RING_SPARKLE_DRIFT,
  RING_SPARKLE_RAY_WIDTH,
  RING_SPARKLE_SIZE,
  RING_SPARKLE_TWINKLE_RATE,
  RING_START_SCALE,
  RING_STRENGTH,
  RING_SWEEP_RATE,
  RING_SWEEP_SHARPNESS,
} from './constants'
import { layerDirection } from './orbits'
import LIGHT_RING_FRAG from './shaders/lightRing.frag.glsl'

export const ringLayerLift = (layer: number) => RING_LIFT + layer * RING_LAYER_RISE

export const ringLayerSize = (radius: number, layer: number) =>
  radius * RING_REACH * 2 * (1 - layer * RING_LAYER_SHRINK)

export const createLightRingMaterial = (color: THREE.Color, layer: number) =>
  createAdditiveGlowMaterial(
    UV_QUAD_VERT,
    LIGHT_RING_FRAG,
    {
      REACH: RING_REACH,
      INNER_RADIUS: RING_INNER_RADIUS,
      OUTER_RADIUS: RING_OUTER_RADIUS,
      START_SCALE: RING_START_SCALE,
      LINE_WIDTH: RING_LINE_WIDTH,
      LINE_FLOOR: RING_LINE_FLOOR,
      GLOW_WIDTH: RING_GLOW_WIDTH,
      GLOW_STRENGTH: RING_GLOW_STRENGTH,
      OUTER_STRENGTH: RING_OUTER_STRENGTH,
      SWEEP_RATE: RING_SWEEP_RATE,
      SWEEP_SHARPNESS: RING_SWEEP_SHARPNESS,
      COUNTER_SHARE: RING_COUNTER_SHARE,
      SPARKLE_COUNT: RING_SPARKLE_COUNT,
      SPARKLE_SIZE: RING_SPARKLE_SIZE,
      SPARKLE_DRIFT: RING_SPARKLE_DRIFT,
      SPARKLE_TWINKLE_RATE: RING_SPARKLE_TWINKLE_RATE,
      RAY_WIDTH: RING_SPARKLE_RAY_WIDTH,
      CORE_WHITENESS: RING_CORE_WHITENESS,
      STRENGTH: RING_STRENGTH,
    },
    {
      uColor: { value: color },
      uStrength: { value: RING_LAYER_FADE ** layer },
      uDirection: { value: layerDirection(layer) },
      uPhase: { value: rand(0, Math.PI * 2) },
      uTime: { value: 0 },
      uReveal: { value: 0 },
    }
  )
