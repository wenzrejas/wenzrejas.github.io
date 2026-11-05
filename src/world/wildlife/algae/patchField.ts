import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { isNightEventOn } from '@/store/nightEventStore'
import { useShipStore, type ShipState } from '@/store/shipStore'
import { isRaining, useWeatherStore } from '@/store/weatherStore'
import { retain } from '@/utils/array'
import { ParticlePool, updateDrops, updateSparks } from '@/world/effects/particlePool'
import { tickSpawnTimer } from '../shared/spawnTimer'
import { algaeAt, algaeUniforms, patchOrders } from './algaeField'
import { emitBowSplash, emitGlowFlashes, emitHullSpark } from './algaeSpray'
import {
  AMBIENT_RATE,
  DESPAWN_DISTANCE,
  FADE_IN,
  FIRST_CHECK_DELAY,
  INTENSITY_RATE,
  MAX_PATCHES,
  MOONLIT_BOOST,
  PATCHES_CLEAR_BELOW_INTENSITY,
  PLANE_HIDDEN_BELOW_INTENSITY,
  PLANE_MARGIN,
  PLANE_SIZE,
  PLANE_Y,
  SPARK_CRUISE_SPEED,
  SPARK_IDLE_RATE,
  SPARK_POOL,
  SPARK_RATE,
  SPLASH_GRAVITY,
  SPLASH_POOL,
  SPLASH_RATE,
  TRAIL_SPACING,
} from './constants'
import {
  applyPatchOrder,
  createPatch,
  isNightWindow,
  patchReach,
  viewReach,
  type Patch,
} from './patches'
import { recordTrail } from './scatterTrail'

interface PatchField {
  patches: Patch[]
  sparks: ParticlePool
  splash: ParticlePool
  checkTimer: number
  sparkBudget: number
  splashBudget: number
  lastTrail: THREE.Vector2
}

interface AlgaeMeshes {
  plane: THREE.Mesh
  sparkMesh: THREE.InstancedMesh
  splashMesh: THREE.InstancedMesh
}

export const createPatchField = (): PatchField => ({
  patches: [],
  sparks: new ParticlePool(SPARK_POOL),
  splash: new ParticlePool(SPLASH_POOL),
  checkTimer: FIRST_CHECK_DELAY,
  sparkBudget: 0,
  splashBudget: 0,
  lastTrail: new THREE.Vector2(Infinity, Infinity),
})

function fadeAlgaeLight(isNight: boolean, dt: number) {
  const intensity = algaeUniforms.uAlgaeIntensity
  intensity.value += ((isNight ? 1 : 0) - intensity.value) * Math.min(1, INTENSITY_RATE * dt)
  const ambient = algaeUniforms.uAlgaeAmbient
  ambient.value += ((isRaining() ? 0 : 1) - ambient.value) * Math.min(1, AMBIENT_RATE * dt)
}

function checkForPatch(
  field: PatchField,
  ship: ShipState,
  reach: number,
  isNight: boolean,
  dt: number
) {
  const { algaeChance, algaeInterval } = useDebugStore.getState().wildlife
  field.checkTimer = tickSpawnTimer(field.checkTimer, algaeInterval, dt)
  if (field.checkTimer > 0) return
  field.checkTimer = algaeInterval
  const isMoonlit = useWeatherStore.getState().type === 'moonlit'
  const chance = algaeChance * (isMoonlit ? MOONLIT_BOOST : 1)
  const canSpawn = field.patches.length < MAX_PATCHES && isNight && !isNightEventOn()
  if (canSpawn && Math.random() < chance) {
    const patch = createPatch(ship.x, ship.z, reach)
    if (patch) field.patches.push(patch)
  }
}

function agePatches({ patches }: PatchField, ship: ShipState, reach: number, dt: number) {
  let isPatchInView = false
  retain(patches, (patch) => {
    patch.age += dt
    const distance = Math.hypot(patch.x - ship.x, patch.z - ship.z)
    isPatchInView ||= distance < reach + patchReach(patch)
    return distance <= DESPAWN_DISTANCE
  })
  return isPatchInView
}

function writePatchZones({ patches }: PatchField) {
  algaeUniforms.uAlgaePatches.value.forEach((zone, index) => {
    const patch = patches[index]
    if (patch) zone.set(patch.x, patch.z, patch.radius, Math.min(1, patch.age / FADE_IN))
    else zone.set(0, 0, 0, 0)
  })
}

function placeGlowPlane(plane: THREE.Mesh, ship: ShipState, reach: number, isPatchInView: boolean) {
  plane.visible =
    isPatchInView && algaeUniforms.uAlgaeIntensity.value > PLANE_HIDDEN_BELOW_INTENSITY
  if (!plane.visible) return
  plane.position.set(Math.round(ship.x), PLANE_Y, Math.round(ship.z))
  plane.scale.setScalar(Math.max(1, ((reach + PLANE_MARGIN) * 2) / PLANE_SIZE))
}

function emitHullGlow(field: PatchField, ship: ShipState, dt: number) {
  const glow = algaeAt(ship.x, ship.z)
  const cruise = Math.min(ship.speed / SPARK_CRUISE_SPEED, 1)

  field.sparkBudget += glow * (SPARK_IDLE_RATE + SPARK_RATE * cruise) * dt
  while (field.sparkBudget >= 1) {
    field.sparkBudget -= 1
    emitHullSpark(field.sparks, ship)
  }

  field.splashBudget += glow * SPLASH_RATE * cruise * dt
  while (field.splashBudget >= 1) {
    field.splashBudget -= 1
    emitBowSplash(field.splash, ship)
  }
}

export function stepPatchField(
  field: PatchField,
  { plane, sparkMesh, splashMesh }: AlgaeMeshes,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  const ship = useShipStore.getState()
  const { algaeAnyTime } = useDebugStore.getState().wildlife
  const isNight = algaeAnyTime || isNightWindow(useCycleStore.getState().timeOfDay)

  fadeAlgaeLight(isNight, dt)
  const reach = viewReach(camera, ship.x, ship.z)

  for (const order of patchOrders) applyPatchOrder(field.patches, order, ship.x, ship.z)
  patchOrders.length = 0

  checkForPatch(field, ship, reach, isNight, dt)
  if (!isNight && algaeUniforms.uAlgaeIntensity.value < PATCHES_CLEAR_BELOW_INTENSITY) {
    field.patches.length = 0
  }
  const isPatchInView = agePatches(field, ship, reach, dt)
  writePatchZones(field)
  placeGlowPlane(plane, ship, reach, isPatchInView)

  if (Math.hypot(ship.x - field.lastTrail.x, ship.z - field.lastTrail.y) >= TRAIL_SPACING) {
    recordTrail(ship.x, ship.z, time)
    field.lastTrail.set(ship.x, ship.z)
  }

  emitHullGlow(field, ship, dt)
  emitGlowFlashes(field.sparks, field.splash)
  updateSparks(field.sparks, sparkMesh, dt)
  updateDrops(field.splash, splashMesh, dt, SPLASH_GRAVITY)
}
