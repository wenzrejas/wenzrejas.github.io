import * as THREE from 'three'
import { columnBoundingSphere } from '@/utils/bounds'
import { floatDefines } from '@/utils/glsl'
import { rand } from '@/utils/math'
import { WEATHER_PARAMS } from '@/world/environment/weather/constants'
import {
  SMOKE_DRIFT,
  SMOKE_LIFETIME,
  SMOKE_OPACITY,
  SMOKE_PUFF_COUNT,
  SMOKE_PUFF_GROWTH,
  SMOKE_PUFF_SIZE,
  SMOKE_PUFF_SIZE_VARIANCE,
  SMOKE_RISE,
  SMOKE_SHADE,
  SMOKE_SPREAD,
  SMOKE_SWAY,
} from './constants'
import SMOKE_VERT from './shaders/chimneySmoke.vert.glsl'
import SMOKE_FRAG from './shaders/chimneySmoke.frag.glsl'

const STRONGEST_WIND = Math.max(...Object.values(WEATHER_PARAMS).map(({ windMult }) => windMult))

// ── Geometry ──────────────────────────────────────────────────────────────────

function smokeReach(): THREE.Sphere {
  const puffRadius = (SMOKE_PUFF_SIZE * (1 + SMOKE_PUFF_SIZE_VARIANCE) * SMOKE_PUFF_GROWTH) / 2
  const spread = SMOKE_SPREAD + SMOKE_SWAY * Math.SQRT2 + SMOKE_DRIFT * STRONGEST_WIND + puffRadius
  return columnBoundingSphere(spread, -puffRadius, SMOKE_RISE + puffRadius)
}

export function buildSmokeGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array(SMOKE_PUFF_COUNT * 3)
  const seeds = new Float32Array(SMOKE_PUFF_COUNT * 3)

  for (let i = 0; i < SMOKE_PUFF_COUNT; i++) {
    seeds[i * 3] = i / SMOKE_PUFF_COUNT
    seeds[i * 3 + 1] = Math.random() * Math.PI * 2
    seeds[i * 3 + 2] = rand(1 - SMOKE_PUFF_SIZE_VARIANCE, 1 + SMOKE_PUFF_SIZE_VARIANCE)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
  geometry.boundingSphere = smokeReach()
  return geometry
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createSmokeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: SMOKE_VERT,
    fragmentShader: SMOKE_FRAG,
    defines: floatDefines({
      LIFETIME: SMOKE_LIFETIME,
      GROWTH: SMOKE_PUFF_GROWTH,
      RISE: SMOKE_RISE,
      SPREAD: SMOKE_SPREAD,
      SWAY: SMOKE_SWAY,
      OPACITY: SMOKE_OPACITY,
      SHADE: SMOKE_SHADE,
    }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uDrift: { value: new THREE.Vector2() },
      uPresence: { value: 0 },
      uColor: { value: new THREE.Color() },
    },
  })
}
