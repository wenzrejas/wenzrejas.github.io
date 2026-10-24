import * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import type { IslandModel } from '@/world/islands/shared/islandModel'
import { bakeIslandLighting } from '@/world/islands/shared/lighting-bake/lightingBakeModel'
import {
  ARMILLARY_TURN_RATE,
  GEM_BOB_HEIGHT,
  GEM_SPIN_RATE,
  LANDING_ANCHOR_ROLE,
  RUIN_LANTERN_SPILL,
  RUIN_OVERHEAD_SHADE,
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

export function prepareRuins(island: IslandModel) {
  const levels = bakeIslandLighting(island)
  levels.uOverheadShadow.value = RUIN_OVERHEAD_SHADE
  levels.uLampSpill.value = RUIN_LANTERN_SPILL
  return { movers: collectMovers(island.model), ruins: findRuins(island.model) }
}

export function readLandingAnchor(clockRuin: THREE.Object3D | undefined, out: THREE.Vector3) {
  const anchor = clockRuin?.children.find((child) => roleOf(child) === LANDING_ANCHOR_ROLE)
  if (anchor) out.copy(anchor.position)
}

export function disposeRuinMaterials({ model }: IslandModel) {
  const materials = new Set<THREE.Material>()
  for (const mesh of meshesOf(model)) {
    for (const material of [mesh.material].flat()) materials.add(material)
  }
  for (const material of materials) material.dispose()
}
