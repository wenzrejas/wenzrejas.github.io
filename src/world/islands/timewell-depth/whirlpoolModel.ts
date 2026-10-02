import * as THREE from 'three'
import { columnBoundingSphere } from '@/utils/bounds'
import { floatDefines } from '@/utils/glsl'
import { rand } from '@/utils/math'
import { oceanSurfaceUniforms } from '@/world/environment/ocean/oceanSurfaceUniforms'
import { FOAM_GRAIN, FOAM_JAG } from '@/world/shore/constants'
import type { ShoreField } from '@/world/shore/shoreField'
import {
  WHIRLPOOL_ARM_CONTRAST,
  WHIRLPOOL_ARM_CREST,
  WHIRLPOOL_ARMS,
  WHIRLPOOL_BASE_FOAM,
  WHIRLPOOL_CELL_STRETCH,
  WHIRLPOOL_CELLS_AROUND,
  WHIRLPOOL_COLLAR_IMPACT,
  WHIRLPOOL_COLLAR_LEE,
  WHIRLPOOL_CORE_SHADE,
  WHIRLPOOL_CREST_FOAM,
  WHIRLPOOL_DEPTH_REACH,
  WHIRLPOOL_FADE_START,
  WHIRLPOOL_FLECK_DENSITY,
  WHIRLPOOL_FLECK_SIZE,
  WHIRLPOOL_FLOW_DENSITY,
  WHIRLPOOL_FLOW_SPEED,
  WHIRLPOOL_FOAM_GLOW,
  WHIRLPOOL_FOAM_THIN_START,
  WHIRLPOOL_FUNNEL_CURVE,
  WHIRLPOOL_FUNNEL_DEPTH,
  WHIRLPOOL_FUNNEL_RINGS,
  WHIRLPOOL_FUNNEL_SEGMENTS,
  WHIRLPOOL_GLOW_COLOR,
  WHIRLPOOL_GLOW_PULSE,
  WHIRLPOOL_GLOW_PULSE_SPEED,
  WHIRLPOOL_GLOW_RADIUS,
  WHIRLPOOL_GLOW_STRENGTH,
  WHIRLPOOL_HALO_RADIUS,
  WHIRLPOOL_HALO_STRENGTH,
  WHIRLPOOL_HOLE_CELLS,
  WHIRLPOOL_HOLE_SIZE,
  WHIRLPOOL_HOLE_WOBBLE,
  WHIRLPOOL_LIGHT_DASH_DENSITY,
  WHIRLPOOL_LIGHT_RUSH,
  WHIRLPOOL_LIGHT_SHARE,
  WHIRLPOOL_LIGHT_STREAKS,
  WHIRLPOOL_LIGHT_STRENGTH,
  WHIRLPOOL_LIGHT_TAIL,
  WHIRLPOOL_LIGHT_WIDTH,
  WHIRLPOOL_MAGIC_COLOR,
  WHIRLPOOL_MAGIC_GLOW_BOOST,
  WHIRLPOOL_MAGIC_HALO_BOOST,
  WHIRLPOOL_MAGIC_SHIFT,
  WHIRLPOOL_MAGIC_SHIFT_SPEED,
  WHIRLPOOL_MOTE_CENTER_BIAS,
  WHIRLPOOL_MOTE_LIFETIME,
  WHIRLPOOL_MOTE_REACH,
  WHIRLPOOL_MOTE_RISE,
  WHIRLPOOL_MOTE_STRENGTH,
  WHIRLPOOL_MOTES,
  WHIRLPOOL_PATCH_CELLS,
  WHIRLPOOL_PATCH_REACH,
  WHIRLPOOL_RADIUS,
  WHIRLPOOL_SHORE_BLEND,
  WHIRLPOOL_STREAK_CELLS,
  WHIRLPOOL_STREAK_COARSEN_RADIUS,
  WHIRLPOOL_TWIST,
  WHIRLPOOL_WAKE_LENGTH,
  WHIRLPOOL_WAKE_STRENGTH,
  WHIRLPOOL_WARP,
  WHIRLPOOL_WARP_CELLS,
} from './constants'
import { funnelDip } from './whirlpoolFunnel'
import { TIMEWELL_BASIN } from './shoreProfile'
import WHIRLPOOL_VERT from './shaders/whirlpool.vert.glsl'
import WHIRLPOOL_FRAG from './shaders/whirlpool.frag.glsl'
import MOTES_VERT from './shaders/whirlpoolMotes.vert.glsl'
import MOTES_FRAG from './shaders/whirlpoolMotes.frag.glsl'

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildWhirlpoolGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.RingGeometry(
    0,
    1,
    WHIRLPOOL_FUNNEL_SEGMENTS,
    WHIRLPOOL_FUNNEL_RINGS
  ).rotateX(-Math.PI / 2)

  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i++) {
    position.setY(i, -funnelDip(Math.hypot(position.getX(i), position.getZ(i))))
  }
  return geometry
}

