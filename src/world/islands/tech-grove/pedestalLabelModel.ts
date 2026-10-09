import type * as THREE from 'three'
import { applyCloudShadow } from '@/world/environment/weather/cloudShadow'
import type { GlowTarget } from '../shared/nightGlow'
import { PEDESTAL_LABEL_GLOW } from './constants'
import type { Statue } from './shrines'

export interface PedestalLabel extends GlowTarget {
  mesh: THREE.Mesh
  original: THREE.MeshStandardMaterial
}

export function createPedestalLabels(statues: Statue[]): PedestalLabel[] {
  return statues.flatMap(({ label, pedestalGlow }) => {
    if (!label) return []
    const original = label.material as THREE.MeshStandardMaterial
    const mat = original.clone()
    mat.emissive.copy(pedestalGlow.color).convertSRGBToLinear()
    applyCloudShadow(mat)
    return [{ mesh: label, original, mat, base: PEDESTAL_LABEL_GLOW }]
  })
}

export function tintPedestalLabels(labels: PedestalLabel[]) {
  for (const { mat, original } of labels) mat.color.copy(original.color)
}

export function dressPedestalLabels(labels: PedestalLabel[]): () => void {
  for (const { mesh, mat } of labels) mesh.material = mat
  return () => {
    for (const { mesh, original, mat } of labels) {
      mesh.material = original
      mat.dispose()
    }
  }
}
