import * as THREE from 'three'
import { mix } from '../utils/math'
import { boundsIn, meshesOf } from '../utils/meshes'
import { MAX_FRAME_SECONDS } from '../utils/time'
import { MARKER_SPRING_DAMPING, MARKER_SPRING_STIFFNESS } from './constants'

export interface MarkerMotion {
  hover: number
  velocity: number
}

const _parentRotation = new THREE.Quaternion()
const _parentScale = new THREE.Vector3()

export function pinToScreen(object: THREE.Object3D, camera: THREE.Camera, pixels: number) {
  const parent = object.parent
  if (!parent) return
  object.quaternion.copy(
    parent.getWorldQuaternion(_parentRotation).invert().multiply(camera.quaternion)
  )
  const zoom = (camera as THREE.OrthographicCamera).zoom
  object.scale.setScalar(pixels / (zoom * parent.getWorldScale(_parentScale).x))
}

export function springHover(motion: MarkerMotion, isHovered: boolean, delta: number) {
  const dt = Math.min(delta, MAX_FRAME_SECONDS)
  const pull = ((isHovered ? 1 : 0) - motion.hover) * MARKER_SPRING_STIFFNESS
  motion.velocity += (pull - motion.velocity * MARKER_SPRING_DAMPING) * dt
  motion.hover += motion.velocity * dt
}

export function markerPositionOn(frame: THREE.Object3D, node: THREE.Object3D, heightShare: number) {
  const bounds = boundsIn(frame, meshesOf(node))
  const position = bounds.getCenter(new THREE.Vector3())
  position.y = mix(bounds.min.y, bounds.max.y, heightShare)
  return position
}
