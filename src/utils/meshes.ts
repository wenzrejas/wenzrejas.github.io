import * as THREE from 'three'

const _toFrame = new THREE.Matrix4()
const _meshToFrame = new THREE.Matrix4()
const _meshBounds = new THREE.Box3()

export function meshesOf(object: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = []
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh)
  })
  return meshes
}

export const meshesNamed = (root: THREE.Object3D, names: readonly string[]) =>
  names.flatMap((name) => {
    const node = root.getObjectByName(name)
    return node ? meshesOf(node) : []
  })

export function boundsIn(frame: THREE.Object3D, meshes: THREE.Mesh[]): THREE.Box3 {
  _toFrame.copy(frame.matrixWorld).invert()
  const bounds = new THREE.Box3()
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingBox()
    _meshToFrame.multiplyMatrices(_toFrame, mesh.matrixWorld)
    bounds.union(_meshBounds.copy(mesh.geometry.boundingBox!).applyMatrix4(_meshToFrame))
  }
  return bounds
}

export const positionIn = (frame: THREE.Object3D, node: THREE.Object3D) =>
  frame.worldToLocal(node.getWorldPosition(new THREE.Vector3()))

export const pointIn = (
  frame: THREE.Object3D,
  node: THREE.Object3D,
  point: readonly [number, number, number]
) => frame.worldToLocal(node.localToWorld(new THREE.Vector3(...point)))

export const uniformsOf = (object: THREE.Mesh | THREE.Points) =>
  (object.material as THREE.ShaderMaterial).uniforms

export function displayColor(mesh: THREE.Mesh): THREE.Color {
  const material = (
    Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  ) as THREE.MeshStandardMaterial
  return material.color.clone().convertLinearToSRGB()
}
