import * as THREE from 'three'
import { useCinematicStore } from '@/store/cinematicStore'
import { mix } from '@/utils/math'
import { SHORE_Y } from '@/world/shore/constants'
import {
  BUBBLE_EMERGE_SLOWDOWN,
  BUBBLE_RUSH_PEAK,
  BUBBLE_RUSH_START,
} from './ascent-bubbles/constants'
import {
  DEPTHS_WAIT_LIMIT_SECONDS,
  DIVE_FOCUS_UNTIL,
  DIVE_SECONDS,
  DIVE_SPIN_DEGREES,
  DIVE_VEIL_FROM,
  DIVE_ZOOM,
  EMERGE_FOCUS_FROM,
  EMERGE_SECONDS,
  EMERGE_VEIL_UNTIL,
  EMERGE_ZOOM,
  REWIND_VEIL_FROM,
  SURFACING_VEIL_FROM,
  VEIL_FADE_SECONDS,
  VEIL_HOLD_SECONDS,
} from './constants'
import { SIGIL_TURN_PEAK } from './rewind-sigil/constants'
import { ascentShare, RISING_SECONDS } from './surfacingPace'

type VeilStage = 'idle' | 'closing' | 'fading' | 'rising' | 'emerging'

export type DiveEvent = 'arrived' | 'aborted' | 'surfaced' | 'settled' | null

interface DiveLook {
  focusBlend: number
  focusZoom: number
  spin: number
}

interface ShipPose {
  x: number
  z: number
  heading: number
}

interface DepthsReadiness {
  isReady: boolean
  hasFailed: boolean
}

export interface DiveRun {
  stage: VeilStage
  seconds: number
  heldSeconds: number
  cover: number
  opacity: number
  isAscending: boolean
  isRewinding: boolean
  ascentSeconds: number
  bubbleTravel: number
  rewindTurns: number
  focus: THREE.Vector3
  shipPose: ShipPose
  look: DiveLook
  emergeFrom: DiveLook & { cover: number }
}

const { smoothstep, smootherstep, degToRad } = THREE.MathUtils

const DIVE_SPIN = degToRad(DIVE_SPIN_DEGREES)

export const createDiveRun = (): DiveRun => ({
  stage: 'idle',
  seconds: 0,
  heldSeconds: 0,
  cover: 0,
  opacity: 1,
  isAscending: false,
  isRewinding: false,
  ascentSeconds: 0,
  bubbleTravel: 0,
  rewindTurns: 0,
  focus: new THREE.Vector3(),
  shipPose: { x: 0, z: 0, heading: 0 },
  look: { focusBlend: 0, focusZoom: 1, spin: 0 },
  emergeFrom: { focusBlend: 0, focusZoom: 1, spin: 0, cover: 0 },
})

function enterStage(run: DiveRun, stage: VeilStage) {
  run.stage = stage
  run.seconds = 0
}

function emerge(run: DiveRun, isAscending: boolean) {
  Object.assign(run.emergeFrom, run.look, { cover: run.cover })
  run.isAscending = isAscending
  enterStage(run, 'emerging')
}

export function startDive(run: DiveRun, eye: { x: number; z: number }, ship: ShipPose) {
  run.focus.set(eye.x, SHORE_Y, eye.z)
  run.shipPose.x = ship.x
  run.shipPose.z = ship.z
  run.shipPose.heading = ship.heading
  run.heldSeconds = 0
  run.opacity = 1
  run.isAscending = false
  run.isRewinding = false
  enterStage(run, 'closing')
}

export function startSurfacing(run: DiveRun, isRewinding: boolean) {
  run.opacity = 1
  run.isAscending = true
  run.isRewinding = isRewinding
  run.ascentSeconds = 0
  run.bubbleTravel = 0
  run.rewindTurns = 0
  enterStage(run, 'rising')
}

function spinRewind(run: DiveRun, drive: number, dt: number) {
  if (run.isRewinding) run.rewindTurns += SIGIL_TURN_PEAK * drive * dt
}

function rushBubbles(run: DiveRun, rush: number, dt: number) {
  run.ascentSeconds += dt
  run.bubbleTravel += rush * dt
}

export function endDive(run: DiveRun) {
  run.cover = 0
  run.opacity = 1
  enterStage(run, 'idle')
}

