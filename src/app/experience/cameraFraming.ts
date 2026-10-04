import * as THREE from 'three'
import { useCinematicStore } from '@/store/cinematicStore'
import { useDebugStore } from '@/store/debugStore'
import { usePanelStore } from '@/store/panelStore'
import { useRevealStore } from '@/store/revealStore'
import { mix } from '@/utils/math'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { REVEAL_PAN, REVEAL_ZOOM } from '@/world/islands/shared/constants'
import {
  CAMERA_LOOK_Y_OFFSET,
  CAMERA_OFFSET,
  CAMERA_SHAKE_RATE_ACROSS,
  CAMERA_SHAKE_RATE_UP,
  CAMERA_ZOOM,
  PANEL_FRAMING_EASE_RATE,
  PANEL_FRAMING_SNAP_GAP,
  PANEL_FRAMING_ZOOM,
} from './constants'

type ViewCamera = THREE.OrthographicCamera | THREE.PerspectiveCamera

export interface PanelFraming {
  blend: number
}

const SCREEN_RIGHT = new THREE.Vector3(CAMERA_OFFSET[2], 0, -CAMERA_OFFSET[0]).normalize()
const _panelCenter = new THREE.Vector3()
const _panelLook = new THREE.Vector2()
const _focusLook = new THREE.Vector2()

function shakeCamera(camera: THREE.Camera, strength: number, time: number) {
  if (strength <= 0) return
  camera.translateX(strength * Math.sin(time * CAMERA_SHAKE_RATE_ACROSS))
  camera.translateY(strength * Math.sin(time * CAMERA_SHAKE_RATE_UP))
}

function lookPointThrough(point: THREE.Vector3, lookY: number, out: THREE.Vector2) {
  const lift = (point.y - lookY) / (CAMERA_OFFSET[1] - CAMERA_LOOK_Y_OFFSET)
  return out.set(point.x - CAMERA_OFFSET[0] * lift, point.z - CAMERA_OFFSET[2] * lift)
}

export const createPanelFraming = (): PanelFraming => ({ blend: 0 })

export function easePanelFraming(framing: PanelFraming, isOpen: boolean, delta: number) {
  const { isPlaying, focusBlend } = useCinematicStore.getState()
  if (!isOpen && isPlaying) {
    if (focusBlend >= 1) framing.blend = 0
    return
  }
  const target = isOpen ? 1 : 0
  const step = 1 - Math.exp(-PANEL_FRAMING_EASE_RATE * Math.min(delta, MAX_FRAME_SECONDS))
  framing.blend += (target - framing.blend) * step
  if (Math.abs(target - framing.blend) < PANEL_FRAMING_SNAP_GAP) framing.blend = target
}

export function frameShip(
  camera: ViewCamera,
  shipX: number,
  shipZ: number,
  time: number,
  panelBlend: number
) {
  const y = useDebugStore.getState().ship.baseY
  const { blend, target } = useRevealStore.getState()
  const { focus, focusBlend, focusZoom, shake } = useCinematicStore.getState()
  const panel = usePanelStore.getState()

  const dx = target.x - shipX
  const dz = target.z - shipZ
  const gap = Math.hypot(dx, dz)
  const pan = gap > 0 ? (Math.min(REVEAL_PAN, gap) * blend) / gap : 0
  const lookY = y + CAMERA_LOOK_Y_OFFSET

  const panelShift = -panel.focusOffsetPixels / (CAMERA_ZOOM * PANEL_FRAMING_ZOOM)
  _panelCenter.copy(panel.focus).addScaledVector(SCREEN_RIGHT, panelShift)
  const panelLook = lookPointThrough(_panelCenter, lookY, _panelLook)
  const framedX = mix(shipX + dx * pan, panelLook.x, panelBlend)
  const framedZ = mix(shipZ + dz * pan, panelLook.y, panelBlend)

  const focusLook = lookPointThrough(focus, lookY, _focusLook)
  const fx = mix(framedX, focusLook.x, focusBlend)
  const fz = mix(framedZ, focusLook.y, focusBlend)

  camera.position.set(fx + CAMERA_OFFSET[0], y + CAMERA_OFFSET[1], fz + CAMERA_OFFSET[2])
  camera.lookAt(fx, lookY, fz)
  shakeCamera(camera, shake, time)

  const panelZoom = mix(1, PANEL_FRAMING_ZOOM, panelBlend)
  const zoom = CAMERA_ZOOM * mix(1, REVEAL_ZOOM, blend) * mix(panelZoom, focusZoom, focusBlend)
  if (camera.zoom !== zoom) {
    camera.zoom = zoom
    camera.updateProjectionMatrix()
  }
}
