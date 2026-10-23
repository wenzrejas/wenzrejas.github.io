import * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import type { IslandModel } from '@/world/islands/shared/islandModel'
import { bakeIslandLighting } from '@/world/islands/shared/lighting-bake/lightingBakeModel'
import {
  ARMILLARY_TURN_RATE,
  GEM_BOB_HEIGHT,
  GEM_GLOW,
  GEM_SPIN_RATE,
  RUIN_LANTERN_SPILL,
  RUIN_OVERHEAD_SHADE,
  RUIN_STONE_MATERIAL,
} from './constants'

export interface RuinMover {
  node: THREE.Object3D
  axis: THREE.Vector3
  turnRate: number
  baseQuaternion: THREE.Quaternion
  baseY: number
  bobHeight: number
  phase: number
}

const UPRIGHT = new THREE.Vector3(0, 1, 0)

const roleOf = (node: THREE.Object3D | null) => node?.userData.role as string | undefined

function findRuins(model: THREE.Object3D) {
  const ruins: THREE.Object3D[] = []
  model.traverse((node) => {
    if (roleOf(node) === 'ruin') ruins.push(node)
  })
  return ruins.sort((a, b) => String(a.userData.ruin).localeCompare(String(b.userData.ruin)))
}

function moverOf(
  node: THREE.Object3D,
  axis: THREE.Vector3,
  turnRate: number,
  bobHeight = 0
): RuinMover {
  return {
    node,
    axis,
    turnRate,
    baseQuaternion: node.quaternion.clone(),
    baseY: node.position.y,
    bobHeight,
    phase: Math.random() * Math.PI * 2,
  }
}

function collectMovers(model: THREE.Object3D): RuinMover[] {
  const movers: RuinMover[] = []
  model.traverse((node) => {
    const role = roleOf(node)
    if (role === 'gem_pivot') {
      movers.push(moverOf(node, UPRIGHT, ARMILLARY_TURN_RATE))
    } else if (role === 'gem' && roleOf(node.parent) === 'ruin') {
      movers.push(moverOf(node, UPRIGHT, GEM_SPIN_RATE, GEM_BOB_HEIGHT))
    }
  })
  return movers
}

function lightGems(model: THREE.Object3D) {
  for (const mesh of meshesOf(model)) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials as THREE.MeshPhysicalMaterial[]) {
      if (material.userData.role !== 'gem' || material.transmission === 0) continue
      material.transmission = 0
      material.emissiveIntensity = GEM_GLOW
    }
  }
}

function showStoneBothSides(model: THREE.Object3D) {
  for (const mesh of meshesOf(model)) {
    const material = mesh.material as THREE.Material
    if (material.name.startsWith(RUIN_STONE_MATERIAL)) material.side = THREE.DoubleSide
  }
}

export function prepareRuins(island: IslandModel) {
  lightGems(island.model)
  showStoneBothSides(island.model)
  const levels = bakeIslandLighting(island)
  levels.uOverheadShadow.value = RUIN_OVERHEAD_SHADE
  levels.uLampSpill.value = RUIN_LANTERN_SPILL
  return { movers: collectMovers(island.model), ruins: findRuins(island.model) }
}

export function disposeRuinMaterials({ model }: IslandModel) {
  const materials = new Set<THREE.Material>()
  for (const mesh of meshesOf(model)) {
    for (const material of [mesh.material].flat()) materials.add(material)
  }
  for (const material of materials) material.dispose()
}
