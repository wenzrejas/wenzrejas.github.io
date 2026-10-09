import * as THREE from 'three'
import FIELD_QUAD_VERT from '@/shaders/fieldQuad.vert.glsl'
import { stitchRibbon } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import { buildWaterlineField, distanceAt, type DistanceField } from '@/world/shore/shoreField'
import {
  CIRCUIT_REFRACTION_GRAIN,
  CIRCUIT_SHIMMER_GRAIN,
  CIRCUIT_SHIMMER_RATE,
  CIRCUIT_SHIMMER_SWAY,
  CONDUIT_BODY_GLOW,
  CONDUIT_EDGE_FADE,
  CONDUIT_END_FADE,
  CONDUIT_END_FLARE,
  CONDUIT_FLARE_LENGTH,
  CONDUIT_FEATHER,
  CONDUIT_FLOW_RATE,
  CONDUIT_HEAD_GLOW,
  CONDUIT_HEAD_SPREAD,
  CONDUIT_PULSES,
  CONDUIT_REFRACTION,
  CONDUIT_SEGMENTS,
  CONDUIT_SHARPNESS,
  CONDUIT_SHORE_CLEARANCE,
  CONDUIT_SHORE_OVERLAP,
  CONDUIT_WIDTH,
  SEABED_GLOW_INSET,
  SEABED_GLOW_MARGIN,
  SEABED_GLOW_REACH,
  SEABED_GLOW_RESOLUTION,
  SEABED_GLOW_STRENGTH,
  SEABED_OUTLINE_GAP,
  SEABED_OUTLINE_REFRACTION,
  SEABED_OUTLINE_STRENGTH,
  SEABED_OUTLINE_WIDTH,
  SEABED_PULSE_DEPTH,
  SEABED_PULSE_RATE,
} from './constants'
import type { MainIsland } from './mainIsland'
import type { Monolith } from './monoliths'
import SEABED_GLOW_FRAG from './shaders/seabedGlow.frag.glsl'
import CONDUIT_VERT from './shaders/conduit.vert.glsl'
import CONDUIT_FRAG from './shaders/conduit.frag.glsl'

interface Conduit {
  start: THREE.Vector2
  end: THREE.Vector2
}

const { smoothstep } = THREE.MathUtils

function createUnderwaterLightMaterial(
  vertexShader: string,
  fragmentShader: string,
  defines: Record<string, number>,
  uniforms: Record<string, THREE.IUniform>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: floatDefines({
      ...defines,
      SHIMMER_GRAIN: CIRCUIT_SHIMMER_GRAIN,
      SHIMMER_SWAY: CIRCUIT_SHIMMER_SWAY,
      SHIMMER_RATE: CIRCUIT_SHIMMER_RATE,
      REFRACTION_GRAIN: CIRCUIT_REFRACTION_GRAIN,
    }),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uGlow: { value: 0 }, uTime: { value: 0 }, ...uniforms },
  })
}

// ── Seabed glow ───────────────────────────────────────────────────────────────

export const traceSeabedGlow = (land: THREE.Object3D, waterY: number) =>
  buildWaterlineField(land, waterY, SEABED_GLOW_MARGIN, SEABED_GLOW_RESOLUTION)

export const createSeabedGlowMaterial = (color: THREE.Color) =>
  createUnderwaterLightMaterial(
    FIELD_QUAD_VERT,
    SEABED_GLOW_FRAG,
    {
      GLOW_REACH: SEABED_GLOW_REACH,
      GLOW_INSET: SEABED_GLOW_INSET,
      GLOW_MARGIN: SEABED_GLOW_MARGIN,
      GLOW_STRENGTH: SEABED_GLOW_STRENGTH,
      OUTLINE_GAP: SEABED_OUTLINE_GAP,
      OUTLINE_WIDTH: SEABED_OUTLINE_WIDTH,
      OUTLINE_STRENGTH: SEABED_OUTLINE_STRENGTH,
      OUTLINE_REFRACTION: SEABED_OUTLINE_REFRACTION,
      PULSE_RATE: SEABED_PULSE_RATE,
      PULSE_DEPTH: SEABED_PULSE_DEPTH,
    },
    { uColor: { value: color }, uField: { value: null } }
  )

