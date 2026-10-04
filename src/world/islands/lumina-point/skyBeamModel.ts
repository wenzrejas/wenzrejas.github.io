import * as THREE from 'three'
import { rand } from '@/utils/math'
import type { GlowSite } from '../shared/ground-glow/glowSites'
import {
  buildMoteGeometry as buildGroundMoteGeometry,
  createAdditiveGlowMaterial,
  createMoteMaterial as createGroundMoteMaterial,
} from '../shared/ground-glow/groundGlowModel'
import {
  CHARGE_MOTE_LIFETIME,
  CHARGE_MOTE_REACH,
  CHARGE_MOTE_SWIRL,
  CHARGE_MOTE_SWIRL_MAX,
  CHARGE_MOTE_SWIRL_MIN,
  CHARGE_MOTES,
  ORB_FLASH_GROWTH,
  ORB_HALO,
  ORB_PLASMA_DRIFT,
  ORB_PLASMA_SCALE,
  ORB_RADIUS,
  RISING_MOTE_RADIUS,
  RISING_MOTES,
  SKY_BEAM_BODY_SHARPNESS,
  SKY_BEAM_BODY_STRENGTH,
  SKY_BEAM_COLOR,
  SKY_BEAM_CORE_SHARPNESS,
  SKY_BEAM_FLOW_DENSITY,
  SKY_BEAM_FLOW_DEPTH,
  SKY_BEAM_FLOW_SPEED,
  SKY_BEAM_HAZE_SHARPNESS,
  SKY_BEAM_HAZE_STRENGTH,
  SKY_BEAM_HEIGHT,
  SKY_BEAM_SEGMENTS,
  SKY_BEAM_TAPER_CURVE,
  SKY_BEAM_TAPER_DROP,
  SKY_BEAM_TAPER_LENGTH,
  SKY_BEAM_TAPER_RINGS,
  SKY_BEAM_TIP_SHARE,
  SPARK_ARC_SEGMENTS,
  SPARK_ARCS,
  SPARK_HALF_WIDTH,
  SPARK_JITTER,
  SPARK_LENGTH_MAX,
  SPARK_SHELL_OUTER,
} from './constants'
import SPARK_ARC_VERT from './shaders/sparkArc.vert.glsl'
import SPARK_ARC_FRAG from './shaders/sparkArc.frag.glsl'
import CHARGE_ORB_VERT from './shaders/chargeOrb.vert.glsl'
import CHARGE_ORB_FRAG from './shaders/chargeOrb.frag.glsl'
import CHARGE_MOTES_VERT from './shaders/chargeMotes.vert.glsl'
import CHARGE_MOTES_FRAG from './shaders/chargeMotes.frag.glsl'
import SKY_BEAM_VERT from './shaders/skyBeam.vert.glsl'
import SKY_BEAM_FRAG from './shaders/skyBeam.frag.glsl'

export interface SkyBeamMaterials {
  arcs: THREE.ShaderMaterial
  chargeMotes: THREE.ShaderMaterial
  risingMotes: THREE.ShaderMaterial
  orb: THREE.ShaderMaterial
  beam: THREE.ShaderMaterial
}

const BEAM_TINT = new THREE.Color(SKY_BEAM_COLOR)

const dynamicAttribute = (length: number, itemSize: number) =>
  new THREE.BufferAttribute(new Float32Array(length * itemSize), itemSize).setUsage(
    THREE.DynamicDrawUsage
  )

// ── Spark arcs ────────────────────────────────────────────────────────────────

export function buildArcGeometry(): THREE.BufferGeometry {
  const segments = SPARK_ARCS * SPARK_ARC_SEGMENTS
  const sides = new Float32Array(segments * 4)
  const indices: number[] = []
  for (let segment = 0; segment < segments; segment++) {
    const first = segment * 4
    sides.set([-1, 1, -1, 1], first)
    indices.push(first, first + 1, first + 3, first, first + 3, first + 2)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', dynamicAttribute(segments * 4, 3))
  geometry.setAttribute('aDirection', dynamicAttribute(segments * 4, 3))
  geometry.setAttribute('aBrightness', dynamicAttribute(segments * 4, 1))
  geometry.setAttribute('aSide', new THREE.BufferAttribute(sides, 1))
  geometry.setIndex(indices)
  geometry.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(),
    SPARK_SHELL_OUTER + SPARK_LENGTH_MAX * (1 + SPARK_JITTER)
  )
  return geometry
}

function createArcMaterial(): THREE.ShaderMaterial {
  const material = createAdditiveGlowMaterial(
    SPARK_ARC_VERT,
    SPARK_ARC_FRAG,
    {},
    { uColor: { value: BEAM_TINT }, uHalfWidth: { value: SPARK_HALF_WIDTH } }
  )
  material.side = THREE.DoubleSide
  return material
}

// ── Charge orb ────────────────────────────────────────────────────────────────

