import * as THREE from 'three'
import { mix } from '@/utils/math'
import { meshesOf } from '@/utils/meshes'
import { seededRandom, type Random } from '@/utils/random'
import { deepestDepth } from '../timeline/timeline'
import {
  ABYSS_EDGE_COLOR,
  ABYSS_WATER_COLOR,
  ENVIRONMENT_SEED,
  SEABED_COLOR,
  SEABED_DROP,
  SEABED_JITTER,
  SEABED_RELIEF,
  SEABED_RELIEF_SCALE,
  SEABED_RIDGE_STRETCH,
  SEABED_RIPPLE_SCALE,
  SEABED_RIPPLE_SHARE,
  SEABED_SEGMENTS,
  SEABED_SIZE,
  SHALLOW_EDGE_COLOR,
  SHALLOW_WATER_COLOR,
  WATER_FOG_DENSITY,
} from './constants'
import { buildWaterBackdrop } from './waterBackdropModel'

export interface DepthEnvironment {
  group: THREE.Group
  fog: THREE.FogExp2
  backdrop: THREE.ShaderMaterial
  shallowColor: THREE.Color
  abyssColor: THREE.Color
  shallowEdgeColor: THREE.Color
  abyssEdgeColor: THREE.Color
}

const between = (random: Random, min: number, max: number) => mix(min, max, random())

const seabedY = () => deepestDepth() - SEABED_DROP

const createRockMaterial = (color: string) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1, metalness: 0 })

function buildSeabedGeometry(random: Random) {
  const geometry = new THREE.PlaneGeometry(
    SEABED_SIZE,
    SEABED_SIZE,
    SEABED_SEGMENTS,
    SEABED_SEGMENTS
  ).rotateX(-Math.PI / 2)
  const phaseA = random() * Math.PI * 2
  const phaseB = random() * Math.PI * 2
  const positions = geometry.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) * SEABED_RELIEF_SCALE
    const z = positions.getZ(i) * SEABED_RELIEF_SCALE
    const ridge = Math.sin(x + phaseA) * Math.cos(z * SEABED_RIDGE_STRETCH + phaseB)
    const relief = ridge + SEABED_RIPPLE_SHARE * Math.sin((x + z) * SEABED_RIPPLE_SCALE)
    positions.setY(i, relief * SEABED_RELIEF + between(random, -SEABED_JITTER, SEABED_JITTER))
  }
  geometry.translate(0, seabedY(), 0)
  geometry.computeVertexNormals()
  return geometry
}

export function buildDepthEnvironment(): DepthEnvironment {
  const random = seededRandom(ENVIRONMENT_SEED)
  const group = new THREE.Group()
  group.add(new THREE.Mesh(buildSeabedGeometry(random), createRockMaterial(SEABED_COLOR)))
  const backdrop = buildWaterBackdrop()
  group.add(backdrop)

  return {
    group,
    fog: new THREE.FogExp2(SHALLOW_WATER_COLOR, WATER_FOG_DENSITY),
    backdrop: backdrop.material,
    shallowColor: new THREE.Color(SHALLOW_WATER_COLOR),
    abyssColor: new THREE.Color(ABYSS_WATER_COLOR),
    shallowEdgeColor: new THREE.Color(SHALLOW_EDGE_COLOR),
    abyssEdgeColor: new THREE.Color(ABYSS_EDGE_COLOR),
  }
}

export function disposeDepthEnvironment({ group }: DepthEnvironment) {
  for (const mesh of meshesOf(group)) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
    if (mesh instanceof THREE.InstancedMesh) mesh.dispose()
  }
}
