import * as THREE from 'three'
import { audio } from '@/audio/audioManager'
import { FULL_TURN } from '@/utils/math'
import { levelDepth } from '../timeline/timeline'
import {
  WHALE_DEPTH_Z,
  WHALE_EXIT_MARGIN,
  WHALE_HOME_LEVEL,
  WHALE_HOME_RISE,
  WHALE_LENGTH,
  WHALE_PASS_SECONDS,
  WHALE_REST_SECONDS,
  WHALE_ROLL_DEGREES,
  WHALE_SHOWS_FROM_LEVEL,
  WHALE_SWELL_HEIGHT,
  WHALE_SWELLS_PER_PASS,
  WHALE_TURN_TO_CAMERA_DEGREES,
} from './constants'

export interface WhalePass {
  seconds: number
  passes: number
  isPassing: boolean
  heading: number
  enterFrom: number
  exitTo: number
}

const { degToRad, lerp } = THREE.MathUtils

const ROLL = degToRad(WHALE_ROLL_DEGREES)
const TURN_TO_CAMERA = degToRad(WHALE_TURN_TO_CAMERA_DEGREES)
const HALF_LENGTH_ACROSS = (WHALE_LENGTH / 2) * Math.cos(TURN_TO_CAMERA)
const HALF_LENGTH_DEEP = (WHALE_LENGTH / 2) * Math.sin(TURN_TO_CAMERA)
const HOME_RUIN_Y = levelDepth(WHALE_HOME_LEVEL) + WHALE_HOME_RISE

export const createWhalePass = (): WhalePass => ({
  seconds: 0,
  passes: 0,
  isPassing: false,
  heading: -1,
  enterFrom: 0,
  exitTo: 0,
})

function fitTravelToView(pass: WhalePass, camera: THREE.PerspectiveCamera) {
  const halfViewPerDistance =
    Math.tan(degToRad(camera.fov / 2)) * camera.aspect * (1 + WHALE_EXIT_MARGIN)
  const distance = camera.position.z - WHALE_DEPTH_Z
  pass.enterFrom = HALF_LENGTH_ACROSS + halfViewPerDistance * (distance - HALF_LENGTH_DEEP)
  pass.exitTo = HALF_LENGTH_ACROSS + halfViewPerDistance * (distance + HALF_LENGTH_DEEP)
}

const hasRested = (pass: WhalePass) => pass.passes === 0 || pass.seconds >= WHALE_REST_SECONDS

export function advanceWhalePass(
  pass: WhalePass,
  dt: number,
  viewedLevel: number,
  camera: THREE.PerspectiveCamera
) {
  pass.seconds += dt
  if (pass.isPassing) {
    if (pass.seconds < WHALE_PASS_SECONDS) return
    Object.assign(pass, { isPassing: false, seconds: 0, passes: pass.passes + 1 })
  }
  fitTravelToView(pass, camera)
  if (hasRested(pass) && viewedLevel >= WHALE_SHOWS_FROM_LEVEL) {
    Object.assign(pass, { isPassing: true, seconds: 0, heading: -pass.heading })
    audio.play('whale')
  }
}

const passShareOf = (pass: WhalePass) => (pass.isPassing ? pass.seconds / WHALE_PASS_SECONDS : 1)

const timesFartherThanRuins = ({ position }: THREE.PerspectiveCamera) =>
  (position.z - WHALE_DEPTH_Z) / position.z

export function poseWhale(
  body: THREE.Object3D,
  swimTime: { value: number },
  pass: WhalePass,
  camera: THREE.PerspectiveCamera,
  time: number
) {
  const share = passShareOf(pass)
  const swell = share * WHALE_SWELLS_PER_PASS * FULL_TURN
  const climb =
    (WHALE_SWELL_HEIGHT * WHALE_SWELLS_PER_PASS * FULL_TURN) / (pass.enterFrom + pass.exitTo)
  const facing = pass.heading > 0 ? Math.PI / 2 - TURN_TO_CAMERA : -Math.PI / 2 + TURN_TO_CAMERA
  const timesFarther = timesFartherThanRuins(camera)
  const { x: cameraX, y: cameraY } = camera.position
  body.position.x =
    pass.heading * lerp(-pass.enterFrom, pass.exitTo, share) + (1 - timesFarther) * cameraX
  body.position.y =
    cameraY + timesFarther * (HOME_RUIN_Y - cameraY) + Math.sin(swell) * WHALE_SWELL_HEIGHT
  body.rotation.set(-Math.atan(Math.cos(swell) * climb), facing, Math.sin(swell) * ROLL, 'YXZ')
  swimTime.value = time
}
