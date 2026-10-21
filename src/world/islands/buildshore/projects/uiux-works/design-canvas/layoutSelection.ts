import * as THREE from 'three'
import { timelineStage, type HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  GRID_RISE_SECONDS,
  GRID_SWEEP_REACH,
  GRID_SWEEP_SECONDS,
  SELECTION_SNAP_AT_SECONDS,
  SELECTION_SNAP_GROWTH,
  SELECTION_SNAP_SECONDS,
} from './constants'

export interface SelectionFrame {
  gem: THREE.Mesh
  restOffsets: THREE.Vector3[]
}

const { smoothstep } = THREE.MathUtils
const _linear = new THREE.Matrix3()
const _right = new THREE.Vector3()
const _up = new THREE.Vector3()
const _offset = new THREE.Vector3()

export function frameSelection(gem: THREE.Mesh): SelectionFrame {
  gem.geometry.computeBoundingBox()
  const { min, max } = gem.geometry.boundingBox!
  const restOffsets = Array.from({ length: 8 }, (_, corner) =>
    new THREE.Vector3(
      corner & 1 ? max.x : min.x,
      corner & 2 ? max.y : min.y,
      corner & 4 ? max.z : min.z
    )
      .multiply(gem.scale)
      .applyQuaternion(gem.quaternion)
  )
  return { gem, restOffsets }
}

export function measureSelection(
  frame: SelectionFrame,
  camera: THREE.Camera,
  pixelsPerUnit: number,
  out: THREE.Vector2
): THREE.Vector2 {
  _linear.setFromMatrix4(frame.gem.parent!.matrixWorld)
  _right.setFromMatrixColumn(camera.matrixWorld, 0).normalize()
  _up.setFromMatrixColumn(camera.matrixWorld, 1).normalize()
  out.set(0, 0)
  for (const restOffset of frame.restOffsets) {
    _offset.copy(restOffset).applyMatrix3(_linear)
    out.x = Math.max(out.x, Math.abs(_offset.dot(_right)))
    out.y = Math.max(out.y, Math.abs(_offset.dot(_up)))
  }
  return out.multiplyScalar(pixelsPerUnit)
}

export const gridLevel = (hover: HoverTimeline) => timelineStage(hover, GRID_RISE_SECONDS)

export const gridSweep = ({ engagedSeconds }: HoverTimeline) =>
  THREE.MathUtils.lerp(
    -GRID_SWEEP_REACH,
    GRID_SWEEP_REACH,
    (engagedSeconds / GRID_SWEEP_SECONDS) % 1
  )

const selectionSnap = ({ engagedSeconds }: HoverTimeline) =>
  smoothstep(
    engagedSeconds,
    SELECTION_SNAP_AT_SECONDS,
    SELECTION_SNAP_AT_SECONDS + SELECTION_SNAP_SECONDS
  )

export const selectionLevel = (hover: HoverTimeline) => selectionSnap(hover) * hover.presence

export const selectionGrowth = (hover: HoverTimeline) =>
  1 + SELECTION_SNAP_GROWTH * (1 - selectionSnap(hover))
