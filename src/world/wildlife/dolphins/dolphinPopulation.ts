import * as THREE from 'three'
import { updateDolphinCalls } from '@/audio/wildlifeSounds'
import { earnAchievement } from '@/store/achievementStore'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { wildlifePace } from '@/store/settingsStore'
import { useShipStore, type ShipState } from '@/store/shipStore'
import { isRaining } from '@/store/weatherStore'
import { useWhaleStore } from '@/store/whaleStore'
import { wrapAngle } from '@/utils/math'
import { ParticlePool } from '@/world/effects/particlePool'
import { isOpenWater } from '@/world/islands/shared/islandZones'
import { algaeAt } from '@/world/wildlife/algae/algaeField'
import { instancedAttribute, publishInstances } from '../shared/instanceData'
import { tickSpawnTimer } from '../shared/spawnTimer'
import { depthFade } from '../shared/wildlifeMaterial'
import {
  AIRBORNE_FLUKE_SHARE,
  BANK_FACTOR,
  BANK_LIMIT,
  DOLPHIN_LENGTH,
  DROP_POOL,
  FADE_START_DEPTH,
  FIN_BACK_SHARE,
  FIN_HEIGHT,
  FIN_WAKE_MIN_SPEED,
  FIN_WAKE_SPACING,
  FIRST_CHECK_DELAY,
  FLUKE_FREQUENCY,
  FOAM_POOL,
  HIDDEN_DEPTH,
  IDLE_SHIP_SPEED,
  LEAP_PITCH_BOOST,
  LEAP_PITCH_MAX,
  OPEN_WATER_GAP,
  ORBIT_RATE,
  ORBIT_SETTLE,
  PITCH_SMOOTH,
  SPLASH_ENTRY_DROPS,
  SPLASH_ENTRY_STRENGTH,
  SPLASH_EXIT_DROPS,
  SPLASH_EXIT_STRENGTH,
} from './constants'
import {
  createPod,
  podChance,
  pose,
  scatterPod,
  swim,
  updateAction,
  updateRoaming,
  type Dolphin,
  type Pod,
  type Pose,
} from './pod'
import { emitFinWake, emitSplash, flashGlowingWater } from './spray'

interface DolphinPopulation {
  pod: Pod | null
  wasPresent: boolean
  checkTimer: number
  foam: ParticlePool
  drops: ParticlePool
  phases: THREE.InstancedBufferAttribute
  arches: THREE.InstancedBufferAttribute
  fades: THREE.InstancedBufferAttribute
  attributes: readonly THREE.InstancedBufferAttribute[]
}

const _instance = new THREE.Object3D()
const { clamp } = THREE.MathUtils

export function createDolphinPopulation(geometry: THREE.BufferGeometry): DolphinPopulation {
  const phases = instancedAttribute(geometry, 'aPhase')
  const arches = instancedAttribute(geometry, 'aArch')
  const fades = instancedAttribute(geometry, 'aFade')
  return {
    pod: null,
    wasPresent: false,
    checkTimer: FIRST_CHECK_DELAY,
    foam: new ParticlePool(FOAM_POOL),
    drops: new ParticlePool(DROP_POOL),
    phases,
    arches,
    fades,
    attributes: [phases, arches, fades],
  }
}

function checkForPod(population: DolphinPopulation, ship: ShipState, dt: number) {
  const { dolphinChance, dolphinInterval } = useDebugStore.getState().wildlife
  const checkInterval = dolphinInterval / wildlifePace()
  population.checkTimer = tickSpawnTimer(population.checkTimer, checkInterval, dt)
  if (population.checkTimer > 0) return
  population.checkTimer = checkInterval
  const { timeOfDay } = useCycleStore.getState()
  if (
    !population.pod &&
    !isRaining() &&
    !useWhaleStore.getState().active &&
    isOpenWater(ship.x, ship.z, OPEN_WATER_GAP) &&
    Math.random() < dolphinChance * podChance(timeOfDay, algaeAt(ship.x, ship.z))
  ) {
    population.pod = createPod(ship)
  }
}

function steerPod(pod: Pod, ship: ShipState, dt: number) {
  const whale = useWhaleStore.getState()
  pod.age += dt
  if (whale.active && pod.scatteredAt === null) scatterPod(pod, whale.x, whale.z)
  if (!pod.leaving && (isRaining() || pod.age > pod.followTime)) {
    pod.leaving = true
    for (const dolphin of pod.dolphins) dolphin.targetDepth = HIDDEN_DEPTH
  }

  const idle = 1 - clamp(ship.speed / IDLE_SHIP_SPEED, 0, 1)
  pod.orbit = wrapAngle(pod.orbit) + ORBIT_RATE * idle * dt
  pod.orbit *= Math.exp(-ORBIT_SETTLE * (1 - idle) * dt)
  updateRoaming(pod, ship, dt)
}

