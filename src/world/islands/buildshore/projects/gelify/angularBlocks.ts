import type * as THREE from 'three'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  ANGULAR_CUBE_PREFIX,
  BLOCK_HOP_SECONDS,
  BLOCK_LIFT,
  BLOCK_STAGGER_SECONDS,
  BLOCK_WAVE_SECONDS,
  STACK_TOLERANCE,
} from './constants'

interface AngularBlock {
  node: THREE.Object3D
  restY: number
  carriers: number[]
}

const isStackedOn = (upper: THREE.Object3D, lower: THREE.Object3D) =>
  Math.abs(upper.position.x - lower.position.x) < STACK_TOLERANCE &&
  Math.abs(upper.position.z - lower.position.z) < STACK_TOLERANCE &&
  lower.position.y < upper.position.y

export function findAngularBlocks(model: THREE.Object3D): AngularBlock[] {
  const nodes: THREE.Object3D[] = []
  model.traverse((child) => {
    if (child.name.startsWith(ANGULAR_CUBE_PREFIX)) nodes.push(child)
  })
  nodes.sort((a, b) => a.name.localeCompare(b.name))
  return nodes.map((node) => ({
    node,
    restY: node.position.y,
    carriers: nodes.flatMap((lower, index) => (isStackedOn(node, lower) ? [index] : [])),
  }))
}

function hopAt(index: number, seconds: number): number {
  const sinceLaunch = seconds - index * BLOCK_STAGGER_SECONDS
  if (sinceLaunch < 0) return 0
  const progress = (sinceLaunch % BLOCK_WAVE_SECONDS) / BLOCK_HOP_SECONDS
  return progress < 1 ? Math.sin(Math.PI * progress) : 0
}

export function stackAngularBlocks(blocks: AngularBlock[], hover: HoverTimeline): void {
  blocks.forEach((block, index) => {
    let rise = hopAt(index, hover.engagedSeconds)
    for (const carrier of block.carriers) rise += hopAt(carrier, hover.engagedSeconds)
    block.node.position.y = block.restY + rise * BLOCK_LIFT * hover.presence
  })
}
