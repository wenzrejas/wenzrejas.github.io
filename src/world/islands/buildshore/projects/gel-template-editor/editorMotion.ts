import type * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { nodesNamed } from '@/utils/meshes'
import { timelineStage, type HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  ACCENT_BOB,
  ACCENT_BOB_RATE,
  ACCENT_CUBE_NODES,
  ACCENT_LIFT,
  ACCENT_SPIN_RATE,
  ACCENT_TUMBLE,
  ACCENT_TUMBLE_RATE,
  CARD_BOB,
  CARD_BOB_RATE,
  EDITOR_RISE_SECONDS,
  FLOATING_CARD_NODES,
} from './constants'

interface RestingPart {
  node: THREE.Object3D
  position: THREE.Vector3
  rotation: THREE.Euler
}

export interface EditorMotion {
  cards: RestingPart[]
  accents: RestingPart[]
  accentSpin: number
}

const partsNamed = (model: THREE.Object3D, names: string[]): RestingPart[] =>
  nodesNamed(model, names).map((node) => ({
    node,
    position: node.position.clone(),
    rotation: node.rotation.clone(),
  }))

export function findEditorMotion(model: THREE.Object3D): EditorMotion | null {
  const cards = partsNamed(model, FLOATING_CARD_NODES)
  const accents = partsNamed(model, ACCENT_CUBE_NODES)
  if (cards.length === 0 && accents.length === 0) return null
  return { cards, accents, accentSpin: 0 }
}

export const editorLevel = (hover: HoverTimeline) => timelineStage(hover, EDITOR_RISE_SECONDS)

function settle(part: RestingPart): void {
  part.node.position.copy(part.position)
  part.node.rotation.copy(part.rotation)
}

export function poseEditor(editor: EditorMotion, level: number, seconds: number, dt: number): void {
  editor.cards.forEach((card, index) => {
    settle(card)
    const phase = (seconds * CARD_BOB_RATE + index / editor.cards.length) * FULL_TURN
    card.node.position.y += Math.sin(phase) * CARD_BOB * level
  })

  editor.accentSpin += ACCENT_SPIN_RATE * level * dt
  editor.accents.forEach((accent, index) => {
    settle(accent)
    const phase = index * Math.PI
    accent.node.rotation.y += editor.accentSpin
    accent.node.rotation.x += Math.sin(seconds * ACCENT_TUMBLE_RATE + phase) * ACCENT_TUMBLE * level
    accent.node.position.y +=
      (ACCENT_LIFT + Math.sin(seconds * ACCENT_BOB_RATE * FULL_TURN + phase) * ACCENT_BOB) * level
  })
}
