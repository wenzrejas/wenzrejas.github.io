import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { floatDefines } from '@/utils/glsl'
import { whirlpoolFunnelUniforms } from '@/world/islands/timewell-depth/whirlpoolFunnel'
import {
  RAIN_RIPPLE_BOUNDS_RADIUS,
  RAIN_RIPPLE_LIFETIME,
  RAIN_RIPPLE_MAX,
  RAIN_RIPPLE_SEGMENTS,
  RAIN_RIPPLE_WHIRLPOOL_EYE_SHARE,
  RAIN_RIPPLE_WHIRLPOOL_SWALLOW_SHARE,
} from './constants'
import RIPPLE_FRAG from './shaders/rainRipple.frag.glsl'
import RIPPLE_VERT from './shaders/rainRipple.vert.glsl'

export function buildRainRippleGeometry() {
  const quad = new THREE.PlaneGeometry(2, 2, RAIN_RIPPLE_SEGMENTS, RAIN_RIPPLE_SEGMENTS).rotateX(
    -Math.PI / 2
  )
  const geometry = new THREE.InstancedBufferGeometry()
  geometry.setAttribute('position', quad.getAttribute('position'))
  geometry.setIndex(quad.getIndex())
  geometry.instanceCount = RAIN_RIPPLE_MAX
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), RAIN_RIPPLE_BOUNDS_RADIUS)
  geometry.setAttribute(
    'aProgress',
    new THREE.InstancedBufferAttribute(new Float32Array(RAIN_RIPPLE_MAX).fill(1), 1)
  )
  geometry.setAttribute(
    'aCenter',
    new THREE.InstancedBufferAttribute(new Float32Array(RAIN_RIPPLE_MAX * 2), 2)
  )
  return geometry
}

export const createRainRippleMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: RIPPLE_VERT,
    fragmentShader: RIPPLE_FRAG,
    defines: floatDefines({
      RIPPLE_LIFETIME: RAIN_RIPPLE_LIFETIME,
      WHIRLPOOL_EYE_SHARE: RAIN_RIPPLE_WHIRLPOOL_EYE_SHARE,
      WHIRLPOOL_SWALLOW_SHARE: RAIN_RIPPLE_WHIRLPOOL_SWALLOW_SHARE,
    }),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uIntensity: { value: 0 },
      uColor: { value: useCycleStore.getState().foamColor },
      ...whirlpoolFunnelUniforms,
      uWhirlpoolDrain: { value: 0 },
    },
  })
