import * as THREE from 'three'
import { FLAME_TONGUES } from './constants'
import FLAME_VERT from './shaders/flame.vert.glsl'
import FLAME_FRAG from './shaders/flame.frag.glsl'

export function buildFlameGeometry(size: number): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(1, 1)
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, size / 2, 0), size * Math.SQRT1_2)
  return geometry
}

export const createFlameMaterial = (glow: number) =>
  new THREE.ShaderMaterial({
    defines: { TONGUES: FLAME_TONGUES },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uIntensity: { value: 0 },
      uGlow: { value: glow },
    },
    vertexShader: FLAME_VERT,
    fragmentShader: FLAME_FRAG,
  })
