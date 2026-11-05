import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { buildFlatQuad, dynamicInstancedAttribute, mergeParts } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import { waveUniforms } from '@/world/environment/ocean/waveUniforms'
import { useWindStore } from '@/store/windStore'
import { patchShader } from '@/world/islands/shared/materialPatch'
import type { Gate } from './checkpointRun'
import {
  ARCH_COLOR,
  ARCH_CORE_GLOW,
  ARCH_LIFT,
  ARCH_PULSE_SHINE,
  ARCH_RADIAL_SEGMENTS,
  ARCH_RIM_GLOW,
  ARCH_TUBE_RADIUS,
  ARCH_TUBULAR_SEGMENTS,
  BUOY_BRACE_SHARE,
  BUOY_BRACE_THICKNESS,
  BUOY_COLOR,
  BUOY_FLAG_DROP,
  BUOY_FLAG_FLAP,
  BUOY_FLAG_LENGTH,
  BUOY_FLAG_RATE,
  BUOY_FLAG_SEGMENTS,
  BUOY_FLAG_WAVES,
  BUOY_FLOAT_HEIGHT,
  BUOY_FLOAT_RADIUS,
  BUOY_FLOAT_SEGMENTS,
  BUOY_FLOAT_SINK,
  BUOY_HIT_HEIGHT,
  BUOY_HIT_RADIUS,
  BUOY_LANTERN_COLOR,
  BUOY_LANTERN_HEIGHT,
  BUOY_LANTERN_RADIUS,
  BUOY_LANTERN_SEGMENTS,
  BUOY_LEG_THICKNESS,
  BUOY_LIP_HEIGHT,
  BUOY_LIP_RADIUS,
  BUOY_PLATFORM_HALF_WIDTH,
  BUOY_PLATFORM_HEIGHT,
  BUOY_POLE_HEIGHT,
  BUOY_POLE_RADIUS,
  BUOY_ROOF_HEIGHT,
  BUOY_ROOF_RADIUS,
  BUOY_ROOF_RIM_HEIGHT,
  BUOY_SCALE,
  BUOY_STRIPE_BOTTOM_SHARE,
  BUOY_STRIPE_COLOR,
  BUOY_STRIPE_TOP_SHARE,
  BUOY_TOWER_BASE_HALF_WIDTH,
  BUOY_TOWER_HEIGHT,
  BUOY_TOWER_TOP_HALF_WIDTH,
  BUOY_TRIM_SHARE,
  BUOY_WAVE_TILT,
  GATE_HALF_WIDTH,
  RING_FOAM_BREATHE,
  RING_FOAM_BREATHE_RATE,
  RING_FOAM_GRAIN,
  RING_FOAM_JAG,
  RING_FOAM_REACH,
  RING_FOAM_SPECK,
  RING_FOAM_SPECK_GRAIN,
  SOLID_ARCH_GLOW,
  START_MARKER_HEIGHT,
} from './constants'
import ARCH_VERT from './shaders/arch.vert.glsl'
import ARCH_FRAG from './shaders/arch.frag.glsl'
import RING_FOAM_FRAG from './shaders/ringFoam.frag.glsl'
import RING_FOAM_VERT from './shaders/ringFoam.vert.glsl'
import BUOY_FLAG from './shaders/buoyFlag.glsl'
import BUOY_FLAG_PARS from './shaders/buoyFlagPars.glsl'
import BUOY_RIDE from './shaders/buoyRide.glsl'
import BUOY_WAVES from './shaders/buoyWaves.glsl'

export const gateYaw = ({ facingX, facingZ }: Gate) => Math.atan2(facingX, facingZ)

// ── Buoys ─────────────────────────────────────────────────────────────────────
const UP = new THREE.Vector3(0, 1, 0)
const SQUARE_SIDES = 4
const TOWER_CORNERS = [
  [1, 1],
  [1, -1],
  [-1, -1],
  [-1, 1],
]

const floatTop = BUOY_FLOAT_HEIGHT - BUOY_FLOAT_SINK
const towerTop = floatTop + BUOY_TOWER_HEIGHT
const platformTop = towerTop + BUOY_PLATFORM_HEIGHT
const lanternTop = platformTop + BUOY_LANTERN_HEIGHT
const roofRimTop = lanternTop + BUOY_ROOF_RIM_HEIGHT
const roofTop = roofRimTop + BUOY_ROOF_HEIGHT
const poleTop = roofTop + BUOY_POLE_HEIGHT

