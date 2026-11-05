import type * as THREE from 'three'

export const instancedAttribute = (geometry: THREE.BufferGeometry, name: string) =>
  geometry.getAttribute(name) as THREE.InstancedBufferAttribute

export function publishInstances(
  mesh: THREE.InstancedMesh,
  count: number,
  attributes: readonly THREE.InstancedBufferAttribute[]
) {
  mesh.count = count
  mesh.visible = count > 0
  if (count === 0) return
  mesh.instanceMatrix.needsUpdate = true
  for (const attribute of attributes) attribute.needsUpdate = true
}
