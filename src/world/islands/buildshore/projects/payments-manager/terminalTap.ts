import * as THREE from 'three'
import { nodeNamed } from '@/utils/meshes'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  CHECK_AT_SECONDS,
  CHECK_DISC_SECONDS,
  CHECK_STROKE_SECONDS,
  CONFIRM_KEY_NODE,
  CONTACTLESS_ICON_NODE,
  HIDDEN_SHARE,
  KEY_PRESS_AT_SECONDS,
  KEY_PRESS_DEPTH,
  KEY_PRESS_SECONDS,
  RECEIPT_AT_SECONDS,
  RECEIPT_NODE,
  RECEIPT_PRINT_SECONDS,
  SCREEN_NODE,
} from './constants'

export interface Terminal {
  screen: THREE.Mesh
  icon: THREE.Object3D
  iconRest: THREE.Vector3
  key: THREE.Object3D
  keyRest: THREE.Vector3
  receipt: THREE.Object3D | null
  receiptRest: THREE.Vector3
}

const { smoothstep } = THREE.MathUtils
const STROKE_AT_SECONDS = CHECK_AT_SECONDS + CHECK_DISC_SECONDS

export function findTerminal(model: THREE.Object3D): Terminal | null {
  const screen = nodeNamed(model, SCREEN_NODE) as THREE.Mesh | undefined
  const icon = nodeNamed(model, CONTACTLESS_ICON_NODE)
  const key = nodeNamed(model, CONFIRM_KEY_NODE)
  if (!screen || !icon || !key) return null

  const receipt = nodeNamed(model, RECEIPT_NODE) ?? null
  return {
    screen,
    icon,
    iconRest: icon.scale.clone(),
    key,
    keyRest: key.position.clone(),
    receipt,
    receiptRest: receipt ? receipt.scale.clone() : new THREE.Vector3(1, 1, 1),
  }
}

export const checkLevel = ({ engagedSeconds, presence }: HoverTimeline) =>
  presence * smoothstep(engagedSeconds, CHECK_AT_SECONDS, STROKE_AT_SECONDS)

export const checkStroke = ({ engagedSeconds }: HoverTimeline) =>
  smoothstep(engagedSeconds, STROKE_AT_SECONDS, STROKE_AT_SECONDS + CHECK_STROKE_SECONDS)

const receiptLength = ({ engagedSeconds, presence }: HoverTimeline) =>
  presence *
  smoothstep(engagedSeconds, RECEIPT_AT_SECONDS, RECEIPT_AT_SECONDS + RECEIPT_PRINT_SECONDS)

function keyPress({ engagedSeconds, presence }: HoverTimeline): number {
  const share = (engagedSeconds - KEY_PRESS_AT_SECONDS) / KEY_PRESS_SECONDS
  return share > 0 && share < 1 ? presence * Math.sin(Math.PI * share) : 0
}

export function poseTerminal(terminal: Terminal, hover: HoverTimeline): void {
  const iconShare = 1 - checkLevel(hover)
  terminal.icon.visible = iconShare > HIDDEN_SHARE
  terminal.icon.scale.copy(terminal.iconRest).multiplyScalar(Math.max(iconShare, HIDDEN_SHARE))
  terminal.key.position.copy(terminal.keyRest)
  terminal.key.position.z -= keyPress(hover) * KEY_PRESS_DEPTH

  if (terminal.receipt) {
    const length = receiptLength(hover)
    const printed = Math.max(length, HIDDEN_SHARE)
    const { x, y, z } = terminal.receiptRest
    terminal.receipt.visible = length > HIDDEN_SHARE
    terminal.receipt.scale.set(x, y * printed, z * printed)
  }
}
