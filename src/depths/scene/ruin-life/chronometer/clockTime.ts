import * as THREE from 'three'
import type { Surfacing } from '@/depths/scene/surfacing/surfacing'
import { meshesOf } from '@/utils/meshes'
import { glowLevelsOf, shineGlow, type GlowLevel } from '../shared/glowLevels'
import { turnFromRest } from '../shared/restingTurn'
import { materialNameOf, ruinPoints } from '../shared/ruinPoints'
import { wakeGlow } from '../shared/ruinWake'
import {
  CABOCHON_MATERIAL,
  CABOCHON_TICK_DECAY,
  CABOCHON_TICK_GLOW,
  CHIME_FLASH,
  CHIME_SECONDS,
  CHIME_STRENGTH,
  DEGREES_PER_HOUR_MARK,
  DEGREES_PER_MINUTE_MARK,
  ESCAPEMENT_STEP_DEGREES,
  HOURS_PER_FACE,
  MINUTES_PER_HOUR,
  REWIND_RAMP_SECONDS,
  REWIND_SECONDS_HAND_SHARE,
  REWIND_TURN_PEAK,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  TICK_OVERSHOOT,
  TICK_SECONDS,
} from './constants'

type HandKind = 'hour' | 'minute' | 'seconds'

interface ClockHand {
  node: THREE.Object3D
  kind: HandKind
  authoredDegrees: number
}

interface ClockGear {
  node: THREE.Object3D
  stepShare: number
}

export interface Chronometer {
  hands: ClockHand[]
  gears: ClockGear[]
  cabochon: GlowLevel[]
  timezoneSeconds: number
  chimeStartedAt: number | null
  wasLanded: boolean
  rewindTurns: number
}

const FACING = new THREE.Vector3(0, 0, 1)
const { degToRad, clamp } = THREE.MathUtils

function isWithin(mesh: THREE.Object3D, part: THREE.Object3D) {
  for (let node: THREE.Object3D | null = mesh; node; node = node.parent) {
    if (node === part) return true
  }
  return false
}

function farthestReach(ruin: THREE.Object3D, part: THREE.Object3D) {
  const pivot = part.position
  let reach = 0
  let degrees = 0
  for (const point of ruinPoints(
    ruin,
    (mesh) => isWithin(mesh, part),
    () => true
  )) {
    const distance = Math.hypot(point.x - pivot.x, point.y - pivot.y)
    if (distance <= reach) continue
    reach = distance
    degrees = THREE.MathUtils.radToDeg(Math.atan2(point.x - pivot.x, point.y - pivot.y))
  }
  return { reach, degrees }
}

const handKindOf = ({ name }: THREE.Object3D): HandKind =>
  name.includes('seconds') ? 'seconds' : name.includes('minute') ? 'minute' : 'hour'

function nearestOther(parts: THREE.Object3D[], index: number) {
  let nearest = -1
  let nearestDistance = Infinity
  parts.forEach((other, otherIndex) => {
    const distance = parts[index].position.distanceTo(other.position)
    if (otherIndex === index || distance >= nearestDistance) return
    nearest = otherIndex
    nearestDistance = distance
  })
  return nearest
}

function meshGears(ruin: THREE.Object3D, parts: THREE.Object3D[]): ClockGear[] {
  const reaches = parts.map((part) => farthestReach(ruin, part).reach)
  return parts.map((part, index) => {
    const partner = nearestOther(parts, index)
    const isDriver = partner < 0 || reaches[index] >= reaches[partner]
    const driver = isDriver ? index : partner
    const direction = parts[driver].position.x < 0 ? -1 : 1
    const stepShare = isDriver ? direction : -direction * (reaches[driver] / reaches[index])
    return { node: part, stepShare }
  })
}

