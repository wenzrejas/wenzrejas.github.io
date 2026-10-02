import * as THREE from 'three'
import { BASE_FOOTPRINT_SECTORS } from './constants'

export interface Footprint {
  centerX: number
  centerZ: number
  radii: Float32Array
}

const _toFrame = new THREE.Matrix4()
const _meshToFrame = new THREE.Matrix4()
const _vertex = new THREE.Vector3()
const _point = new THREE.Vector3()
const _frameScale = new THREE.Vector3()

const sectorOf = (dx: number, dz: number) =>
  Math.floor(((Math.atan2(dz, dx) / (Math.PI * 2) + 1) % 1) * BASE_FOOTPRINT_SECTORS) %
  BASE_FOOTPRINT_SECTORS

export function footprintOf(
  frame: THREE.Object3D,
  meshes: THREE.Mesh[],
  center: THREE.Vector3,
  maxRadius = Infinity
): Footprint {
  _toFrame.copy(frame.matrixWorld).invert()
  const radii = new Float32Array(BASE_FOOTPRINT_SECTORS)
  for (const mesh of meshes) {
    _meshToFrame.multiplyMatrices(_toFrame, mesh.matrixWorld)
    const position = mesh.geometry.getAttribute('position')
    for (let i = 0; i < position.count; i++) {
      _vertex.fromBufferAttribute(position, i).applyMatrix4(_meshToFrame)
      const dx = _vertex.x - center.x
      const dz = _vertex.z - center.z
      const radius = Math.hypot(dx, dz)
      if (radius > maxRadius) continue
      const sector = sectorOf(dx, dz)
      radii[sector] = Math.max(radii[sector], radius)
    }
  }
  return { centerX: center.x, centerZ: center.z, radii }
}

export function footprintGap(
  { centerX, centerZ, radii }: Footprint,
  frame: THREE.Object3D,
  x: number,
  z: number
): number {
  frame.worldToLocal(_point.set(x, 0, z))
  const dx = _point.x - centerX
  const dz = _point.z - centerZ
  const gap = Math.hypot(dx, dz) - radii[sectorOf(dx, dz)]
  return gap * frame.getWorldScale(_frameScale).x
}
