import * as THREE from 'three'
import { audio } from '@/audio/audioManager'
import { earnAchievement } from '@/store/achievementStore'
import { useCycleStore } from '@/store/cycleStore'
import { useNightEventStore } from '@/store/nightEventStore'
import { isGraphicsSharp, isMotionReduced } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { retain } from '@/utils/array'
import { isOnScreen } from '@/utils/screen'
import { hullGapToPoint } from '@/world/ship/hullCollision'
import {
  LANTERN_AFLOAT_COUNT,
  LANTERN_AFLOAT_SPEED,
  LANTERN_AFLOAT_TURN_RATE,
  LANTERN_FINALE_COUNT,
  LANTERN_FINALE_COUNT_SMOOTH,
  LANTERN_FINALE_SECONDS,
  LANTERN_LEAVE_SECONDS,
  LANTERN_POOL_GONE_HEIGHT,
  LANTERN_REGATHER_DISTANCE,
  LANTERN_SWAY_FULL_HEIGHT,
  LANTERN_TOUCH_CHECK_DISTANCE,
  LANTERN_TOUCH_REACH,
  LANTERN_VIEW_MARGIN,
  LANTERN_WIND_DRIFT,
  LANTERNS_APPEAR_FROM,
  LANTERNS_APPEAR_UNTIL,
} from './constants'
import { heightOf } from './lanternFlight'
import { flock, isWaitingToBeLit, lanternShow, type Lantern } from './lanternFlock'
import { clusterSpots, finaleSpot, type LanternSpot, type LanternView } from './lanternSpots'

const _spot = new THREE.Vector3()

const isDarkEnough = () => {
  const { timeOfDay } = useCycleStore.getState()
  return timeOfDay >= LANTERNS_APPEAR_FROM || timeOfDay < LANTERNS_APPEAR_UNTIL
}

const newLantern = ({ x, z }: LanternSpot, isFinale: boolean): Lantern => ({
  x,
  z,
  driftX: 0,
  driftZ: 0,
  seed: Math.random(),
  ageSeconds: 0,
  litSeconds: isFinale ? 0 : null,
  leaveSeconds: null,
  isFinale,
})

function floatLanterns(view: LanternView) {
  const { x, z, heading } = useShipStore.getState()
  const spots = clusterSpots(x, z, heading, LANTERN_AFLOAT_COUNT, view)
  for (const spot of spots) flock.push(newLantern(spot, false))
  if (spots.length > 0) lanternShow.phase = 'afloat'
}

function regatherIfLeftBehind(unlit: Lantern[], view: LanternView) {
  const { x: shipX, z: shipZ, heading } = useShipStore.getState()
  const isNearby = unlit.some(
    ({ x, z }) => Math.hypot(x - shipX, z - shipZ) < LANTERN_REGATHER_DISTANCE
  )
  if (isNearby) return
  const spots = clusterSpots(shipX, shipZ, heading, unlit.length, view)
  spots.forEach((spot, index) => {
    unlit[index].x = spot.x
    unlit[index].z = spot.z
    unlit[index].ageSeconds = 0
  })
}

function lightTouched(unlit: Lantern[], shipX: number, shipZ: number) {
  let hasLit = false
  for (const lantern of unlit) {
    if (Math.hypot(lantern.x - shipX, lantern.z - shipZ) > LANTERN_TOUCH_CHECK_DISTANCE) continue
    if (hullGapToPoint(lantern.x, lantern.z) > LANTERN_TOUCH_REACH) continue
    lantern.litSeconds = 0
    hasLit = true
  }
  if (hasLit) audio.play('lanternRustle')
}

function tendAfloat(view: LanternView) {
  const { x, z } = useShipStore.getState()
  const unlit = flock.filter(isWaitingToBeLit)
  regatherIfLeftBehind(unlit, view)
  lightTouched(unlit, x, z)
  if (flock.some(isWaitingToBeLit)) return
  lanternShow.phase = 'finale'
  lanternShow.finaleSeconds = 0
  lanternShow.released = 0
}

function releaseFinale(dt: number, view: LanternView) {
  const total = isGraphicsSharp() ? LANTERN_FINALE_COUNT : LANTERN_FINALE_COUNT_SMOOTH
  lanternShow.finaleSeconds += dt
  const due = Math.min(
    total,
    Math.ceil((total * lanternShow.finaleSeconds) / LANTERN_FINALE_SECONDS)
  )
  const { x, z } = useShipStore.getState()
  while (lanternShow.released < due) {
    lanternShow.released += 1
    const spot = finaleSpot(x, z, view)
    if (spot) flock.push(newLantern(spot, true))
  }
  if (lanternShow.released < total) return
  earnAchievement('lanternFestival')
  if (flock.length === 0) lanternShow.phase = 'idle'
}

function sendUnlitAway() {
  for (const lantern of flock) {
    if (isWaitingToBeLit(lantern)) lantern.leaveSeconds = 0
  }
}

function circleAfloat(lantern: Lantern, dt: number) {
  const heading = lantern.seed * Math.PI * 2 + lantern.ageSeconds * LANTERN_AFLOAT_TURN_RATE
  lantern.x += Math.sin(heading) * LANTERN_AFLOAT_SPEED * dt
  lantern.z += Math.cos(heading) * LANTERN_AFLOAT_SPEED * dt
}

function advanceFlock(dt: number, camera: THREE.Camera) {
  const wind = useWindStore.getState().dir
  const drift = LANTERN_WIND_DRIFT * useWeatherStore.getState().windMult * dt
  const isDrifting = !isMotionReduced()
  retain(flock, (lantern) => {
    lantern.ageSeconds += dt
    if (lantern.leaveSeconds !== null) {
      lantern.leaveSeconds += dt
      return lantern.leaveSeconds < LANTERN_LEAVE_SECONDS
    }
    if (lantern.litSeconds === null) {
      if (isDrifting) circleAfloat(lantern, dt)
      return true
    }
    lantern.litSeconds += dt
    const height = heightOf(lantern)
    const driftShare = lantern.isFinale
      ? 1
      : THREE.MathUtils.smoothstep(height, 0, LANTERN_SWAY_FULL_HEIGHT)
    lantern.driftX += wind.x * drift * driftShare
    lantern.driftZ += wind.y * drift * driftShare
    if (height < LANTERN_POOL_GONE_HEIGHT) return true
    _spot.set(lantern.x + lantern.driftX, height, lantern.z + lantern.driftZ)
    return isOnScreen(_spot, camera, LANTERN_VIEW_MARGIN)
  })
}

export function stepLanternEvent(dt: number, view: LanternView, camera: THREE.Camera) {
  const { kind, run, isForced } = useNightEventStore.getState()
  const isOn = kind === 'lanterns'

  if (run !== lanternShow.run) {
    lanternShow.run = run
    flock.length = 0
    lanternShow.phase = isOn ? 'waiting' : 'idle'
  }

  if (lanternShow.phase === 'waiting') {
    if (!isOn) lanternShow.phase = 'idle'
    else if (isForced || isDarkEnough()) floatLanterns(view)
  }

  if (lanternShow.phase === 'afloat') {
    if (isOn) tendAfloat(view)
    else {
      sendUnlitAway()
      lanternShow.phase = 'idle'
    }
  }

  if (lanternShow.phase === 'finale') releaseFinale(dt, view)

  advanceFlock(dt, camera)
}
