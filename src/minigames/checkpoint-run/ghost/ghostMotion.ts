import * as THREE from 'three'
import { useCheckpointStore } from '@/store/checkpointStore'
import { useDebugStore } from '@/store/debugStore'
import { mix, wrapAngle } from '@/utils/math'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import { shipBobHeight } from '@/world/ship/shipBob'
import {
  GHOST_END_FADE_SECONDS,
  GHOST_NIGHT_STRENGTH,
  GHOST_SHOW_SECONDS,
  GHOST_TURN_RATE,
} from '../constants'
import { startHeadingOf } from '../checkpointRun'
import { isArriving } from '../raceArrival'
import { poseTrack, type GhostPose } from './ghostTrack'

const { clamp, damp } = THREE.MathUtils

const _pose: GhostPose = { x: 0, z: 0, heading: 0 }

interface GhostMotion {
  presence: number
  heading: number
}

export const createGhostMotion = (): GhostMotion => ({ presence: 0, heading: 0 })

export function stepGhost(
  motion: GhostMotion,
  group: THREE.Group,
  footprint: number,
  time: number,
  delta: number
): number {
  const { run, ghostSpot } = useCheckpointStore.getState()
  if (!run?.rival || isArriving(run)) {
    motion.presence = 0
    ghostSpot.isShown = false
    return 0
  }

  const { rival, seconds } = run
  const dt = Math.min(delta, MAX_FRAME_SECONDS)
  _pose.heading = motion.presence === 0 ? startHeadingOf(run.course) : motion.heading
  poseTrack(rival.track, seconds, _pose)
  motion.heading =
    motion.presence === 0
      ? _pose.heading
      : motion.heading + damp(0, wrapAngle(_pose.heading - motion.heading), GHOST_TURN_RATE, dt)
  motion.presence = clamp(motion.presence + dt / GHOST_SHOW_SECONDS, 0, 1)

  const overtime = seconds - rival.splits[rival.splits.length - 1]
  const ending = clamp(1 - overtime / GHOST_END_FADE_SECONDS, 0, 1)

  const shipTuning = useDebugStore.getState().ship
  group.position.set(_pose.x, shipBobHeight(shipTuning, time, _pose.x, _pose.z), _pose.z)
  group.rotation.y = motion.heading
  group.scale.setScalar(shipTuning.modelSize / footprint)

  ghostSpot.x = _pose.x
  ghostSpot.z = _pose.z
  ghostSpot.isShown = ending > 0

  return motion.presence * ending * mix(1, GHOST_NIGHT_STRENGTH, nightGlow())
}
