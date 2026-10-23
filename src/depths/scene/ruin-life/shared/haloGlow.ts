import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { meshesOf } from '@/utils/meshes'
import { pointPixelScale } from '@/utils/screen'
import type { HaloGem } from '@/world/islands/shared/gem-halo/gemHaloModel'
import { ruinBounds } from './ruinPoints'

const _haloSpot = new THREE.Vector3()

export const haloAt = (
  center: THREE.Vector3,
  radius: number,
  color: THREE.ColorRepresentation
): HaloGem => ({ center, radius, color: displayColorOf(color) })

export function haloAround(
  ruin: THREE.Object3D,
  part: THREE.Object3D,
  color: THREE.ColorRepresentation
): HaloGem {
  const parts = new Set(meshesOf(part))
  const bounds = ruinBounds(ruin, (mesh) => parts.has(mesh))
  const size = bounds.getSize(new THREE.Vector3())
  return haloAt(bounds.getCenter(new THREE.Vector3()), Math.max(size.x, size.y) / 2, color)
}

export function shineHalo(
  material: THREE.ShaderMaterial,
  ruin: THREE.Object3D,
  glow: number,
  camera: THREE.PerspectiveCamera,
  drawingHeight: number
) {
  _haloSpot.setFromMatrixPosition(ruin.matrixWorld)
  const distance = Math.max(_haloSpot.distanceTo(camera.position), 1)
  const { uniforms } = material
  uniforms.uGlow.value = glow
  uniforms.uPixelsPerUnit.value = (ruin.scale.x * pointPixelScale(camera, drawingHeight)) / distance
}
