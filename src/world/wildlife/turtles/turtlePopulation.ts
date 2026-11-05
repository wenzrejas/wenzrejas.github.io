import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { wildlifePace } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { retain } from '@/utils/array'
import { isOnScreen } from '@/utils/screen'
import { ParticlePool, updateFoam } from '@/world/effects/particlePool'
import { instancedAttribute, publishInstances } from '../shared/instanceData'
import { tickSpawnTimer } from '../shared/spawnTimer'
import { depthFade } from '../shared/wildlifeMaterial'
import {
  DESPAWN_GRACE,
  DESPAWN_VIEW_MARGIN,
  FADE_START_DEPTH,
  FIRST_CHECK_DELAY,
  HIDDEN_DEPTH,
  RIPPLE_POOL,
} from './constants'
import {
  breathe,
  emitBreathRipple,
  separate,
  spawnTurtles,
  steer,
  updatePose,
  type Turtle,
} from './turtle'

interface TurtlePopulation {
  turtles: Turtle[]
  ripples: ParticlePool
  checkTimer: number
  phases: THREE.InstancedBufferAttribute
  fades: THREE.InstancedBufferAttribute
  attributes: readonly THREE.InstancedBufferAttribute[]
}

const _instance = new THREE.Object3D()

export function createTurtlePopulation(geometry: THREE.BufferGeometry): TurtlePopulation {
  const phases = instancedAttribute(geometry, 'aPhase')
  const fades = instancedAttribute(geometry, 'aFade')
  return {
    turtles: [],
    ripples: new ParticlePool(RIPPLE_POOL),
    checkTimer: FIRST_CHECK_DELAY,
    phases,
    fades,
    attributes: [phases, fades],
  }
}

function checkForTurtles(
  population: TurtlePopulation,
  shipX: number,
  shipZ: number,
  camera: THREE.Camera,
  nightFactor: number,
  dt: number
) {
  const { turtleChance, turtleInterval } = useDebugStore.getState().wildlife
  const checkInterval = turtleInterval / wildlifePace()
  population.checkTimer = tickSpawnTimer(population.checkTimer, checkInterval, dt)
  if (population.checkTimer > 0) return
  population.checkTimer = checkInterval
  spawnTurtles(population.turtles, shipX, shipZ, camera, nightFactor, turtleChance)
}

function stepTurtles(
  population: TurtlePopulation,
  body: THREE.InstancedMesh,
  shipX: number,
  shipZ: number,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  let count = 0
  retain(population.turtles, (turtle) => {
    turtle.age += dt
    if (!turtle.leaving && turtle.age > turtle.lifetime) turtle.leaving = true

    steer(turtle, shipX, shipZ, time, dt)
    if (breathe(turtle, dt)) emitBreathRipple(population.ripples, turtle)
    updatePose(turtle, time, dt)

    _instance.position.set(turtle.x, turtle.y, turtle.z)
    _instance.rotation.set(-turtle.pitch, turtle.heading, turtle.bank, 'YXZ')
    _instance.scale.setScalar(turtle.size)
    _instance.updateMatrix()

    const isVisible = isOnScreen(_instance.position, camera, DESPAWN_VIEW_MARGIN)
    const isGone =
      (turtle.leaving && turtle.depth >= HIDDEN_DEPTH) || (!isVisible && turtle.age > DESPAWN_GRACE)
    if (isGone) return false

    body.setMatrixAt(count, _instance.matrix)
    population.phases.setX(count, turtle.phase)
    population.fades.setX(count, depthFade(turtle.depth, FADE_START_DEPTH, HIDDEN_DEPTH))
    count++
    return true
  })
  return count
}

export function stepTurtlePopulation(
  population: TurtlePopulation,
  body: THREE.InstancedMesh,
  rippleMesh: THREE.InstancedMesh,
  rippleMaterial: THREE.MeshBasicMaterial,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  const ship = useShipStore.getState()
  const cycle = useCycleStore.getState()
  rippleMaterial.color.copy(cycle.foamColor)

  checkForTurtles(population, ship.x, ship.z, camera, cycle.nightFactor, dt)
  separate(population.turtles, dt)
  const count = stepTurtles(population, body, ship.x, ship.z, camera, time, dt)
  publishInstances(body, count, population.attributes)
  updateFoam(population.ripples, rippleMesh, dt)
}
