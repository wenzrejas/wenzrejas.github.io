import * as THREE from 'three'
import {
  SPARKLE_ARM_FALLOFF,
  SPARKLE_ARM_SHARPNESS,
  SPARKLE_COLOR,
  SPARKLE_COUNT,
  SPARKLE_GLOW_RADIUS,
  SPARKLE_Y,
} from './constants'
import { scatterAround, sparkleLife, sparkleSize } from './moonSparkles'
import SPARKLE_VERT from './shaders/sparkle.vert.glsl'
import SPARKLE_FRAG from './shaders/sparkle.frag.glsl'

export function buildSparkleGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array(SPARKLE_COUNT * 3)
  const lifetimes = new Float32Array(SPARKLE_COUNT)
  const maxLifetimes = new Float32Array(SPARKLE_COUNT)
  const sizes = new Float32Array(SPARKLE_COUNT)
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    positions[i * 3] = scatterAround(0)
    positions[i * 3 + 1] = SPARKLE_Y
    positions[i * 3 + 2] = scatterAround(0)
    lifetimes[i] = Math.random() * sparkleLife()
    maxLifetimes[i] = sparkleLife()
    sizes[i] = sparkleSize()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aLifetime', new THREE.BufferAttribute(lifetimes, 1))
  geometry.setAttribute('aMaxLifetime', new THREE.BufferAttribute(maxLifetimes, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
  return geometry
}

export const createSparkleMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: SPARKLE_VERT,
    fragmentShader: SPARKLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color(SPARKLE_COLOR) },
      uArmSharpness: { value: SPARKLE_ARM_SHARPNESS },
      uArmFalloff: { value: SPARKLE_ARM_FALLOFF },
      uGlowRadius: { value: SPARKLE_GLOW_RADIUS },
    },
  })
