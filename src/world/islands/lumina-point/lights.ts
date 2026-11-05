import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { meshesNamed } from '@/utils/meshes'
import type { IslandModel } from '../shared/islandModel'
import { lightGlows, nightGlow, type GlowTarget } from '../shared/nightGlow'
import { LIGHT_COLOR, LIGHT_NODES, MONOLITH_NAMES } from './constants'
import { rainLight } from './lighthouseBeam'

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

export function splitLighthouseGlows({ model, glows }: IslandModel) {
  const lighthouse = new Set(meshesNamed(model, LIGHT_NODES).flatMap((mesh) => mesh.material))
  return {
    lighthouse: glows.filter(({ mat }) => lighthouse.has(mat)),
    ambient: glows.filter(({ mat }) => !lighthouse.has(mat)),
  }
}

export function useLighthouseGlow(glows: GlowTarget[]) {
  useFrame(() => lightGlows(glows, Math.max(nightGlow(), rainLight())))
}
