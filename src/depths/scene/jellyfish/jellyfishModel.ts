import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { mix } from '@/utils/math'
import { pickByShare, randomBetween, seededRandom } from '@/utils/random'
import { ARRIVAL_LEVEL } from '../constants'
import { DEEPEST_LEVEL, levelDepth, levelSpot } from '../timeline/timeline'
import {
  BACK_SWARM,
  BELL_GLOW,
  BELL_PROFILE,
  BELL_SEGMENTS,
  DRIFT_ACROSS,
  DRIFT_RATE,
  FRONT_SWARM,
  JELLYFISH_FADE_DENSITY,
  JELLYFISH_LEAN,
  JELLYFISH_SEED,
  JELLYFISH_TINTS,
  LANE_FADE,
  NEAR_SWARM,
  PULSE_SECONDS,
  PULSE_SQUEEZE,
  RIM_GLOW,
  RIM_POWER,
  SWIM_STRIDE,
  SWIM_TILT,
  TENTACLE_COUNT,
  TENTACLE_GLOW,
  TENTACLE_LENGTH,
  TENTACLE_RIM_REACH,
  TENTACLE_ROOT_WIDTH,
  TENTACLE_SEGMENTS,
  TENTACLE_SWAY,
  TENTACLE_SWAY_RATE,
  TENTACLE_TIP_WIDTH,
  TENTACLE_TRAIL,
} from './constants'
import JELLYFISH_VERT from './shaders/jellyfish.vert.glsl'
import JELLYFISH_FRAG from './shaders/jellyfish.frag.glsl'

type Point = [number, number, number]

export interface SwarmLayer {
  perLevel: number
  side: 'any' | 'open'
  innerAcross: number
  outerAcross: number
  nearestZ: number
  farthestZ: number
  heightOffset: number
  heightSpread: number
  smallest: number
  largest: number
  laneSpan: number
  includesClock: boolean
}

interface Body {
  positions: number[]
  normals: number[]
  shapes: number[]
}

const TINTS = JELLYFISH_TINTS.map(({ color, share }) => ({ color: displayColorOf(color), share }))
const BELL_RIM_Y = BELL_PROFILE[BELL_PROFILE.length - 1][1]

const _edge = new THREE.Vector3()
const _side = new THREE.Vector3()
const _facing = new THREE.Vector3()
const _spot = new THREE.Vector3()

function addFacet(body: Body, corners: Point[], shapes: Point[]) {
  const [a, b, c] = corners
  _edge.set(b[0] - a[0], b[1] - a[1], b[2] - a[2])
  _side.set(c[0] - a[0], c[1] - a[1], c[2] - a[2])
  _facing.crossVectors(_edge, _side)
  if (_facing.lengthSq() < 1e-10) return
  _facing.normalize()
  for (const [index, corner] of corners.entries()) {
    body.positions.push(...corner)
    body.normals.push(_facing.x, _facing.y, _facing.z)
    body.shapes.push(...shapes[index])
  }
}

function addBell(body: Body) {
  const ring = (radius: number, height: number, segment: number): Point => {
    const angle = (segment / BELL_SEGMENTS) * Math.PI * 2
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius]
  }
  const bellShapes: Point[] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let band = 0; band < BELL_PROFILE.length - 1; band++) {
    const [upperRadius, upperHeight] = BELL_PROFILE[band]
    const [lowerRadius, lowerHeight] = BELL_PROFILE[band + 1]
    for (let segment = 0; segment < BELL_SEGMENTS; segment++) {
      const a = ring(upperRadius, upperHeight, segment)
      const b = ring(upperRadius, upperHeight, segment + 1)
      const c = ring(lowerRadius, lowerHeight, segment + 1)
      const d = ring(lowerRadius, lowerHeight, segment)
      addFacet(body, [a, b, c], bellShapes)
      addFacet(body, [a, c, d], bellShapes)
    }
  }
}

