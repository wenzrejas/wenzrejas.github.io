import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { createUnboundedSphere } from '@/utils/geometry'
import { RAIN_DROPS } from './constants'
import RAIN_VERT from './shaders/rain.vert.glsl'
import RAIN_FRAG from './shaders/rain.frag.glsl'

const STREAK_CORNERS = [
  [-0.5, 0],
  [0.5, 0],
  [-0.5, 1],
  [0.5, 1],
] as const

const INDICES_PER_DROP = 6

export function buildRainGeometry(): THREE.BufferGeometry {
  const vertexCount = RAIN_DROPS * 4
  const seeds = new Float32Array(vertexCount * 3)
  const corners = new Float32Array(vertexCount * 2)
  const indices = new Uint32Array(RAIN_DROPS * INDICES_PER_DROP)

  for (let drop = 0; drop < RAIN_DROPS; drop++) {
    const offsetX = Math.random()
    const phase = Math.random()
    const offsetZ = Math.random()
    for (let corner = 0; corner < 4; corner++) {
      const vertex = drop * 4 + corner
      seeds[vertex * 3] = offsetX
      seeds[vertex * 3 + 1] = phase
      seeds[vertex * 3 + 2] = offsetZ
      corners[vertex * 2] = STREAK_CORNERS[corner][0]
      corners[vertex * 2 + 1] = STREAK_CORNERS[corner][1]
    }
    const first = drop * 4
    indices.set(
      [first, first + 1, first + 2, first + 1, first + 3, first + 2],
      drop * INDICES_PER_DROP
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
  geometry.setAttribute('aCorner', new THREE.BufferAttribute(corners, 2))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.boundingSphere = createUnboundedSphere()
  return geometry
}

export const createRainMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: RAIN_VERT,
    fragmentShader: RAIN_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uWindDirection: { value: new THREE.Vector2() },
      uShipXZ: { value: new THREE.Vector2() },
      uColor: { value: useCycleStore.getState().foamColor },
    },
  })
