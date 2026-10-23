import * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { isAscentStage, isRising, type DiveRun } from '../dive'
import { RISING_SECONDS } from '../surfacingPace'
import {
  DIAL_HOURS,
  SIGIL_DIAL_SHARE,
  SIGIL_EMERGE_GROWTH,
  SIGIL_FLARE_FROM,
  SIGIL_GHOST_SHARE,
  SIGIL_HOUR_START_DEGREES,
  SIGIL_MINUTE_START_DEGREES,
  SIGIL_REVEAL_SECONDS,
  SIGIL_SECONDS_HAND_SHARE,
  SIGIL_SECONDS_START_DEGREES,
} from './constants'

const { degToRad, smoothstep, smootherstep } = THREE.MathUtils

const HOUR_START = degToRad(SIGIL_HOUR_START_DEGREES)
const MINUTE_START = degToRad(SIGIL_MINUTE_START_DEGREES)
const SECONDS_START = degToRad(SIGIL_SECONDS_START_DEGREES)

export const isSigilShown = (run: DiveRun) => run.isRewinding && isAscentStage(run)

const sigilReveal = (run: DiveRun) =>
  isRising(run) ? smootherstep(run.seconds, 0, SIGIL_REVEAL_SECONDS) : 1

const sigilFlare = (run: DiveRun) =>
  isRising(run) ? smoothstep(run.seconds / RISING_SECONDS, SIGIL_FLARE_FROM, 1) : run.cover

const sigilPresence = (run: DiveRun) => (isRising(run) ? 1 : run.cover)

const sigilGrowth = (run: DiveRun) =>
  isRising(run) ? 1 : 1 + SIGIL_EMERGE_GROWTH * (1 - run.cover)

export function paintSigil(
  material: THREE.ShaderMaterial,
  run: DiveRun,
  time: number,
  aspect: number
) {
  const { uniforms } = material
  const rewound = run.rewindTurns * FULL_TURN
  uniforms.uPresence.value = sigilPresence(run)
  uniforms.uReveal.value = sigilReveal(run)
  uniforms.uFlare.value = sigilFlare(run)
  uniforms.uGrowth.value = sigilGrowth(run)
  uniforms.uDialTurn.value = -rewound * SIGIL_DIAL_SHARE
  uniforms.uGhostTurn.value = rewound * SIGIL_GHOST_SHARE
  uniforms.uMinuteAngle.value = MINUTE_START - rewound
  uniforms.uHourAngle.value = HOUR_START - rewound / DIAL_HOURS
  uniforms.uSecondsAngle.value = SECONDS_START - rewound * SIGIL_SECONDS_HAND_SHARE
  uniforms.uTime.value = time
  uniforms.uAspect.value = aspect
}
