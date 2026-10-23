import * as THREE from 'three'
import { ascentShare } from '@/depths/dive/surfacingPace'
import type { Surfacing } from '../surfacing/surfacing'
import { levelDepth } from '../timeline/timeline'
import {
  CAMERA_DISTANCE,
  CAMERA_FOCUS_FORWARD,
  CAMERA_FOCUS_LIFT,
  CAMERA_TILT_UP_DEGREES,
  PARALLAX_ACROSS,
  PARALLAX_EASE_RATE,
  PARALLAX_UP,
  SURFACING_LIFT,
} from './constants'

export interface DepthsFraming {
  pointerX: number
  pointerY: number
  shiftX: number
  shiftY: number
}

const { damp, degToRad } = THREE.MathUtils

const TILT = degToRad(CAMERA_TILT_UP_DEGREES)
const CAMERA_DROP = Math.sin(TILT) * CAMERA_DISTANCE
const CAMERA_BACK = Math.cos(TILT) * CAMERA_DISTANCE

export const createDepthsFraming = (): DepthsFraming => ({
  pointerX: 0,
  pointerY: 0,
  shiftX: 0,
  shiftY: 0,
})

export function aimParallax(framing: DepthsFraming, clientX: number, clientY: number) {
  framing.pointerX = (clientX / window.innerWidth) * 2 - 1
  framing.pointerY = 1 - (clientY / window.innerHeight) * 2
}

export function easeParallax(framing: DepthsFraming, dt: number) {
  framing.shiftX = damp(framing.shiftX, framing.pointerX * PARALLAX_ACROSS, PARALLAX_EASE_RATE, dt)
  framing.shiftY = damp(framing.shiftY, framing.pointerY * PARALLAX_UP, PARALLAX_EASE_RATE, dt)
}

export function fitLens(camera: THREE.PerspectiveCamera, width: number, height: number) {
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

export function frameDepths(
  camera: THREE.PerspectiveCamera,
  focus: THREE.Vector3,
  viewedLevel: number,
  framing: DepthsFraming,
  surfacing: Surfacing
) {
  const lift = surfacing.isRewinding ? 0 : SURFACING_LIFT * ascentShare(surfacing.seconds) ** 2
  const focusY = levelDepth(viewedLevel) + CAMERA_FOCUS_LIFT + lift
  focus.set(0, focusY, CAMERA_FOCUS_FORWARD)
  camera.position.set(
    framing.shiftX,
    focusY - CAMERA_DROP + framing.shiftY,
    CAMERA_FOCUS_FORWARD + CAMERA_BACK
  )
  camera.lookAt(focus)
}