const towerHalfWidthAt = (share: number) =>
  THREE.MathUtils.lerp(BUOY_TOWER_BASE_HALF_WIDTH, BUOY_TOWER_TOP_HALF_WIDTH, share)

const towerHeightAt = (share: number) => floatTop + share * BUOY_TOWER_HEIGHT

const disc = (radius: number, bottom: number, top: number, segments: number) =>
  new THREE.CylinderGeometry(radius, radius, top - bottom, segments).translate(
    0,
    (bottom + top) / 2,
    0
  )

const squareFrustum = (
  bottomHalfWidth: number,
  topHalfWidth: number,
  bottom: number,
  top: number
) =>
  new THREE.CylinderGeometry(
    topHalfWidth * Math.SQRT2,
    bottomHalfWidth * Math.SQRT2,
    top - bottom,
    SQUARE_SIDES
  )
    .rotateY(Math.PI / 4)
    .translate(0, (bottom + top) / 2, 0)

const towerBand = (fromShare: number, toShare: number) =>
  squareFrustum(
    towerHalfWidthAt(fromShare),
    towerHalfWidthAt(toShare),
    towerHeightAt(fromShare),
    towerHeightAt(toShare)
  )

function towerCornerAt([signX, signZ]: number[], share: number) {
  const halfWidth = towerHalfWidthAt(share)
  return new THREE.Vector3(signX * halfWidth, towerHeightAt(share), signZ * halfWidth)
}

function barBetween(from: THREE.Vector3, to: THREE.Vector3, thickness: number) {
  const direction = new THREE.Vector3().subVectors(to, from)
  const length = direction.length()
  const radius = thickness / Math.SQRT2
  return new THREE.CylinderGeometry(radius, radius, length, SQUARE_SIDES)
    .applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, direction.normalize()))
    .translate((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2)
}

function buildBuoyFrame() {
  const legs = TOWER_CORNERS.map((corner) =>
    barBetween(towerCornerAt(corner, 0), towerCornerAt(corner, 1), BUOY_LEG_THICKNESS)
  )
  const braces = TOWER_CORNERS.map((corner, i) =>
    barBetween(
      towerCornerAt(corner, BUOY_BRACE_SHARE),
      towerCornerAt(TOWER_CORNERS[(i + 1) % TOWER_CORNERS.length], BUOY_BRACE_SHARE),
      BUOY_BRACE_THICKNESS
    )
  )
  return mergeParts([
    disc(BUOY_FLOAT_RADIUS, floatTop - BUOY_FLOAT_HEIGHT, floatTop, BUOY_FLOAT_SEGMENTS),
    disc(BUOY_LIP_RADIUS, floatTop, floatTop + BUOY_LIP_HEIGHT, BUOY_FLOAT_SEGMENTS),
    ...legs,
    ...braces,
    towerBand(BUOY_STRIPE_BOTTOM_SHARE - BUOY_TRIM_SHARE, BUOY_STRIPE_BOTTOM_SHARE),
    towerBand(BUOY_STRIPE_TOP_SHARE, BUOY_STRIPE_TOP_SHARE + BUOY_TRIM_SHARE),
    squareFrustum(BUOY_PLATFORM_HALF_WIDTH, BUOY_PLATFORM_HALF_WIDTH, towerTop, platformTop),
    disc(BUOY_ROOF_RADIUS, lanternTop, roofRimTop, BUOY_LANTERN_SEGMENTS),
    new THREE.ConeGeometry(BUOY_ROOF_RADIUS, BUOY_ROOF_HEIGHT, BUOY_LANTERN_SEGMENTS).translate(
      0,
      roofRimTop + BUOY_ROOF_HEIGHT / 2,
      0
    ),
  ])
}

function buildBuoyFlag() {
  const flag = new THREE.PlaneGeometry(
    BUOY_FLAG_LENGTH,
    BUOY_FLAG_DROP,
    BUOY_FLAG_SEGMENTS,
    1
  ).translate(BUOY_FLAG_LENGTH / 2, 0, 0)
  const positions = flag.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, positions.getY(i) * (1 - positions.getX(i) / BUOY_FLAG_LENGTH))
  }
  return flag.translate(0, poleTop - BUOY_FLAG_DROP / 2, 0)
}

const toBuoySize = (geometry: THREE.BufferGeometry) =>
  geometry.scale(BUOY_SCALE, BUOY_SCALE, BUOY_SCALE)

