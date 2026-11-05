import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { wildlifePace } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { retain } from '@/utils/array'
import { rand } from '@/utils/math'
import { isOnScreen } from '@/utils/screen'
import { instancedAttribute, publishInstances } from '../shared/instanceData'
import { tickSpawnTimer } from '../shared/spawnTimer'
import { depthFade } from '../shared/wildlifeMaterial'
import {
  CRUISE_DEPTH_MAX,
  DESPAWN_VIEW_MARGIN,
  FADE_START_DEPTH,
  FIRST_SPAWN_DELAY,
  HIDDEN_DEPTH,
  MAX_FISH,
  NIGHT_CUTOFF,
  SPAWN_DISTANCE_MAX,
  SPAWN_DISTANCE_MIN,
  SPAWN_VIEW_MARGIN,
} from './constants'
import { spawnChance } from './habitat'
import {
  createSchool,
  leave,
  regroup,
  scatterFromThreats,
  steerSchool,
  updateFish,
  type School,
} from './school'

interface FishPopulation {
  schools: School[]
  spawnTimer: number
  fades: THREE.InstancedBufferAttribute
  phases: THREE.InstancedBufferAttribute
  attributes: readonly THREE.InstancedBufferAttribute[]
}

const _instance = new THREE.Object3D()

export function createFishPopulation(geometry: THREE.BufferGeometry): FishPopulation {
  const fades = instancedAttribute(geometry, 'aFade')
  const phases = instancedAttribute(geometry, 'aPhase')
  return {
    schools: [],
    spawnTimer: FIRST_SPAWN_DELAY,
    fades,
    phases,
    attributes: [fades, phases],
  }
}

function checkForSchool(
  population: FishPopulation,
  shipX: number,
  shipZ: number,
  camera: THREE.Camera,
  dt: number
) {
  const { fishDelayMin, fishDelayMax } = useDebugStore.getState().wildlife
  const pace = wildlifePace()
  population.spawnTimer = tickSpawnTimer(population.spawnTimer, fishDelayMax / pace, dt)
  if (population.spawnTimer > 0) return
  population.spawnTimer = rand(fishDelayMin, fishDelayMax) / pace
  const active = population.schools.reduce((sum, school) => sum + school.fish.length, 0)
  const angle = Math.random() * Math.PI * 2
  const distance = rand(SPAWN_DISTANCE_MIN, SPAWN_DISTANCE_MAX)
  const x = shipX + Math.sin(angle) * distance
  const z = shipZ + Math.cos(angle) * distance
  _instance.position.set(x, -CRUISE_DEPTH_MAX, z)
  if (
    active < MAX_FISH &&
    useCycleStore.getState().nightFactor < NIGHT_CUTOFF &&
    isOnScreen(_instance.position, camera, SPAWN_VIEW_MARGIN) &&
    Math.random() < spawnChance(x, z)
  ) {
    population.schools.push(createSchool(x, z, MAX_FISH - active))
  }
}

function steerWholeSchool(school: School, shipX: number, shipZ: number, time: number, dt: number) {
  school.age += dt
  if (!school.leaving && school.age > school.lifetime) leave(school)
  if (school.fleeTimer > 0) {
    school.fleeTimer -= dt
    if (school.fleeTimer <= 0) regroup(school)
  } else {
    steerSchool(school, time, dt)
    scatterFromThreats(school, shipX, shipZ)
  }
}

function stepSchools(
  population: FishPopulation,
  mesh: THREE.InstancedMesh,
  shipX: number,
  shipZ: number,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  let index = 0
  retain(population.schools, (school) => {
    steerWholeSchool(school, shipX, shipZ, time, dt)

    const firstIndex = index
    let isOnView = false
    let isSubmerged = true

    for (const fish of school.fish) {
      updateFish(school, fish, time, dt)
      isSubmerged &&= fish.depth >= HIDDEN_DEPTH

      _instance.position.set(fish.x, -fish.depth, fish.z)
      _instance.rotation.set(0, fish.heading, 0)
      _instance.scale.setScalar(fish.size)
      _instance.updateMatrix()
      mesh.setMatrixAt(index, _instance.matrix)
      population.fades.setX(index, depthFade(fish.depth, FADE_START_DEPTH, HIDDEN_DEPTH))
      population.phases.setX(index, fish.phase)
      isOnView ||= isOnScreen(_instance.position, camera, DESPAWN_VIEW_MARGIN)
      index++
    }

    if (!isOnView || (school.leaving && isSubmerged)) {
      index = firstIndex
      return false
    }
    return true
  })
  return index
}

export function stepFishPopulation(
  population: FishPopulation,
  mesh: THREE.InstancedMesh,
  camera: THREE.Camera,
  time: number,
  dt: number
) {
  const { x: shipX, z: shipZ } = useShipStore.getState()
  checkForSchool(population, shipX, shipZ, camera, dt)
  const count = stepSchools(population, mesh, shipX, shipZ, camera, time, dt)
  publishInstances(mesh, count, population.attributes)
}
