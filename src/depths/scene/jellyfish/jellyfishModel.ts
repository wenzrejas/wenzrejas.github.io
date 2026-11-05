import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { pickByShare, randomBetween, seededRandom } from '@/utils/random'
import {
  JELLYFISH_BODY_DEFINES,
  setJellyfishBody,
} from '@/world/wildlife/shared/jellyfish-shape/jellyfishShapeModel'
import JELLYFISH_FRAG from '@/world/wildlife/shared/jellyfish-shape/shaders/jellyfish.frag.glsl'
import { createAdditiveMaterial } from '@/utils/materials'
import { ARRIVAL_LEVEL } from '../constants'
import { DEEPEST_LEVEL, levelDepth, levelSpot } from '../timeline/timeline'
import {
  BACK_SWARM,
  DRIFT_ACROSS,
  DRIFT_RATE,
  FRONT_SWARM,
  JELLYFISH_FADE_DENSITY,
  JELLYFISH_SEED,
  JELLYFISH_TINTS,
  LANE_FADE,
  NEAR_SWARM,
  SWIM_STRIDE,
  SWIM_TILT,
} from './constants'
import JELLYFISH_VERT from './shaders/jellyfish.vert.glsl'

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

const TINTS = JELLYFISH_TINTS.map(({ color, share }) => ({ color: displayColorOf(color), share }))

const _spot = new THREE.Vector3()

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
  const swarm = placeSwarm()

  const geometry = new THREE.InstancedBufferGeometry()
  setJellyfishBody(geometry)
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
  createAdditiveMaterial({
    vertexShader: JELLYFISH_VERT,
    fragmentShader: JELLYFISH_FRAG,
    defines: floatDefines({
      ...JELLYFISH_BODY_DEFINES,
      SWIM_STRIDE,
      SWIM_TILT,
      LANE_FADE,
      DRIFT_ACROSS,
      DRIFT_RATE,
      FADE_DENSITY: JELLYFISH_FADE_DENSITY,
    }),
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 } },
  })
