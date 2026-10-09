import type * as THREE from 'three'
import { meshesNamed } from '@/utils/meshes'
import type { IslandModel } from '../shared/islandModel'
import { LIGHT_COLOR, LIGHT_NODES, MONOLITH_NAMES } from './constants'

const LIGHT_NODE_NAMES = [...LIGHT_NODES, ...MONOLITH_NAMES.map((name) => `Monolith_${name}`)]

export function tintLights({ model, glows, tints }: IslandModel) {
  const glowing = new Set<THREE.Material>(glows.map(({ mat }) => mat))
  const lit = new Set<THREE.MeshStandardMaterial>()

  for (const mesh of meshesNamed(model, LIGHT_NODE_NAMES)) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (glowing.has(material)) lit.add(material as THREE.MeshStandardMaterial)
    }
  }

  for (const material of lit) {
    material.color.set(LIGHT_COLOR)
    material.emissive.set(LIGHT_COLOR)
  }
  for (const tint of tints) if (lit.has(tint.mat)) tint.base.copy(tint.mat.color)
}