function splashAtSurface(
  { foam, drops }: DolphinPopulation,
  dolphin: Dolphin,
  y: number,
  time: number
) {
  const isBreaching = dolphin.action === 'leap' && dolphin.previousY < 0 && y >= 0
  const isEntering = dolphin.previousY > 0 && y <= 0
  if (isBreaching || isEntering) {
    emitSplash(
      foam,
      drops,
      dolphin.x,
      dolphin.z,
      dolphin.heading,
      dolphin.speed,
      isEntering ? SPLASH_ENTRY_DROPS : SPLASH_EXIT_DROPS,
      isEntering ? SPLASH_ENTRY_STRENGTH : SPLASH_EXIT_STRENGTH
    )
    flashGlowingWater(dolphin.x, dolphin.z, time)
  }
  dolphin.previousY = y
}

function trailFinWake({ foam }: DolphinPopulation, dolphin: Dolphin, y: number) {
  const finBack = DOLPHIN_LENGTH * FIN_BACK_SHARE
  const finX = dolphin.x - Math.sin(dolphin.heading) * finBack
  const finZ = dolphin.z - Math.cos(dolphin.heading) * finBack
  const isFinBreaching =
    y < 0 && y + FIN_HEIGHT * DOLPHIN_LENGTH > 0 && dolphin.speed > FIN_WAKE_MIN_SPEED
  if (!isFinBreaching) {
    dolphin.wakeX = finX
    dolphin.wakeZ = finZ
  } else if (Math.hypot(finX - dolphin.wakeX, finZ - dolphin.wakeZ) >= FIN_WAKE_SPACING) {
    emitFinWake(foam, finX, finZ, dolphin.heading)
    dolphin.wakeX = finX
    dolphin.wakeZ = finZ
  }
}

function stepDolphin(
  population: DolphinPopulation,
  pod: Pod,
  dolphin: Dolphin,
  ship: ShipState,
  time: number,
  dt: number
) {
  swim(dolphin, pod, ship, dt)
  updateAction(dolphin, pod.leaving, dt)

  const dolphinPose = pose(dolphin)
  const { y, climb } = dolphinPose
  const pitchBoost = dolphin.action === 'leap' ? LEAP_PITCH_BOOST : 1
  const targetPitch = clamp(
    Math.atan2(climb, Math.max(dolphin.speed, 1)) * pitchBoost,
    -LEAP_PITCH_MAX,
    LEAP_PITCH_MAX
  )
  dolphin.pitch += (targetPitch - dolphin.pitch) * Math.min(1, PITCH_SMOOTH * dt)
  dolphin.phase += dt * Math.PI * 2 * FLUKE_FREQUENCY * (y > 0 ? AIRBORNE_FLUKE_SHARE : 1)

  splashAtSurface(population, dolphin, y, time)
  trailFinWake(population, dolphin, y)
  return dolphinPose
}

function writeInstance(
  population: DolphinPopulation,
  body: THREE.InstancedMesh,
  index: number,
  dolphin: Dolphin,
  { y, arch, roll }: Pose
) {
  const bank = clamp(-dolphin.yawRate * BANK_FACTOR, -BANK_LIMIT, BANK_LIMIT)
  _instance.position.set(dolphin.x, y, dolphin.z)
  _instance.rotation.set(-dolphin.pitch, dolphin.heading, bank + roll, 'YXZ')
  _instance.scale.setScalar(DOLPHIN_LENGTH)
  _instance.updateMatrix()
  body.setMatrixAt(index, _instance.matrix)
  population.phases.setX(index, dolphin.phase)
  population.arches.setX(index, arch)
  population.fades.setX(index, depthFade(dolphin.depth, FADE_START_DEPTH, HIDDEN_DEPTH))
}

function stepPod(
  population: DolphinPopulation,
  pod: Pod,
  body: THREE.InstancedMesh,
  ship: ShipState,
  time: number,
  dt: number
) {
  steerPod(pod, ship, dt)
  let count = 0
  let isSubmerged = true
  for (const dolphin of pod.dolphins) {
    const dolphinPose = stepDolphin(population, pod, dolphin, ship, time, dt)
    isSubmerged &&= dolphin.depth >= HIDDEN_DEPTH
    writeInstance(population, body, count, dolphin, dolphinPose)
    count++
  }
  if (pod.leaving && isSubmerged) population.pod = null
  return count
}

function announcePresence(population: DolphinPopulation, dt: number) {
  const { pod } = population
  const isPresent =
    !!pod && !pod.leaving && pod.dolphins.some((dolphin) => dolphin.depth < FADE_START_DEPTH)
  updateDolphinCalls(isPresent, dt)
  if (isPresent && !population.wasPresent) earnAchievement('podPals')
  population.wasPresent = isPresent
}

export function stepDolphinPopulation(
  population: DolphinPopulation,
  body: THREE.InstancedMesh,
  time: number,
  dt: number
) {
  const ship = useShipStore.getState()
  checkForPod(population, ship, dt)
  const count = population.pod ? stepPod(population, population.pod, body, ship, time, dt) : 0
  announcePresence(population, dt)
  publishInstances(body, count, population.attributes)
}
