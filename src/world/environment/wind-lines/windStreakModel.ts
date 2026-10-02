import * as THREE from 'three'
import { WIND_CURVE_DIVISIONS, WIND_CURVE_HANDLES } from './constants'
import WIND_VERT from './shaders/windlines.vert.glsl'
import WIND_FRAG from './shaders/windlines.frag.glsl'

export function buildWindStreakGeometry(): THREE.BufferGeometry {
  const handles = Array.from(
    { length: WIND_CURVE_HANDLES },
    (_, i) => new THREE.Vector3(i / (WIND_CURVE_HANDLES - 1) - 0.5, (i % 2 === 0 ? 1 : -1) * 0.5, 0)
  )
  const points = new THREE.CatmullRomCurve3(handles).getPoints(WIND_CURVE_DIVISIONS)
  const count = points.length

  const positions = new Float32Array(count * 2 * 3)
  const ratios = new Float32Array(count * 2)
  const sides = new Float32Array(count * 2)
  const indices: number[] = []

  for (let i = 0; i < count; i++) {
    const point = points[i]
    const vertex = i * 2
    positions.set([point.x, point.y, point.z, point.x, point.y, point.z], i * 6)
    ratios[vertex] = ratios[vertex + 1] = i / (count - 1)
    sides[vertex] = -0.5
    sides[vertex + 1] = 0.5
    if (i < count - 1) {
      indices.push(vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('ratio', new THREE.BufferAttribute(ratios, 1))
  geometry.setAttribute('side', new THREE.BufferAttribute(sides, 1))
  geometry.setIndex(indices)
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
  return geometry
}

export const createWindStreakMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uProgress: { value: 0 },
      uOpacity: { value: 0 },
      uThickness: { value: 0 },
    },
    vertexShader: WIND_VERT,
    fragmentShader: WIND_FRAG,
  })
