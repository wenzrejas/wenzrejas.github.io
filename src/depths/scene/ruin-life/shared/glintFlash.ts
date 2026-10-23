import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { pointPixelScale } from '@/utils/screen'
import type {
  CornerSparkleTuning,
  SparkleGem,
} from '@/world/islands/shared/gem-sparkles/sparkleSpots'

const _glintSpot = new THREE.Vector3()

export function glintGemAt(
  node: THREE.Object3D,
  points: THREE.Vector3[],
  { color, count }: CornerSparkleTuning
): SparkleGem {
  const starts = new Float32Array(count * 3)
  for (let glint = 0; glint < count && points.length > 0; glint++) {
    points[Math.floor(Math.random() * points.length)].toArray(starts, glint * 3)
  }
  return { node, color: displayColorOf(color), sparkleSpots: { starts, ends: starts } }
}

export function flashGlints(
  material: THREE.ShaderMaterial,
  node: THREE.Object3D,
  size: number,
  glow: number,
  time: number,
  camera: THREE.PerspectiveCamera,
  drawingHeight: number
) {
  _glintSpot.setFromMatrixPosition(node.matrixWorld)
  const distance = Math.max(_glintSpot.distanceTo(camera.position), 1)
  const { uniforms } = material
  uniforms.uTime.value = time
  uniforms.uGlow.value = glow
  uniforms.uSize.value = (size * pointPixelScale(camera, drawingHeight)) / distance
}
