import * as THREE from 'three'
import { algaeDefines, algaeUniforms } from '../wildlife/algae/algaeField'
import { WAKE_FADE_MAX, WAKE_TOTAL_VERTS, WAKE_TRAIL_LENGTH } from './constants'
import WAKE_VERT from './shaders/wake.vert.glsl'
import WAKE_FRAG from './shaders/wake.frag.glsl'

export function buildWakeRibbonGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array(WAKE_TOTAL_VERTS * 3)
  const uvs = new Float32Array(WAKE_TOTAL_VERTS * 2)
  const indices: number[] = []

  for (let i = 0; i < WAKE_TRAIL_LENGTH; i++) {
    const along = i / (WAKE_TRAIL_LENGTH - 1)
    const outerLeft = i * 4
    uvs.set([0, along, 1, along, 1, along, 0, along], outerLeft * 2)
  }

  for (let i = 0; i < WAKE_TRAIL_LENGTH - 1; i++) {
    const outerLeft = i * 4
    const innerLeft = outerLeft + 1
    const innerRight = outerLeft + 2
    const outerRight = outerLeft + 3
    indices.push(outerLeft, outerLeft + 4, innerLeft, innerLeft, outerLeft + 4, innerLeft + 4)
    indices.push(innerRight, innerRight + 4, outerRight, outerRight, innerRight + 4, outerRight + 4)
  }

  const position = new THREE.BufferAttribute(positions, 3)
  position.usage = THREE.DynamicDrawUsage

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', position)
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.setDrawRange(0, 0)
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
  return geometry
}

export const createWakeRibbonMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uFadeProgress: { value: WAKE_FADE_MAX },
      uInvActiveMax: { value: 1.0 },
      uColor: { value: new THREE.Color(1, 1, 1) },
      ...algaeUniforms,
    },
    vertexShader: WAKE_VERT,
    fragmentShader: WAKE_FRAG,
    defines: algaeDefines,
  })
