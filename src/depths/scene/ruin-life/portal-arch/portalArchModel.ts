import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { RING_GLOW_COLOR, RING_GLOW_REACH, RING_GLOW_WIDTH } from './constants'
import RING_GLOW_VERT from './shaders/ringGlow.vert.glsl'
import RING_GLOW_FRAG from './shaders/ringGlow.frag.glsl'

export function buildRingGlow(ringRadius: number) {
  const span = ringRadius * 2 * RING_GLOW_REACH
  return new THREE.PlaneGeometry(span, span).rotateX(-Math.PI / 2)
}

export const createRingGlowMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: RING_GLOW_VERT,
    fragmentShader: RING_GLOW_FRAG,
    defines: floatDefines({ REACH: RING_GLOW_REACH, WIDTH: RING_GLOW_WIDTH }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uStrength: { value: 0 },
      uColor: { value: displayColorOf(RING_GLOW_COLOR) },
    },
  })