function stepClosing(run: DiveRun, dt: number, depths: DepthsReadiness): DiveEvent {
  const progress = Math.min(run.seconds / DIVE_SECONDS, 1)
  const glide = smootherstep(progress, 0, 1)
  run.look.focusBlend = smootherstep(progress, 0, DIVE_FOCUS_UNTIL)
  run.look.focusZoom = DIVE_ZOOM ** glide
  run.look.spin = DIVE_SPIN * glide
  run.cover = smoothstep(progress, DIVE_VEIL_FROM, 1)

  if (depths.hasFailed) {
    emerge(run, false)
    return 'aborted'
  }
  if (progress < 1) return null
  run.heldSeconds += dt
  if (depths.isReady && run.heldSeconds >= VEIL_HOLD_SECONDS) {
    enterStage(run, 'fading')
    return 'arrived'
  }
  if (run.heldSeconds < DEPTHS_WAIT_LIMIT_SECONDS) return null
  emerge(run, false)
  return 'aborted'
}

function stepFading(run: DiveRun) {
  run.opacity = 1 - smoothstep(run.seconds / VEIL_FADE_SECONDS, 0, 1)
  if (run.opacity > 0) return
  run.cover = 0
  run.opacity = 1
  enterStage(run, 'idle')
}

function stepRising(run: DiveRun, dt: number): DiveEvent {
  spinRewind(run, smoothstep(run.seconds / RISING_SECONDS, 0, 1), dt)
  const progress = ascentShare(run.seconds)
  if (progress <= 0) return null
  rushBubbles(run, mix(BUBBLE_RUSH_START, BUBBLE_RUSH_PEAK, smootherstep(progress, 0, 1)), dt)
  run.cover = smoothstep(progress, run.isRewinding ? REWIND_VEIL_FROM : SURFACING_VEIL_FROM, 1)
  if (run.cover < 1) return null
  run.look.focusBlend = 1
  run.look.focusZoom = EMERGE_ZOOM
  run.look.spin = 0
  emerge(run, true)
  return 'surfaced'
}

function stepEmerging(run: DiveRun, dt: number): DiveEvent {
  const progress = Math.min(run.seconds / EMERGE_SECONDS, 1)
  if (run.isAscending) {
    rushBubbles(run, BUBBLE_RUSH_PEAK * (1 - BUBBLE_EMERGE_SLOWDOWN * progress), dt)
  }
  spinRewind(run, 1 - progress, dt)
  const { emergeFrom } = run
  run.look.focusBlend = emergeFrom.focusBlend * (1 - smoothstep(progress, EMERGE_FOCUS_FROM, 1))
  run.look.focusZoom = mix(emergeFrom.focusZoom, 1, smoothstep(progress, 0, 1))
  run.look.spin = emergeFrom.spin * (1 - smoothstep(progress, 0, 1))
  run.cover = emergeFrom.cover * (1 - smoothstep(progress, 0, EMERGE_VEIL_UNTIL))
  if (progress < 1) return null
  enterStage(run, 'idle')
  return 'settled'
}

export function stepDive(run: DiveRun, dt: number, depths: DepthsReadiness): DiveEvent {
  run.seconds += dt
  switch (run.stage) {
    case 'closing':
      return stepClosing(run, dt, depths)
    case 'fading':
      stepFading(run)
      return null
    case 'rising':
      return stepRising(run, dt)
    case 'emerging':
      return stepEmerging(run, dt)
    default:
      return null
  }
}

export const isSteeringCamera = ({ stage }: DiveRun) => stage === 'closing' || stage === 'emerging'

export const isRising = ({ stage }: DiveRun) => stage === 'rising'

export const isAscentStage = ({ stage }: DiveRun) => stage === 'rising' || stage === 'emerging'

export function steerCamera({ focus, look }: DiveRun) {
  const cinematic = useCinematicStore.getState()
  cinematic.isPlaying = true
  cinematic.focus.copy(focus)
  cinematic.focusBlend = look.focusBlend
  cinematic.focusZoom = look.focusZoom
  cinematic.spin = look.spin
}

export function releaseCamera() {
  const cinematic = useCinematicStore.getState()
  cinematic.isPlaying = false
  cinematic.focusBlend = 0
  cinematic.focusZoom = 1
  cinematic.spin = 0
}
