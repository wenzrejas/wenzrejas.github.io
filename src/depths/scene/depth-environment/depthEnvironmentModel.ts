import * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import { randomBetween, seededRandom, type Random } from '@/utils/random'
import {
  ABYSS_EDGE_COLOR,
  ABYSS_WATER_COLOR,
  ENVIRONMENT_SEED,
  FRONT_LIGHT_COLOR,
  FRONT_LIGHT_INTENSITY,
  FRONT_LIGHT_POSITION,
  HEMISPHERE_GROUND_COLOR,
  HEMISPHERE_INTENSITY,
  HEMISPHERE_SKY_COLOR,
  RIM_LIGHT_COLOR,
  RIM_LIGHT_INTENSITY,
  RIM_LIGHT_POSITION,
  SEABED_COLOR,
  SEABED_JITTER,
  SEABED_SEGMENTS,
  SEABED_SIZE,
  SHALLOW_EDGE_COLOR,
  SHALLOW_WATER_COLOR,
  SURFACE_LIGHT_COLOR,
  SURFACE_LIGHT_INTENSITY,
  SURFACE_LIGHT_POSITION,
  WATER_FOG_DENSITY,
} from './constants'
import { seabedReliefAt, seabedY } from './seabedRelief'
import { buildWaterBackdrop } from './waterBackdropModel'

export interface DepthLights {
  hemisphere: THREE.HemisphereLight
  surface: THREE.DirectionalLight
  front: THREE.DirectionalLight
  rim: THREE.DirectionalLight
}

export interface DepthEnvironment {
  group: THREE.Group
  fog: THREE.FogExp2
  backdrop: THREE.ShaderMaterial
  lights: DepthLights
  shallowColor: THREE.Color
  abyssColor: THREE.Color
  shallowEdgeColor: THREE.Color
  abyssEdgeColor: THREE.Color
}

const createRockMaterial = (color: string) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1, metalness: 0 })

function buildSeabedGeometry(random: Random) {
  const geometry = new THREE.PlaneGeometry(
    SEABED_SIZE,
    SEABED_SIZE,
    SEABED_SEGMENTS,
    SEABED_SEGMENTS
  ).rotateX(-Math.PI / 2)
  const jitter = randomBetween(random)
  const positions = geometry.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    const relief = seabedReliefAt(positions.getX(i), positions.getZ(i))
    positions.setY(i, relief + jitter(-SEABED_JITTER, SEABED_JITTER))
  }
  geometry.translate(0, seabedY(), 0)
  geometry.computeVertexNormals()
  return geometry
}

function placedLight(color: string, intensity: number, position: [number, number, number]) {
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(...position)
  return light
}

const buildDepthLights = (): DepthLights => ({
  hemisphere: new THREE.HemisphereLight(
    HEMISPHERE_SKY_COLOR,
    HEMISPHERE_GROUND_COLOR,
    HEMISPHERE_INTENSITY
  ),
  surface: placedLight(SURFACE_LIGHT_COLOR, SURFACE_LIGHT_INTENSITY, SURFACE_LIGHT_POSITION),
  front: placedLight(FRONT_LIGHT_COLOR, FRONT_LIGHT_INTENSITY, FRONT_LIGHT_POSITION),
  rim: placedLight(RIM_LIGHT_COLOR, RIM_LIGHT_INTENSITY, RIM_LIGHT_POSITION),
})

export function buildDepthEnvironment(): DepthEnvironment {
  const random = seededRandom(ENVIRONMENT_SEED)
  const group = new THREE.Group()
  group.add(new THREE.Mesh(buildSeabedGeometry(random), createRockMaterial(SEABED_COLOR)))
  const backdrop = buildWaterBackdrop()
  const lights = buildDepthLights()
  group.add(backdrop, ...Object.values(lights))

  return {
    group,
    fog: new THREE.FogExp2(SHALLOW_WATER_COLOR, WATER_FOG_DENSITY),
    backdrop: backdrop.material,
    lights,
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