export function buildMoteGeometry(islandScale: number): THREE.BufferGeometry {
  const seeds = new Float32Array(WHIRLPOOL_MOTES * 4)
  for (let i = 0; i < WHIRLPOOL_MOTES; i++) {
    seeds.set(
      [
        (i + rand(0, 0.5)) / WHIRLPOOL_MOTES,
        rand(0, Math.PI * 2),
        WHIRLPOOL_MOTE_REACH * Math.random() ** WHIRLPOOL_MOTE_CENTER_BIAS,
        rand(0.6, 1.3),
      ],
      i * 4
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(WHIRLPOOL_MOTES * 3), 3)
  )
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))

  const rise = WHIRLPOOL_MOTE_RISE / (WHIRLPOOL_RADIUS * islandScale)
  geometry.boundingSphere = columnBoundingSphere(
    WHIRLPOOL_MOTE_REACH,
    -WHIRLPOOL_FUNNEL_DEPTH,
    rise
  )
  return geometry
}

// ── Materials ─────────────────────────────────────────────────────────────────

export function createWhirlpoolMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: WHIRLPOOL_VERT,
    fragmentShader: WHIRLPOOL_FRAG,
    defines: floatDefines({
      FADE_START: WHIRLPOOL_FADE_START,
      TWIST: WHIRLPOOL_TWIST,
      FLOW_DENSITY: WHIRLPOOL_FLOW_DENSITY,
      FLOW_SPEED: WHIRLPOOL_FLOW_SPEED,
      WARP: WHIRLPOOL_WARP,
      WARP_CELLS: WHIRLPOOL_WARP_CELLS,
      FUNNEL_DEPTH: WHIRLPOOL_FUNNEL_DEPTH,
      FUNNEL_CURVE: WHIRLPOOL_FUNNEL_CURVE,
      CELLS_AROUND: WHIRLPOOL_CELLS_AROUND,
      CELL_STRETCH: WHIRLPOOL_CELL_STRETCH,
      CORE_SHADE: WHIRLPOOL_CORE_SHADE,
      DEPTH_REACH: WHIRLPOOL_DEPTH_REACH,
      ARMS: WHIRLPOOL_ARMS,
      ARM_CREST: WHIRLPOOL_ARM_CREST,
      ARM_CONTRAST: WHIRLPOOL_ARM_CONTRAST,
      BASE_FOAM: WHIRLPOOL_BASE_FOAM,
      CREST_FOAM: WHIRLPOOL_CREST_FOAM,
      FOAM_THIN_START: WHIRLPOOL_FOAM_THIN_START,
      STREAK_CELLS: WHIRLPOOL_STREAK_CELLS,
      STREAK_COARSEN_RADIUS: WHIRLPOOL_STREAK_COARSEN_RADIUS,
      HOLE_CELLS: WHIRLPOOL_HOLE_CELLS,
      HOLE_SIZE: WHIRLPOOL_HOLE_SIZE,
      HOLE_WOBBLE: WHIRLPOOL_HOLE_WOBBLE,
      FLECK_DENSITY: WHIRLPOOL_FLECK_DENSITY,
      FLECK_SIZE: WHIRLPOOL_FLECK_SIZE,
      FOAM_GRAIN,
      FOAM_JAG,
      SHORE_BLEND: WHIRLPOOL_SHORE_BLEND,
      COLLAR_IMPACT: WHIRLPOOL_COLLAR_IMPACT,
      COLLAR_LEE: WHIRLPOOL_COLLAR_LEE,
      PATCH_REACH: WHIRLPOOL_PATCH_REACH,
      PATCH_CELLS: WHIRLPOOL_PATCH_CELLS,
      WAKE_LENGTH: WHIRLPOOL_WAKE_LENGTH,
      WAKE_STRENGTH: WHIRLPOOL_WAKE_STRENGTH,
      MAGIC_SHIFT: WHIRLPOOL_MAGIC_SHIFT,
      MAGIC_SHIFT_SPEED: WHIRLPOOL_MAGIC_SHIFT_SPEED,
      MAGIC_GLOW_BOOST: WHIRLPOOL_MAGIC_GLOW_BOOST,
      MAGIC_HALO_BOOST: WHIRLPOOL_MAGIC_HALO_BOOST,
      FOAM_GLOW: WHIRLPOOL_FOAM_GLOW,
      LIGHT_STREAKS: WHIRLPOOL_LIGHT_STREAKS,
      LIGHT_DASH_DENSITY: WHIRLPOOL_LIGHT_DASH_DENSITY,
      LIGHT_RUSH: WHIRLPOOL_LIGHT_RUSH,
      LIGHT_TAIL: WHIRLPOOL_LIGHT_TAIL,
      LIGHT_WIDTH: WHIRLPOOL_LIGHT_WIDTH,
      LIGHT_SHARE: WHIRLPOOL_LIGHT_SHARE,
      LIGHT_STRENGTH: WHIRLPOOL_LIGHT_STRENGTH,
      GLOW_RADIUS: WHIRLPOOL_GLOW_RADIUS,
      GLOW_STRENGTH: WHIRLPOOL_GLOW_STRENGTH,
      GLOW_PULSE: WHIRLPOOL_GLOW_PULSE,
      GLOW_PULSE_SPEED: WHIRLPOOL_GLOW_PULSE_SPEED,
      HALO_RADIUS: WHIRLPOOL_HALO_RADIUS,
      HALO_STRENGTH: WHIRLPOOL_HALO_STRENGTH,
    }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      ...oceanSurfaceUniforms,
      uTime: { value: 0 },
      uShoreField: { value: null },
      uIslandScale: { value: 1 },
      uFieldScale: { value: 1 },
      uFieldOrigin: { value: new THREE.Vector2() },
      uFieldTexel: { value: 1 },
      uFieldUvPerWorld: { value: 1 },
      uBackground: { value: new THREE.Color() },
      uFoamColor: { value: new THREE.Color(1, 1, 1) },
      uGlowColor: { value: new THREE.Color(WHIRLPOOL_GLOW_COLOR) },
      uMagicColor: { value: new THREE.Color(WHIRLPOOL_MAGIC_COLOR) },
      uNight: { value: 0 },
      uMagic: { value: 0 },
    },
  })
}