export function buildOrbGeometry(): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(2, 2)
  geometry.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(),
    ORB_RADIUS * ORB_HALO * (1 + ORB_FLASH_GROWTH)
  )
  return geometry
}

function createOrbMaterial(): THREE.ShaderMaterial {
  const material = createAdditiveGlowMaterial(
    CHARGE_ORB_VERT,
    CHARGE_ORB_FRAG,
    { CORE_SHARE: 1 / ORB_HALO, PLASMA_SCALE: ORB_PLASMA_SCALE, PLASMA_DRIFT: ORB_PLASMA_DRIFT },
    { uColor: { value: BEAM_TINT }, uSize: { value: 0 }, uTime: { value: 0 } }
  )
  material.depthTest = false
  return material
}

// ── Charge motes ──────────────────────────────────────────────────────────────

export function buildChargeMoteGeometry(): THREE.BufferGeometry {
  const directions = new Float32Array(CHARGE_MOTES * 3)
  const seeds = new Float32Array(CHARGE_MOTES * 2)
  const direction = new THREE.Vector3()
  for (let mote = 0; mote < CHARGE_MOTES; mote++) {
    directions.set(direction.randomDirection().toArray(), mote * 3)
    seeds.set([Math.random(), rand(CHARGE_MOTE_SWIRL_MIN, CHARGE_MOTE_SWIRL_MAX)], mote * 2)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(CHARGE_MOTES * 3), 3)
  )
  geometry.setAttribute('aDirection', new THREE.BufferAttribute(directions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 2))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CHARGE_MOTE_REACH)
  return geometry
}

const createChargeMoteMaterial = () =>
  createAdditiveGlowMaterial(
    CHARGE_MOTES_VERT,
    CHARGE_MOTES_FRAG,
    {
      LIFETIME: CHARGE_MOTE_LIFETIME,
      REACH: CHARGE_MOTE_REACH,
      CORE: ORB_RADIUS,
      SWIRL: CHARGE_MOTE_SWIRL,
    },
    {
      uColor: { value: BEAM_TINT },
      uTime: { value: 0 },
      uSize: { value: 1 },
    }
  )

// ── Rising motes ──────────────────────────────────────────────────────────────

const beamBase = (): GlowSite => ({
  center: new THREE.Vector3(),
  radius: RISING_MOTE_RADIUS,
  color: BEAM_TINT,
})

export const buildRisingMoteGeometry = (islandScale: number) =>
  buildGroundMoteGeometry([beamBase()], RISING_MOTES, islandScale)

const createRisingMoteMaterial = () => createGroundMoteMaterial(RISING_MOTES, 1)

// ── Beam column ───────────────────────────────────────────────────────────────

export function buildBeamGeometry(): THREE.LatheGeometry {
  const dropShare = SKY_BEAM_TAPER_DROP / SKY_BEAM_HEIGHT
  const taperShare = SKY_BEAM_TAPER_LENGTH / SKY_BEAM_HEIGHT
  const profile = Array.from({ length: SKY_BEAM_TAPER_RINGS + 1 }, (_, ring) => {
    const along = ring / SKY_BEAM_TAPER_RINGS
    return new THREE.Vector2(along ** SKY_BEAM_TAPER_CURVE, along * taperShare - dropShare)
  })
  profile.push(new THREE.Vector2(1, 1))
  return new THREE.LatheGeometry(profile, SKY_BEAM_SEGMENTS)
}

const createBeamMaterial = () =>
  createAdditiveGlowMaterial(
    SKY_BEAM_VERT,
    SKY_BEAM_FRAG,
    {
      CORE_SHARPNESS: SKY_BEAM_CORE_SHARPNESS,
      BODY_SHARPNESS: SKY_BEAM_BODY_SHARPNESS,
      BODY_STRENGTH: SKY_BEAM_BODY_STRENGTH,
      HAZE_SHARPNESS: SKY_BEAM_HAZE_SHARPNESS,
      HAZE_STRENGTH: SKY_BEAM_HAZE_STRENGTH,
      FLOW_DENSITY: SKY_BEAM_FLOW_DENSITY,
      FLOW_SPEED: SKY_BEAM_FLOW_SPEED,
      FLOW_DEPTH: SKY_BEAM_FLOW_DEPTH,
      TIP_SHARE: SKY_BEAM_TIP_SHARE,
    },
    {
      uColor: { value: BEAM_TINT },
      uTime: { value: 0 },
      uLength: { value: 0 },
    }
  )

// ── Materials ─────────────────────────────────────────────────────────────────

export const createSkyBeamMaterials = (): SkyBeamMaterials => ({
  arcs: createArcMaterial(),
  chargeMotes: createChargeMoteMaterial(),
  risingMotes: createRisingMoteMaterial(),
  orb: createOrbMaterial(),
  beam: createBeamMaterial(),
})
