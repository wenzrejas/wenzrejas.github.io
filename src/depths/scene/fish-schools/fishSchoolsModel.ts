import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { randomBetween, seededRandom } from '@/utils/random'
import { patchShader } from '@/world/islands/shared/materialPatch'
import { ARRIVAL_LEVEL } from '../constants'
import { DEEPEST_LEVEL, levelDepth } from '../timeline/timeline'
import {
  BACK_SCHOOLS,
  FISH_BACK_COLOR,
  FISH_BELLY_COLOR,
  FISH_BOB,
  FISH_BOB_RATE,
  FISH_FIN_COLOR,
  FISH_LARGEST,
  FISH_PER_SCHOOL_MAX,
  FISH_PER_SCHOOL_MIN,
  FISH_SEED,
  FISH_SMALLEST,
  FRONT_SCHOOLS,
  SCHOOL_SPEED_MAX,
  SCHOOL_SPEED_MIN,
  SCHOOL_SPREAD,
  TAIL_START,
  TAIL_WAVE,
  TAIL_WIGGLE,
  TAIL_WIGGLE_RATE,
} from './constants'
import FISH_SWIM_PARS from './shaders/fishSwimPars.vert.glsl'
import FISH_SWIM from './shaders/fishSwim.vert.glsl'

type Point = [number, number, number]

export interface SchoolLayer {
  perLevel: number
  nearestZ: number
  farthestZ: number
  heightOffset: number
  heightClearance: number
  heightReach: number
  laneSpan: number
}

const BACK = new THREE.Color(FISH_BACK_COLOR)
const BELLY = new THREE.Color(FISH_BELLY_COLOR)
const FIN = new THREE.Color(FISH_FIN_COLOR)
const TURNED_BACK = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
const FACING_AHEAD = new THREE.Quaternion()

// ── Geometry ──────────────────────────────────────────────────────────────────

function buildFishGeometry() {
  const positions: number[] = []
  const colors: number[] = []
  const tri = (color: THREE.Color, a: Point, b: Point, c: Point) => {
    for (const corner of [a, b, c]) {
      positions.push(...corner)
      colors.push(color.r, color.g, color.b)
    }
  }

  const nose: Point = [1, 0, 0]
  const back: Point = [0.15, 0.36, 0]
  const belly: Point = [0.15, -0.3, 0]
  const flankNear: Point = [0.2, 0.02, 0.2]
  const flankFar: Point = [0.2, 0.02, -0.2]
  const tailRoot: Point = [-0.62, 0.02, 0]

  tri(BACK, nose, back, flankNear)
  tri(BELLY, nose, flankNear, belly)
  tri(BELLY, nose, belly, flankFar)
  tri(BACK, nose, flankFar, back)
  tri(BACK, tailRoot, flankNear, back)
  tri(BELLY, tailRoot, belly, flankNear)
  tri(BELLY, tailRoot, flankFar, belly)
  tri(BACK, tailRoot, back, flankFar)

  tri(FIN, tailRoot, [-1, 0.34, 0], [-0.86, 0.02, 0])
  tri(FIN, tailRoot, [-0.86, 0.02, 0], [-1, -0.28, 0])
  tri(FIN, back, [-0.18, 0.55, 0], [-0.3, 0.26, 0])

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

// ── Schools ───────────────────────────────────────────────────────────────────

function placeSchools() {
  const random = seededRandom(FISH_SEED)
  const between = randomBetween(random)
  const matrices: THREE.Matrix4[] = []
  const lanes: number[] = []
  const seeds: number[] = []
  const spot = new THREE.Vector3()
  const scale = new THREE.Vector3()

  for (const layer of [BACK_SCHOOLS, FRONT_SCHOOLS]) {
    for (let level = ARRIVAL_LEVEL; level <= DEEPEST_LEVEL; level++) {
      for (let school = 0; school < layer.perLevel; school++) {
        const facing = random() < 0.5 ? FACING_AHEAD : TURNED_BACK
        const side = random() < 0.5 ? -1 : 1
        const height =
          levelDepth(level) +
          layer.heightOffset +
          side * between(layer.heightClearance, layer.heightReach)
        const depth = between(layer.farthestZ, layer.nearestZ)
        const speed = between(SCHOOL_SPEED_MIN, SCHOOL_SPEED_MAX)
        const phase = random() * layer.laneSpan
        const fishCount = Math.round(between(FISH_PER_SCHOOL_MIN, FISH_PER_SCHOOL_MAX))
        for (let fish = 0; fish < fishCount; fish++) {
          const size = between(FISH_SMALLEST, FISH_LARGEST)
          spot.set(
            between(-1, 1) * SCHOOL_SPREAD[0],
            height + between(-1, 1) * SCHOOL_SPREAD[1],
            depth + between(-1, 1) * SCHOOL_SPREAD[2]
          )
          matrices.push(new THREE.Matrix4().compose(spot, facing, scale.setScalar(size)))
          lanes.push(speed / size, phase / size, layer.laneSpan / size)
          seeds.push(random())
        }
      }
    }
  }
  return { matrices, lanes, seeds }
}

// ── Material ──────────────────────────────────────────────────────────────────

function createFishMaterial(swimTime: { value: number }) {
  return patchShader(
    new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
    {
      uniforms: { uSwimTime: swimTime },
      defines: floatDefines({
        TAIL_START,
        TAIL_WIGGLE,
        TAIL_WIGGLE_RATE,
        TAIL_WAVE,
        FISH_BOB,
        FISH_BOB_RATE,
      }),
      vertex: { common: FISH_SWIM_PARS, begin_vertex: FISH_SWIM },
    }
  )
}

export function buildFishSchools(swimTime: { value: number }) {
  const { matrices, lanes, seeds } = placeSchools()
  const geometry = buildFishGeometry()
  geometry.setAttribute('swimLane', new THREE.InstancedBufferAttribute(new Float32Array(lanes), 3))
  geometry.setAttribute('swimSeed', new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1))
  const schools = new THREE.InstancedMesh(geometry, createFishMaterial(swimTime), matrices.length)
  for (const [index, matrix] of matrices.entries()) schools.setMatrixAt(index, matrix)
  schools.frustumCulled = false
  return schools
}

export function disposeFishSchools(schools: THREE.InstancedMesh) {
  schools.geometry.dispose()
  ;(schools.material as THREE.Material).dispose()
  schools.dispose()
}