// ── Conduits ──────────────────────────────────────────────────────────────────

function leaveShore(shoreline: DistanceField, from: THREE.Vector2, toward: THREE.Vector2) {
  const step = shoreline.size / shoreline.resolution
  const length = from.distanceTo(toward)
  const point = new THREE.Vector2()
  for (let travelled = 0; travelled < length; travelled += step) {
    point.lerpVectors(from, toward, travelled / length)
    if (distanceAt(shoreline, point.x, point.y) > CONDUIT_SHORE_CLEARANCE) return point
  }
  return point.copy(toward)
}

function traceConduits(
  shoreline: DistanceField,
  mainIsland: MainIsland,
  monoliths: Monolith[]
): Conduit[] {
  const center = new THREE.Vector2(mainIsland.summit.center.x, mainIsland.summit.center.z)
  return monoliths.map(({ marker }) => {
    const station = new THREE.Vector2(marker.x, marker.z)
    const start = leaveShore(shoreline, center, station)
    const end = leaveShore(shoreline, station, center)
    const overlap = end.clone().sub(start).setLength(CONDUIT_SHORE_OVERLAP)
    return { start: start.sub(overlap), end: end.add(overlap) }
  })
}

export function buildConduitGeometry(
  shoreline: DistanceField,
  mainIsland: MainIsland,
  monoliths: Monolith[]
): THREE.BufferGeometry {
  const positions: number[] = []
  const alongs: number[] = []
  const acrosses: number[] = []
  const indices: number[] = []
  const point = new THREE.Vector2()
  const side = new THREE.Vector2()
  const across = new THREE.Vector2()

  for (const { start, end } of traceConduits(shoreline, mainIsland, monoliths)) {
    const first = positions.length / 3
    const length = start.distanceTo(end)
    side
      .subVectors(end, start)
      .rotateAround(new THREE.Vector2(), Math.PI / 2)
      .setLength(CONDUIT_WIDTH / 2)
    for (let i = 0; i <= CONDUIT_SEGMENTS; i++) {
      const along = i / CONDUIT_SEGMENTS
      const fromEnd = Math.min(along, 1 - along) * length
      const flare =
        1 - smoothstep(fromEnd, CONDUIT_SHORE_OVERLAP, CONDUIT_SHORE_OVERLAP + CONDUIT_FLARE_LENGTH)
      across.copy(side).multiplyScalar(1 + CONDUIT_END_FLARE * flare)
      point.lerpVectors(start, end, along)
      positions.push(
        point.x - across.x,
        0,
        point.y - across.y,
        point.x + across.x,
        0,
        point.y + across.y
      )
      alongs.push(along, along)
      acrosses.push(-1, 1)
    }
    stitchRibbon(indices, first, CONDUIT_SEGMENTS + 1)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('along', new THREE.Float32BufferAttribute(alongs, 1))
  geometry.setAttribute('across', new THREE.Float32BufferAttribute(acrosses, 1))
  geometry.setIndex(indices)
  return geometry
}

export const createConduitMaterial = (color: THREE.Color) =>
  createUnderwaterLightMaterial(
    CONDUIT_VERT,
    CONDUIT_FRAG,
    {
      CONDUIT_SHARPNESS,
      CONDUIT_FEATHER,
      CONDUIT_PULSES,
      EDGE_FADE: CONDUIT_EDGE_FADE,
      END_FADE: CONDUIT_END_FADE,
      HEAD_SPREAD: CONDUIT_HEAD_SPREAD,
      HEAD_GLOW: CONDUIT_HEAD_GLOW,
      BODY_GLOW: CONDUIT_BODY_GLOW,
      FLOW_RATE: CONDUIT_FLOW_RATE,
      REFRACTION: CONDUIT_REFRACTION,
    },
    { uColor: { value: color }, uFront: { value: 0 } }
  )
