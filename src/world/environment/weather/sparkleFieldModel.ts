import * as THREE from 'three'
import { SPARKLE_Y } from './constants'
import { scatterAround, sparkleLife, sparkleSize, type SparkleField } from './sparkleField'
import SPARKLE_VERT from './shaders/sparkle.vert.glsl'
import SPARKLE_FRAG from './shaders/sparkle.frag.glsl'

export function buildSparkleGeometry(field: SparkleField): THREE.BufferGeometry {
  const positions = new Float32Array(field.count * 3)
  const lifetimes = new Float32Array(field.count)
  const maxLifetimes = new Float32Array(field.count)
  const sizes = new Float32Array(field.count)
  for (let i = 0; i < field.count; i++) {
    positions[i * 3] = scatterAround(field, 0)
    positions[i * 3 + 1] = SPARKLE_Y
    positions[i * 3 + 2] = scatterAround(field, 0)
    lifetimes[i] = Math.random() * sparkleLife(field)
    maxLifetimes[i] = sparkleLife(field)
    sizes[i] = sparkleSize(field)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aLifetime', new THREE.BufferAttribute(lifetimes, 1))
  geometry.setAttribute('aMaxLifetime', new THREE.BufferAttribute(maxLifetimes, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
  return geometry
}

export const createSparkleMaterial = (field: SparkleField) =>
  new THREE.ShaderMaterial({
    vertexShader: SPARKLE_VERT,
    fragmentShader: SPARKLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color(field.color) },
      uArmSharpness: { value: field.armSharpness },
      uArmFalloff: { value: field.armFalloff },
      uGlowRadius: { value: field.glowRadius },
    },
  })
