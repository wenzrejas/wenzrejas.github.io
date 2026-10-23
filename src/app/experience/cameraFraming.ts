import * as THREE from 'three'
import { arrivalZoom } from '@/loading/cloud-descent/descent'
import { useCinematicStore } from '@/store/cinematicStore'
import { useDebugStore } from '@/store/debugStore'
import { usePanelStore } from '@/store/panelStore'
import { useRevealStore } from '@/store/revealStore'
import { mix } from '@/utils/math'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { REVEAL_STOP_SHORT, REVEAL_TITLE_ROOM, REVEAL_ZOOM } from '@/world/islands/shared/constants'
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
const VIEW_DIRECTION = new THREE.Vector3(
  -CAMERA_OFFSET[0],
  CAMERA_LOOK_Y_OFFSET - CAMERA_OFFSET[1],
  -CAMERA_OFFSET[2]
).normalize()
const SCREEN_UP = new THREE.Vector3(0, 1, 0)
  .addScaledVector(VIEW_DIRECTION, -VIEW_DIRECTION.y)
  .normalize()
const GROUND_FORWARD = new THREE.Vector2(VIEW_DIRECTION.x, VIEW_DIRECTION.z).normalize()
const FORWARD_RISE = GROUND_FORWARD.x * SCREEN_UP.x + GROUND_FORWARD.y * SCREEN_UP.z
const BASE_OFFSET = new THREE.Vector3(...CAMERA_OFFSET)
const UP = new THREE.Vector3(0, 1, 0)
const _offset = new THREE.Vector3()
const _panelCenter = new THREE.Vector3()
const _panelLook = new THREE.Vector2()
const _focusLook = new THREE.Vector2()
const _revealLook = new THREE.Vector2()
const _revealFrame = new THREE.Vector2()

function shakeCamera(camera: THREE.Camera, strength: number, time: number) {
  if (strength <= 0) return
  camera.translateX(strength * Math.sin(time * CAMERA_SHAKE_RATE_ACROSS))
  camera.translateY(strength * Math.sin(time * CAMERA_SHAKE_RATE_UP))
}

function lookPointThrough(
  point: THREE.Vector3,
  lookY: number,
  offset: THREE.Vector3,
  out: THREE.Vector2
) {
  const lift = (point.y - lookY) / (offset.y - CAMERA_LOOK_Y_OFFSET)
  return out.set(point.x - offset.x * lift, point.z - offset.z * lift)
}

function keepTitleClear(
  frame: THREE.Vector2,
  island: THREE.Vector3,
  islandScreenTop: number,
  lookY: number,
  camera: THREE.OrthographicCamera
) {
  const viewHeight = (camera.top - camera.bottom) / (CAMERA_ZOOM * arrivalZoom() * REVEAL_ZOOM)
  const titleLine = (0.5 - REVEAL_TITLE_ROOM) * viewHeight
  const islandTop =
    (island.x - frame.x) * SCREEN_UP.x -
    lookY * SCREEN_UP.y +
    (island.z - frame.y) * SCREEN_UP.z +
    islandScreenTop
  const overlap = islandTop - titleLine
  if (overlap > 0) frame.addScaledVector(GROUND_FORWARD, overlap / FORWARD_RISE)
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
  const { blend, target, islandScreenTop } = useRevealStore.getState()
  const { focus, focusBlend, focusZoom, shake, spin } = useCinematicStore.getState()
  const panel = usePanelStore.getState()
  const offset = _offset.copy(BASE_OFFSET).applyAxisAngle(UP, spin)

  const lookY = y + CAMERA_LOOK_Y_OFFSET
  const revealLook = lookPointThrough(target, lookY, offset, _revealLook)
  const dx = revealLook.x - shipX
  const dz = revealLook.y - shipZ
  const gap = Math.hypot(dx, dz)
  const reach = gap > 0 ? Math.max(gap - REVEAL_STOP_SHORT, 0) / gap : 0
  _revealFrame.set(shipX + dx * reach, shipZ + dz * reach)
  if (islandScreenTop !== null) {
    keepTitleClear(_revealFrame, target, islandScreenTop, lookY, camera as THREE.OrthographicCamera)
  }

  const panelShift = -panel.focusOffsetPixels / (CAMERA_ZOOM * PANEL_FRAMING_ZOOM)
  _panelCenter.copy(panel.focus).addScaledVector(SCREEN_RIGHT, panelShift)
  const panelLook = lookPointThrough(_panelCenter, lookY, offset, _panelLook)
  const framedX = mix(mix(shipX, _revealFrame.x, blend), panelLook.x, panelBlend)
  const framedZ = mix(mix(shipZ, _revealFrame.y, blend), panelLook.y, panelBlend)

  const focusLook = lookPointThrough(focus, lookY, offset, _focusLook)
  const fx = mix(framedX, focusLook.x, focusBlend)
  const fz = mix(framedZ, focusLook.y, focusBlend)

  camera.position.set(fx + offset.x, y + offset.y, fz + offset.z)
  camera.lookAt(fx, lookY, fz)
  shakeCamera(camera, shake, time)

  const panelZoom = mix(1, PANEL_FRAMING_ZOOM, panelBlend)
  const zoom =
    CAMERA_ZOOM * arrivalZoom() * mix(1, REVEAL_ZOOM, blend) * mix(panelZoom, focusZoom, focusBlend)
  if (camera.zoom !== zoom) {
    camera.zoom = zoom
    camera.updateProjectionMatrix()
  }
}