function addTentacles(body: Body) {
  for (let strand = 0; strand < TENTACLE_COUNT; strand++) {
    const angle = ((strand + 0.5) / TENTACLE_COUNT) * Math.PI * 2
    const rootX = Math.cos(angle) * TENTACLE_RIM_REACH
    const rootZ = Math.sin(angle) * TENTACLE_RIM_REACH
    const strandShare = strand / TENTACLE_COUNT
    const edgeAt = (step: number, side: number): Point => {
      const along = step / TENTACLE_SEGMENTS
      const halfWidth = mix(TENTACLE_ROOT_WIDTH, TENTACLE_TIP_WIDTH, along) / 2
      return [rootX + side * halfWidth, BELL_RIM_Y - along * TENTACLE_LENGTH, rootZ]
    }
    const shapeAt = (step: number): Point => [1, step / TENTACLE_SEGMENTS, strandShare]
    for (let step = 0; step < TENTACLE_SEGMENTS; step++) {
      const upper = shapeAt(step)
      const lower = shapeAt(step + 1)
      addFacet(
        body,
        [edgeAt(step, -1), edgeAt(step, 1), edgeAt(step + 1, 1)],
        [upper, upper, lower]
      )
      addFacet(
        body,
        [edgeAt(step, -1), edgeAt(step + 1, 1), edgeAt(step + 1, -1)],
        [upper, lower, lower]
      )
    }
  }
}

function placeSwarm() {
  const random = seededRandom(JELLYFISH_SEED)
  const between = randomBetween(random)
  const origins: number[] = []
  const radii: number[] = []
  const seeds: number[] = []
  const tints: number[] = []
  const lanes: number[] = []
  const randomSide = () => (random() < 0.5 ? -1 : 1)
  for (const layer of [BACK_SWARM, NEAR_SWARM, FRONT_SWARM]) {
    for (let level = ARRIVAL_LEVEL; level <= DEEPEST_LEVEL; level++) {
      if (level === DEEPEST_LEVEL && !layer.includesClock) continue
      const ruinSide = Math.sign(levelSpot(level, _spot).x)
      for (let count = 0; count < layer.perLevel; count++) {
        const side = layer.side === 'open' && ruinSide !== 0 ? -ruinSide : randomSide()
        origins.push(
          side * between(layer.innerAcross, layer.outerAcross),
          levelDepth(level) + layer.heightOffset + between(-0.5, 0.5) * layer.heightSpread,
          between(layer.farthestZ, layer.nearestZ)
        )
        radii.push(between(layer.smallest, layer.largest))
        seeds.push(random())
        tints.push(...pickByShare(TINTS, random()).color.toArray())
        lanes.push(layer.laneSpan)
      }
    }
  }
  return { origins, radii, seeds, tints, lanes }
}

export function buildJellyfishGeometry(): THREE.InstancedBufferGeometry {
  const body: Body = { positions: [], normals: [], shapes: [] }
  addBell(body)
  addTentacles(body)
  const swarm = placeSwarm()

  const geometry = new THREE.InstancedBufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(body.positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(body.normals, 3))
  geometry.setAttribute('shape', new THREE.Float32BufferAttribute(body.shapes, 3))
  geometry.setAttribute(
    'origin',
    new THREE.InstancedBufferAttribute(new Float32Array(swarm.origins), 3)
  )
  geometry.setAttribute(
    'bellRadius',
    new THREE.InstancedBufferAttribute(new Float32Array(swarm.radii), 1)
  )
  geometry.setAttribute(
    'seed',
    new THREE.InstancedBufferAttribute(new Float32Array(swarm.seeds), 1)
  )
  geometry.setAttribute(
    'tint',
    new THREE.InstancedBufferAttribute(new Float32Array(swarm.tints), 3)
  )
  geometry.setAttribute(
    'laneSpan',
    new THREE.InstancedBufferAttribute(new Float32Array(swarm.lanes), 1)
  )
  geometry.instanceCount = swarm.radii.length
  return geometry
}

export const createJellyfishMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: JELLYFISH_VERT,
    fragmentShader: JELLYFISH_FRAG,
    defines: floatDefines({
      PULSE_SECONDS,
      PULSE_SQUEEZE,
      SWIM_STRIDE,
      SWIM_TILT,
      LANE_FADE,
      DRIFT_ACROSS,
      DRIFT_RATE,
      LEAN: JELLYFISH_LEAN,
      TENTACLE_SWAY,
      TENTACLE_SWAY_RATE,
      TENTACLE_TRAIL,
      BELL_GLOW,
      RIM_GLOW,
      RIM_POWER,
      TENTACLE_GLOW,
      FADE_DENSITY: JELLYFISH_FADE_DENSITY,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 } },
  })