export function createMoteMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: MOTES_VERT,
    fragmentShader: MOTES_FRAG,
    defines: floatDefines({
      MOTE_LIFETIME: WHIRLPOOL_MOTE_LIFETIME,
      MOTE_STRENGTH: WHIRLPOOL_MOTE_STRENGTH,
      FUNNEL_DEPTH: WHIRLPOOL_FUNNEL_DEPTH,
      FUNNEL_CURVE: WHIRLPOOL_FUNNEL_CURVE,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uRise: { value: 0 },
      uMagic: { value: 0 },
      uGlowColor: { value: new THREE.Color(WHIRLPOOL_GLOW_COLOR) },
      uMagicColor: { value: new THREE.Color(WHIRLPOOL_MAGIC_COLOR) },
    },
  })
}

// ── Shore alignment ───────────────────────────────────────────────────────────

export function alignToShore(
  material: THREE.ShaderMaterial,
  shoreline: ShoreField,
  shoreTexture: THREE.Texture,
  center: THREE.Vector3,
  islandScale: number
): void {
  const { uniforms } = material
  uniforms.uShoreField.value = shoreTexture
  uniforms.uIslandScale.value = islandScale
  uniforms.uFieldScale.value = WHIRLPOOL_RADIUS / shoreline.size
  uniforms.uFieldOrigin.value.set(
    (center.x + TIMEWELL_BASIN.x - shoreline.centerX) / shoreline.size + 0.5,
    (center.z + TIMEWELL_BASIN.z - shoreline.centerZ) / shoreline.size + 0.5
  )
  uniforms.uFieldTexel.value = 1 / shoreline.resolution
  uniforms.uFieldUvPerWorld.value = 1 / (shoreline.size * islandScale)
}
