import * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'

const _toRuin = new THREE.Matrix4()

export const materialNameOf = (mesh: THREE.Mesh) => (mesh.material as THREE.Material).name

export function ruinPoints(
  ruin: THREE.Object3D,
  keepMesh: (mesh: THREE.Mesh) => boolean,
  keepPoint: (point: THREE.Vector3) => boolean
): THREE.Vector3[] {
  ruin.updateWorldMatrix(true, true)
  const fromWorld = ruin.matrixWorld.clone().invert()
  const points: THREE.Vector3[] = []
  for (const mesh of meshesOf(ruin).filter(keepMesh)) {
    _toRuin.multiplyMatrices(fromWorld, mesh.matrixWorld)
    const positions = mesh.geometry.attributes.position
    for (let index = 0; index < positions.count; index++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, index).applyMatrix4(_toRuin)
      if (keepPoint(point)) points.push(point)
    }
  }
  return points
}

export function ruinBounds(ruin: THREE.Object3D, keepMesh: (mesh: THREE.Mesh) => boolean) {
  return new THREE.Box3().setFromPoints(ruinPoints(ruin, keepMesh, () => true))
}
