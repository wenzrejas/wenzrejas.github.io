import * as THREE from 'three'
import { playWhaleCall, playWhaleSplash } from '@/audio/wildlifeSounds'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { wildlifePace } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { useWhaleStore } from '@/store/whaleStore'
import { isOnScreen } from '@/utils/screen'
import { ParticlePool } from '@/world/effects/particlePool'
import { tickSpawnTimer } from '../shared/spawnTimer'
import {
  BREACH_VIEW_MARGIN,
  DROP_POOL,
  FIRST_CHECK_DELAY,
  FOAM_POOL,
  GONE_VIEW_MARGIN,
  JUMP_SPLASH_STRENGTH,
  LEAVE_VIEW_MARGIN,
  PLUNGE_SPLASH_STRENGTH,
  PRESENCE_RADIUS,
  WHALE_LENGTH,
} from './constants'
import { emitSplash, trailWake } from './splash'
import { emitSpout } from './spout'
import {
  bodyEndsOf,
  createWhale,
  hasClearRun,
  isDaylight,
  isGone,
  updateWhale,
  type Whale,
  type WhaleView,
} from './whaleMotion'
import { whaleUniforms } from './whaleModel'

interface WhaleSighting {
  whale: Whale | null
  checkTimer: number
  foam: ParticlePool
  drops: ParticlePool
}

const _surfaceSpot = new THREE.Vector3()
const _snout = new THREE.Vector3()
const _tail = new THREE.Vector3()
const _view: WhaleView = { isInFrame: false, isInView: false }

export const createWhaleSighting = (): WhaleSighting => ({
  whale: null,
  checkTimer: FIRST_CHECK_DELAY,
  foam: new ParticlePool(FOAM_POOL),
  drops: new ParticlePool(DROP_POOL),
})

function checkForWhale(sighting: WhaleSighting, camera: THREE.Camera, dt: number) {
  const { whaleChance, whaleInterval } = useDebugStore.getState().wildlife
  const checkInterval = whaleInterval / wildlifePace()
  sighting.checkTimer = tickSpawnTimer(sighting.checkTimer, checkInterval, dt)
  if (sighting.checkTimer > 0) return
  sighting.checkTimer = checkInterval
  const { timeOfDay } = useCycleStore.getState()
  if (!sighting.whale && isDaylight(timeOfDay) && Math.random() < whaleChance) {
    const candidate = createWhale(useShipStore.getState(), camera.position)
    if (hasClearRun(candidate)) sighting.whale = candidate
  }
}

function advanceWhale(
  { foam, drops }: WhaleSighting,
  whale: Whale,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  _surfaceSpot.set(whale.x, 0, whale.z)
  _view.isInFrame = isOnScreen(_surfaceSpot, camera, BREACH_VIEW_MARGIN)
  _view.isInView = isOnScreen(_surfaceSpot, camera, LEAVE_VIEW_MARGIN)
  const stageBefore = whale.stage
  updateWhale(whale, useShipStore.getState(), time, dt, _view)
  if (whale.stage === 'charge' && stageBefore !== 'charge') playWhaleCall()

  if (stageBefore === 'launch' && whale.stage === 'flight') {
    playWhaleSplash('jump')
    emitSplash(foam, drops, whale.x, whale.z, JUMP_SPLASH_STRENGTH)
  }
  if (stageBefore === 'flight' && whale.stage === 'sound') {
    playWhaleSplash('plunge')
    emitSplash(foam, drops, whale.x, whale.z, PLUNGE_SPLASH_STRENGTH)
  }
  emitSpout(drops, whale, dt)
  trailWake(foam, whale)
}

function poseWhaleBody(body: THREE.Mesh, whale: Whale) {
  body.position.set(whale.x, -whale.depth, whale.z)
  body.rotation.set(-whale.pitch, whale.heading, whale.bank + whale.roll, 'YXZ')
  body.visible = true
  whaleUniforms.uPhase.value = whale.phase
  whaleUniforms.uTurnCurve.value = whale.turnCurve
  whaleUniforms.uClimbCurve.value = whale.climbCurve
  whaleUniforms.uFade.value = whale.emergence
}

function isWhaleOutOfSight(whale: Whale, camera: THREE.Camera) {
  bodyEndsOf(whale, _snout, _tail)
  return (
    !isOnScreen(_snout, camera, GONE_VIEW_MARGIN) && !isOnScreen(_tail, camera, GONE_VIEW_MARGIN)
  )
}

function publishPresence({ whale }: WhaleSighting) {
  const presence = useWhaleStore.getState()
  presence.active = whale !== null
  if (!whale) return
  presence.x = whale.x
  presence.z = whale.z
  presence.radius = WHALE_LENGTH * PRESENCE_RADIUS
}

export function stepWhaleSighting(
  sighting: WhaleSighting,
  body: THREE.Mesh,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  checkForWhale(sighting, camera, dt)
  const { whale } = sighting
  if (whale) {
    advanceWhale(sighting, whale, camera, time, dt)
    poseWhaleBody(body, whale)
    if (isGone(whale, isWhaleOutOfSight(whale, camera))) sighting.whale = null
  } else {
    body.visible = false
  }
  publishPresence(sighting)
}