export function findChronometer(ruin: THREE.Object3D): Chronometer {
  const hands = ruin.children
    .filter((child) => child.userData.role === 'clock_hand')
    .map((node) => ({
      node,
      kind: handKindOf(node),
      authoredDegrees: farthestReach(ruin, node).degrees,
    }))
  const gears = meshGears(
    ruin,
    ruin.children.filter((child) => child.userData.role === 'clock_gear')
  )
  return {
    hands,
    gears,
    cabochon: glowLevelsOf(
      meshesOf(ruin).filter((mesh) => materialNameOf(mesh).startsWith(CABOCHON_MATERIAL))
    ),
    timezoneSeconds: new Date().getTimezoneOffset() * 60,
    chimeStartedAt: null,
    wasLanded: false,
    rewindTurns: 0,
  }
}

export function stepClockRewind(
  chronometer: Chronometer,
  { isRewinding, seconds }: Surfacing,
  dt: number
) {
  if (!isRewinding) return
  const drive = THREE.MathUtils.smoothstep(seconds, 0, REWIND_RAMP_SECONDS)
  chronometer.rewindTurns += REWIND_TURN_PEAK * drive * dt
}

function tickEase(secondShare: number) {
  const progress = clamp(secondShare / TICK_SECONDS, 0, 1) - 1
  return 1 + (TICK_OVERSHOOT + 1) * progress ** 3 + TICK_OVERSHOOT * progress ** 2
}

const turnClockwise = (node: THREE.Object3D, degrees: number) =>
  turnFromRest(node, FACING, -degToRad(degrees))

export function tickClock(
  { hands, gears, timezoneSeconds, rewindTurns }: Chronometer,
  epochSeconds: number
) {
  const localSeconds = (epochSeconds - timezoneSeconds) % SECONDS_PER_DAY
  const wholeSeconds = Math.floor(localSeconds)
  const tickedSeconds = wholeSeconds - 1 + tickEase(localSeconds - wholeSeconds)
  const minuteRewindDegrees = rewindTurns * 360
  const secondsRewindDegrees = minuteRewindDegrees * REWIND_SECONDS_HAND_SHARE
  const handDegrees: Record<HandKind, number> = {
    seconds: (tickedSeconds % SECONDS_PER_MINUTE) * DEGREES_PER_MINUTE_MARK - secondsRewindDegrees,
    minute:
      ((tickedSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR) * DEGREES_PER_MINUTE_MARK -
      minuteRewindDegrees,
    hour:
      ((tickedSeconds / SECONDS_PER_HOUR) % HOURS_PER_FACE) * DEGREES_PER_HOUR_MARK -
      minuteRewindDegrees / HOURS_PER_FACE,
  }
  for (const { node, kind, authoredDegrees } of hands) {
    turnClockwise(node, handDegrees[kind] - authoredDegrees)
  }
  const stepDegrees = ((tickedSeconds * ESCAPEMENT_STEP_DEGREES) % 360) - secondsRewindDegrees
  for (const { node, stepShare } of gears) turnClockwise(node, stepDegrees * stepShare)
}

export function listenForLanding(chronometer: Chronometer, isLanded: boolean, time: number) {
  if (isLanded && !chronometer.wasLanded) chronometer.chimeStartedAt = time
  chronometer.wasLanded = isLanded
}

export const chimeProgress = ({ chimeStartedAt }: Chronometer, time: number) =>
  chimeStartedAt === null ? 1 : Math.min((time - chimeStartedAt) / CHIME_SECONDS, 1)

export function ringChime(material: THREE.ShaderMaterial, progress: number) {
  material.uniforms.uProgress.value = progress
  material.uniforms.uStrength.value = CHIME_STRENGTH
}

export function glowCabochon(
  chronometer: Chronometer,
  epochSeconds: number,
  time: number,
  wake: number
) {
  const secondShare = epochSeconds % 1
  const chime = 1 - chimeProgress(chronometer, time)
  const tick = CABOCHON_TICK_GLOW * Math.exp(-secondShare * CABOCHON_TICK_DECAY)
  shineGlow(chronometer.cabochon, wakeGlow(wake) * (1 + tick + CHIME_FLASH * chime * chime))
}
