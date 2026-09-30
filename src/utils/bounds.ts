import * as THREE from 'three'

export function columnBoundingSphere(reach: number, bottom: number, top: number): THREE.Sphere {
  return new THREE.Box3(
    new THREE.Vector3(-reach, bottom, -reach),
    new THREE.Vector3(reach, top, reach)
  ).getBoundingSphere(new THREE.Sphere())
}
