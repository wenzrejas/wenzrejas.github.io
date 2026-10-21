import type * as THREE from 'three'
import { meshesOf, sinkBehindCoplanar } from '@/utils/meshes'
import { HIVE_WINDOW_DEPTH_STEPS, HIVE_WINDOW_ROLE } from './constants'

export function sinkHiveWindows(model: THREE.Object3D): void {
  model.traverse((node) => {
    if (node.userData.role !== HIVE_WINDOW_ROLE) return
    for (const mesh of meshesOf(node)) {
      sinkBehindCoplanar(mesh.material as THREE.Material, HIVE_WINDOW_DEPTH_STEPS)
    }
  })
}
