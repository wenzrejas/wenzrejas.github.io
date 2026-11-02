import * as THREE from 'three'
import { ascentShare } from '@/depths/dive/surfacingPace'
import type { Surfacing } from '../surfacing/surfacing'
import { levelDepth } from '../timeline/timeline'
import {
  CAMERA_DISTANCE,
  CAMERA_FOCUS_FORWARD,
  CAMERA_FOCUS_LIFT,
  CAMERA_TILT_UP_DEGREES,
  DEPTHS_CAMERA_FOV,
  DEPTHS_CAMERA_MAX_FOV,
  DEPTHS_CAMERA_REFERENCE_ASPECT,
  FITTED_VIEW_RAISE,
  PARALLAX_ACROSS,
  PARALLAX_EASE_RATE,
  PARALLAX_UP,
  RUIN_FIT_HALF_WIDTH,
  SURFACING_LIFT,
} from './constants'

interface DepthsFraming {
  pointerX: number
  pointerY: number
  shiftX: number
  shiftY: number
  cameraDrop: number
  cameraBack: number
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
  cameraDrop: CAMERA_DROP,
  cameraBack: CAMERA_BACK,
})

export function aimParallax(framing: DepthsFraming, clientX: number, clientY: number) {
  framing.pointerX = (clientX / window.innerWidth) * 2 - 1
  framing.pointerY = 1 - (clientY / window.innerHeight) * 2
}

export function easeParallax(framing: DepthsFraming, dt: number, isMotionReduced: boolean) {
  const reach = isMotionReduced ? 0 : 1
  const targetX = framing.pointerX * PARALLAX_ACROSS * reach
  const targetY = framing.pointerY * PARALLAX_UP * reach
  framing.shiftX = damp(framing.shiftX, targetX, PARALLAX_EASE_RATE, dt)
  framing.shiftY = damp(framing.shiftY, targetY, PARALLAX_EASE_RATE, dt)
}

export function fitLens(
  camera: THREE.PerspectiveCamera,
  framing: DepthsFraming,
  width: number,
  height: number,
  isRaised: boolean
) {
  camera.aspect = width / height
  const horizontalHalfSpan =
    Math.tan(degToRad(DEPTHS_CAMERA_FOV) / 2) * DEPTHS_CAMERA_REFERENCE_ASPECT
  camera.fov = Math.min(
    DEPTHS_CAMERA_MAX_FOV,
    THREE.MathUtils.radToDeg(
      2 * Math.atan(horizontalHalfSpan / Math.min(camera.aspect, DEPTHS_CAMERA_REFERENCE_ASPECT))
    )
  )
  const widthPerDistance = Math.tan(degToRad(camera.fov) / 2) * camera.aspect
  const fittingDistance = RUIN_FIT_HALF_WIDTH / widthPerDistance - CAMERA_FOCUS_FORWARD
  const reach = Math.max(1, fittingDistance / CAMERA_DISTANCE)
  framing.cameraDrop = CAMERA_DROP * reach
  framing.cameraBack = CAMERA_BACK * reach
  if (isRaised) {
    camera.setViewOffset(width, height, 0, height * FITTED_VIEW_RAISE, width, height)
  } else {
    camera.clearViewOffset()
  }
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
    focusY - framing.cameraDrop + framing.shiftY,
    CAMERA_FOCUS_FORWARD + framing.cameraBack
  )
  camera.lookAt(focus)
}
