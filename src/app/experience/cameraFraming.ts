import type * as THREE from 'three'
import { useCinematicStore } from '@/store/cinematicStore'
import { useDebugStore } from '@/store/debugStore'
import { useRevealStore } from '@/store/revealStore'
import { mix } from '@/utils/math'
import { REVEAL_PAN, REVEAL_ZOOM } from '@/world/islands/shared/constants'
import {
  CAMERA_LOOK_Y_OFFSET,
  CAMERA_OFFSET,
  CAMERA_SHAKE_RATE_ACROSS,
  CAMERA_SHAKE_RATE_UP,
  CAMERA_ZOOM,
} from './constants'

type ViewCamera = THREE.OrthographicCamera | THREE.PerspectiveCamera

function shakeCamera(camera: THREE.Camera, strength: number, time: number) {
  if (strength <= 0) return
  camera.translateX(strength * Math.sin(time * CAMERA_SHAKE_RATE_ACROSS))
  camera.translateY(strength * Math.sin(time * CAMERA_SHAKE_RATE_UP))
}

export function frameShip(camera: ViewCamera, shipX: number, shipZ: number, time: number) {
  const y = useDebugStore.getState().ship.baseY
  const { blend, target } = useRevealStore.getState()
  const { focus, focusBlend, focusZoom, shake } = useCinematicStore.getState()

  const dx = target.x - shipX
  const dz = target.z - shipZ
  const gap = Math.hypot(dx, dz)
  const pan = gap > 0 ? (Math.min(REVEAL_PAN, gap) * blend) / gap : 0
  const lookY = y + CAMERA_LOOK_Y_OFFSET
  const focusLift = (focus.y - lookY) / (CAMERA_OFFSET[1] - CAMERA_LOOK_Y_OFFSET)
  const fx = mix(shipX + dx * pan, focus.x - CAMERA_OFFSET[0] * focusLift, focusBlend)
  const fz = mix(shipZ + dz * pan, focus.z - CAMERA_OFFSET[2] * focusLift, focusBlend)

  camera.position.set(fx + CAMERA_OFFSET[0], y + CAMERA_OFFSET[1], fz + CAMERA_OFFSET[2])
  camera.lookAt(fx, lookY, fz)
  shakeCamera(camera, shake, time)

  const zoom = CAMERA_ZOOM * mix(1, REVEAL_ZOOM, blend) * mix(1, focusZoom, focusBlend)
  if (camera.zoom !== zoom) {
    camera.zoom = zoom
    camera.updateProjectionMatrix()
  }
}