const rideWaves = <Material extends THREE.Material>(material: Material) =>
  patchShader(material, {
    uniforms: waveUniforms,
    defines: floatDefines({ BUOY_WAVE_TILT }),
    vertex: { common: BUOY_WAVES, begin_vertex: BUOY_RIDE },
  })

const paint = (color: string) =>
  rideWaves(new THREE.MeshStandardMaterial({ color, roughness: 0.55, flatShading: true }))

const createFlagMaterial = () =>
  patchShader(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), {
    uniforms: { ...waveUniforms, uFlagDir: { value: useWindStore.getState().dir } },
    defines: floatDefines({
      BUOY_WAVE_TILT,
      BUOY_FLAG_FLAP,
      BUOY_FLAG_RATE,
      BUOY_FLAG_SPAN: BUOY_FLAG_LENGTH * BUOY_SCALE,
      BUOY_FLAG_WAVES,
    }),
    vertex: { common: BUOY_FLAG_PARS, begin_vertex: BUOY_FLAG + BUOY_RIDE },
  })

export function buildBuoyKit() {
  return {
    geometries: {
      frame: toBuoySize(buildBuoyFrame()),
      stripe: toBuoySize(
        mergeParts([
          towerBand(BUOY_STRIPE_BOTTOM_SHARE, BUOY_STRIPE_TOP_SHARE),
          disc(BUOY_POLE_RADIUS, roofTop, poleTop, BUOY_LANTERN_SEGMENTS),
        ])
      ),
      lantern: toBuoySize(
        disc(BUOY_LANTERN_RADIUS, platformTop, lanternTop, BUOY_LANTERN_SEGMENTS)
      ),
      flag: toBuoySize(buildBuoyFlag()),
      hit: new THREE.CylinderGeometry(BUOY_HIT_RADIUS, BUOY_HIT_RADIUS, BUOY_HIT_HEIGHT).translate(
        0,
        BUOY_HIT_HEIGHT / 2 - START_MARKER_HEIGHT,
        0
      ),
    },
    materials: {
      body: paint(BUOY_COLOR),
      stripe: paint(BUOY_STRIPE_COLOR),
      lantern: rideWaves(new THREE.MeshBasicMaterial({ color: BUOY_LANTERN_COLOR })),
      flag: createFlagMaterial(),
    },
  }
}

type BuoyKit = ReturnType<typeof buildBuoyKit>

export function disposeBuoyKit({ geometries, materials }: BuoyKit) {
  for (const geometry of Object.values(geometries)) geometry.dispose()
  for (const material of Object.values(materials)) material.dispose()
}

// ── Arches ────────────────────────────────────────────────────────────────────
export function buildArchGeometry(ringCount: number) {
  const geometry = new THREE.TorusGeometry(
    GATE_HALF_WIDTH,
    ARCH_TUBE_RADIUS,
    ARCH_RADIAL_SEGMENTS,
    ARCH_TUBULAR_SEGMENTS
  ).translate(0, ARCH_LIFT, 0)
  geometry.setAttribute('aGlow', dynamicInstancedAttribute(ringCount))
  geometry.setAttribute('aPulse', dynamicInstancedAttribute(ringCount))
  return geometry
}

export const createArchMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: ARCH_VERT,
    fragmentShader: ARCH_FRAG,
    defines: floatDefines({
      ARCH_CORE_GLOW,
      ARCH_PULSE_SHINE,
      ARCH_RIM_GLOW,
      SOLID_ARCH_GLOW,
    }),
    uniforms: {
      ...waveUniforms,
      uColor: { value: displayColorOf(ARCH_COLOR) },
      uPresence: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
  })

// ── Ring-end foam ─────────────────────────────────────────────────────────────
export function buildRingFoamGeometry(endCount: number) {
  const geometry = buildFlatQuad()
  geometry.setAttribute('aFoam', dynamicInstancedAttribute(endCount))
  return geometry
}

export const createRingFoamMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: RING_FOAM_VERT,
    fragmentShader: RING_FOAM_FRAG,
    defines: floatDefines({
      RING_FOAM_BREATHE,
      RING_FOAM_BREATHE_RATE,
      RING_FOAM_GRAIN,
      RING_FOAM_JAG,
      RING_FOAM_REACH,
      RING_FOAM_SPECK,
      RING_FOAM_SPECK_GRAIN,
    }),
    uniforms: {
      ...waveUniforms,
      uColor: { value: new THREE.Color() },
    },
    transparent: true,
    depthWrite: false,
  })
