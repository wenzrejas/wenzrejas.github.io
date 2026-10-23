import type * as THREE from 'three'
import { onceFor } from '@/utils/cache'

export interface GlowLevel {
  material: THREE.MeshStandardMaterial
  base: number
}

const authoredGlow = new WeakMap<THREE.Material, number>()

export function glowLevelsOf(meshes: THREE.Mesh[]): GlowLevel[] {
  const materials = new Set(meshes.flatMap((mesh) => [mesh.material].flat()))
  return [...materials]
    .filter((material): material is THREE.MeshStandardMaterial => 'emissiveIntensity' in material)
    .map((material) => ({
      material,
      base: onceFor(authoredGlow, material, () => material.emissiveIntensity),
    }))
}

export function shineGlow(levels: GlowLevel[], factor: number) {
  for (const { material, base } of levels) material.emissiveIntensity = base * factor
}
