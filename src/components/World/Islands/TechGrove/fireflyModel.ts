import * as THREE from 'three'
import { floatDefines } from '../../../../utils/glsl'
import { rand } from '../../../../utils/math'
import {
  FIREFLY_COLOR,
  FIREFLY_COUNT,
  FIREFLY_FADE_BAND,
  FIREFLY_HEIGHT_MAX,
  FIREFLY_HEIGHT_MIN,
  FIREFLY_SPREAD,
} from './constants'
import FIREFLIES_VERT from './shaders/fireflies.vert.glsl'
import FIREFLIES_FRAG from './shaders/fireflies.frag.glsl'

export interface Islet {
  x: number
  z: number
  radius: number
}

export interface FireflyField {
  islets: Islet[]
  center: THREE.Vector3
  islandScale: number
  offsetY: number
}

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildFireflyGeometry({
  islets,
  center,
  islandScale,
  offsetY,
}: FireflyField): THREE.BufferGeometry {
  const positions = new Float32Array(FIREFLY_COUNT * 3)
  const seeds = new Float32Array(FIREFLY_COUNT * 4)

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    const islet = islets[Math.floor(Math.random() * islets.length)]
    const angle = Math.random() * Math.PI * 2
    const reach = islet.radius * FIREFLY_SPREAD * Math.sqrt(Math.random())
    const height = rand(FIREFLY_HEIGHT_MIN, FIREFLY_HEIGHT_MAX)

    positions[i * 3] = center.x + islet.x + Math.cos(angle) * reach
    positions[i * 3 + 1] = (height - offsetY) / islandScale
    positions[i * 3 + 2] = center.z + islet.z + Math.sin(angle) * reach

    seeds[i * 4] = Math.random()
    seeds[i * 4 + 1] = Math.random()
    seeds[i * 4 + 2] = Math.random()
    seeds[i * 4 + 3] = ((i + Math.random()) / FIREFLY_COUNT) * (1 - FIREFLY_FADE_BAND)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
  return geo
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createFireflyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: FIREFLIES_VERT,
    fragmentShader: FIREFLIES_FRAG,
    defines: floatDefines({ FADE_BAND: FIREFLY_FADE_BAND }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uWander: { value: 0 },
      uBob: { value: 0 },
      uPresence: { value: 0 },
      uColor: { value: new THREE.Color(FIREFLY_COLOR) },
    },
  })
}
