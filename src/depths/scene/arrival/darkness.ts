import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'

export function shadeDarkness(quad: THREE.Mesh, level: number) {
  quad.visible = level > 0
  uniformsOf(quad).uDarkness.value = level
}
