import * as THREE from 'three'
import type { SoundHandle } from '@/audio/soundHandle'
import { SEAGULL_FADE_OUT } from '@/audio/constants'
import { maybeSeagullCall } from '@/audio/wildlifeSounds'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { wildlifePace } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { isRaining } from '@/store/weatherStore'
import { retain } from '@/utils/array'
import { rand } from '@/utils/math'
import { isOnScreen } from '@/utils/screen'
import { instancedAttribute } from '../shared/instanceData'
import { tickSpawnTimer } from '../shared/spawnTimer'
import {
  BANK_FACTOR,
  BANK_LIMIT,
  BOB_AMPLITUDE,
  BOB_RATE,
  FIRST_SPAWN_DELAY,
  FLIGHT_RADIUS,
  MAX_BIRDS,
  NIGHT_CUTOFF,
  SHADOW_FLATTEN,
  SHADOW_MIN_SUN_HEIGHT,
  SHADOW_Y,
  VIEW_MARGIN,
} from './constants'
import { createFlight, steerFlight, updateWings, type Flight } from './flight'

interface BirdPopulation {
  flights: Flight[]
  spawnTimer: number
  calls: Map<Flight, SoundHandle>
  lifts: THREE.InstancedBufferAttribute
}

interface BirdMeshes {
  body: THREE.InstancedMesh
  shadow: THREE.InstancedMesh
}

const _instance = new THREE.Object3D()

export const createBirdPopulation = (geometry: THREE.BufferGeometry): BirdPopulation => ({
  flights: [],
  spawnTimer: FIRST_SPAWN_DELAY,
  calls: new Map(),
  lifts: instancedAttribute(geometry, 'aLift'),
})

export function silenceBirdCalls({ calls }: BirdPopulation) {
  for (const call of calls.values()) call.stop()
  calls.clear()
}

function checkForFlight(population: BirdPopulation, time: number, dt: number) {
  const { birdDelayMin, birdDelayMax } = useDebugStore.getState().wildlife
  const pace = wildlifePace()
  population.spawnTimer = tickSpawnTimer(population.spawnTimer, birdDelayMax / pace, dt)
  if (population.spawnTimer > 0) return
  population.spawnTimer = rand(birdDelayMin, birdDelayMax) / pace
  const active = population.flights.reduce((sum, flight) => sum + flight.birds.length, 0)
  const isCalm = useCycleStore.getState().nightFactor < NIGHT_CUTOFF && !isRaining()
  if (!isCalm || active >= MAX_BIRDS) return
  const { x: shipX, z: shipZ } = useShipStore.getState()
  const flight = createFlight(shipX, shipZ, MAX_BIRDS - active)
  population.flights.push(flight)
  const call = maybeSeagullCall(time)
  if (call) population.calls.set(flight, call)
}

function stepFlights(
  population: BirdPopulation,
  { body, shadow }: BirdMeshes,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  const sun = useCycleStore.getState().oceanSunDirection
  const sunHeight = Math.max(sun.y, SHADOW_MIN_SUN_HEIGHT)
  let index = 0
  retain(population.flights, (flight) => {
    steerFlight(flight, time, dt)
    const forwardX = Math.sin(flight.heading)
    const forwardZ = Math.cos(flight.heading)
    const bank = THREE.MathUtils.clamp(-flight.turn * BANK_FACTOR, -BANK_LIMIT, BANK_LIMIT)

    const firstIndex = index
    let isOnView = false

    for (const bird of flight.birds) {
      population.lifts.setX(index, updateWings(bird, dt))

      _instance.position.set(
        flight.x + forwardZ * bird.offsetX + forwardX * bird.offsetZ,
        flight.y + bird.offsetY + Math.sin(time * BOB_RATE + bird.bobPhase) * BOB_AMPLITUDE,
        flight.z - forwardX * bird.offsetX + forwardZ * bird.offsetZ
      )
      _instance.rotation.set(0, flight.heading, bank)
      _instance.scale.setScalar(bird.size)
      _instance.updateMatrix()
      body.setMatrixAt(index, _instance.matrix)
      isOnView ||= isOnScreen(_instance.position, camera, VIEW_MARGIN)

      const shadowDrop = _instance.position.y / sunHeight
      _instance.position.set(
        _instance.position.x - sun.x * shadowDrop,
        SHADOW_Y,
        _instance.position.z - sun.z * shadowDrop
      )
      _instance.rotation.set(0, flight.heading, 0)
      _instance.scale.set(bird.size, SHADOW_FLATTEN, bird.size)
      _instance.updateMatrix()
      shadow.setMatrixAt(index, _instance.matrix)
      isOnView ||= isOnScreen(_instance.position, camera, VIEW_MARGIN)
      index++
    }

    if (flight.travelled > FLIGHT_RADIUS && !isOnView) {
      population.calls.get(flight)?.stop(SEAGULL_FADE_OUT)
      population.calls.delete(flight)
      index = firstIndex
      return false
    }
    return true
  })
  return index
}

export function stepBirdPopulation(
  population: BirdPopulation,
  meshes: BirdMeshes,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  checkForFlight(population, time, dt)
  const count = stepFlights(population, meshes, camera, time, dt)
  for (const mesh of [meshes.body, meshes.shadow]) {
    mesh.count = count
    mesh.visible = count > 0
    mesh.instanceMatrix.needsUpdate = true
  }
  population.lifts.needsUpdate = true
}
