import {
  ABANDON_DISTANCE,
  ABANDON_SECONDS,
  BRONZE_RATIO,
  GATE_HALF_WIDTH,
  GHOST_TRACK_MIN_VALUES,
  PASS_TOLERANCE,
  PERFECT_CALL_SECONDS,
  PERFECT_REACH,
  SHOWN_TENTHS,
  SILVER_RATIO,
  START_BESIDE_BUOY,
  SURGE_LEVELS,
  SURGE_SECONDS,
} from './constants'
import { COURSE_KEYS, COURSES, type CourseKey, type CoursePoint } from './courses'
import type { Arrival } from './raceArrival'

export interface Gate {
  x: number
  z: number
  facingX: number
  facingZ: number
}

export interface BestLap {
  splits: number[]
  track: number[]
}

export interface Run {
  course: CourseKey
  placements: number
  arrival: Arrival
  readySeconds: number
  passed: number
  seconds: number
  straySeconds: number
  streak: number
  surgeSeconds: number
  callSeconds: number
  perfects: number
  splits: number[]
  track: number[]
  rival: BestLap | null
  splitGap: number
  splitSeconds: number
}

export type Medal = 'gold' | 'silver' | 'bronze'
type RunStep = 'go' | 'passed' | 'perfect' | 'finished' | 'strayed' | null

const perCourse = <Value>(valueOf: (course: CourseKey) => Value) =>
  Object.fromEntries(COURSE_KEYS.map((course) => [course, valueOf(course)])) as Record<
    CourseKey,
    Value
  >

export const buoyOf = (course: CourseKey): CoursePoint => COURSES[course].buoy

export function gapToBuoy(course: CourseKey, x: number, z: number) {
  const buoy = buoyOf(course)
  return Math.hypot(x - buoy.x, z - buoy.z)
}

export const isBuoyWithin = (x: number, z: number, reach: number) =>
  COURSE_KEYS.some((course) => gapToBuoy(course, x, z) < reach)

const START_SPOTS = perCourse((course): CoursePoint => {
  const { buoy, rings } = COURSES[course]
  const towardsX = rings[0].x - buoy.x
  const towardsZ = rings[0].z - buoy.z
  const length = Math.hypot(towardsX, towardsZ)
  return {
    x: buoy.x - (towardsZ / length) * START_BESIDE_BUOY,
    z: buoy.z + (towardsX / length) * START_BESIDE_BUOY,
  }
})

export const startSpotOf = (course: CourseKey) => START_SPOTS[course]

export function startHeadingOf(course: CourseKey) {
  const { x, z } = COURSES[course].rings[0]
  const spot = START_SPOTS[course]
  return Math.atan2(x - spot.x, z - spot.z)
}

export const COURSE_WINDS = perCourse((course) => ({
  x: Math.cos(COURSES[course].windAngle),
  y: -Math.sin(COURSES[course].windAngle),
}))

function gateBetween(previous: CoursePoint, point: CoursePoint, next: CoursePoint): Gate {
  const length = Math.hypot(next.x - previous.x, next.z - previous.z)
  return {
    x: point.x,
    z: point.z,
    facingX: (next.x - previous.x) / length,
    facingZ: (next.z - previous.z) / length,
  }
}

export const GATE_SIDES = [1, -1]

export const acrossGateX = ({ x, facingZ }: Gate, reach: number) => x + facingZ * reach

export const acrossGateZ = ({ z, facingX }: Gate, reach: number) => z - facingX * reach

export const COURSE_GATES = perCourse((course) => {
  const { buoy, rings, finish } = COURSES[course]
  const points = [START_SPOTS[course], ...rings, finish, buoy]
  return points.slice(1, -1).map((point, i) => gateBetween(points[i], point, points[i + 2]))
})

export const MOST_GATES = Math.max(...COURSE_KEYS.map((course) => COURSE_GATES[course].length))

function offCentreOfPass(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  gate: Gate
): number | null {
  const before = (fromX - gate.x) * gate.facingX + (fromZ - gate.z) * gate.facingZ
  const after = (toX - gate.x) * gate.facingX + (toZ - gate.z) * gate.facingZ
  if (before >= 0 || after < 0) return null
  const share = before / (before - after)
  const acrossX = fromX + (toX - fromX) * share - gate.x
  const acrossZ = fromZ + (toZ - fromZ) * share - gate.z
  const offCentre = Math.abs(acrossZ * gate.facingX - acrossX * gate.facingZ)
  return offCentre <= GATE_HALF_WIDTH + PASS_TOLERANCE ? offCentre : null
}

export const isLapUsable = (course: CourseKey, lap: BestLap | undefined): lap is BestLap =>
  lap !== undefined &&
  lap.splits.length === COURSE_GATES[course].length &&
  lap.track.length >= GHOST_TRACK_MIN_VALUES

const isOnFinish = (run: Run) => run.passed === COURSES[run.course].rings.length

export const nextGateOf = (run: Run) => COURSE_GATES[run.course][run.passed]

export const surgeBoostOf = ({ streak, surgeSeconds }: Run) =>
  surgeSeconds > 0 ? SURGE_LEVELS[streak - 1] : 0

export function stepRun(
  run: Run,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  dt: number
): RunStep {
  if (run.readySeconds > 0) {
    run.readySeconds = Math.max(0, run.readySeconds - dt)
    return run.readySeconds === 0 ? 'go' : null
  }
  run.seconds += dt
  run.surgeSeconds = Math.max(0, run.surgeSeconds - dt)
  run.callSeconds = Math.max(0, run.callSeconds - dt)
  run.splitSeconds = Math.max(0, run.splitSeconds - dt)
  const gate = nextGateOf(run)
  const offCentre = offCentreOfPass(fromX, fromZ, toX, toZ, gate)
  if (offCentre !== null) {
    if (isOnFinish(run)) return 'finished'
    run.passed += 1
    run.straySeconds = 0
    if (offCentre > PERFECT_REACH) {
      run.streak = 0
      run.surgeSeconds = 0
      run.callSeconds = 0
      return 'passed'
    }
    run.streak = Math.min(run.streak + 1, SURGE_LEVELS.length)
    run.surgeSeconds = SURGE_SECONDS
    run.callSeconds = PERFECT_CALL_SECONDS
    run.perfects += 1
    return 'perfect'
  }
  const isAstray = Math.hypot(toX - gate.x, toZ - gate.z) > ABANDON_DISTANCE
  run.straySeconds = isAstray ? run.straySeconds + dt : 0
  return run.straySeconds >= ABANDON_SECONDS ? 'strayed' : null
}

export function medalFor(course: CourseKey, seconds: number | undefined): Medal | null {
  if (seconds === undefined) return null
  const gold = COURSES[course].goldSeconds
  const shown = Math.round(seconds * SHOWN_TENTHS) / SHOWN_TENTHS
  if (shown <= gold) return 'gold'
  if (shown <= gold * SILVER_RATIO) return 'silver'
  if (shown <= gold * BRONZE_RATIO) return 'bronze'
  return null
}
