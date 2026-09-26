import * as THREE from 'three'
import { floatDefines } from '../../../../utils/glsl'
import { mix, rand } from '../../../../utils/math'
import {
  BASE_HALO_FILL,
  BASE_HALO_LIFT,
  BASE_HALO_SPREAD,
  BASE_HALO_STRENGTH,
  GEM_HALO_SPREAD,
  GEM_HALO_STRENGTH,
  MOTE_INNER_SHARE,
  MOTE_LIFETIME,
  MOTE_SPREAD,
  MOTE_STRENGTH,
  MOTE_SWIRL,
  MOTES_PER_BASE,
} from './constants'
import type { ShrineBase, ShrineGem } from './shrines'
import BASE_HALO_VERT from './shaders/baseHalo.vert.glsl'
import BASE_HALO_FRAG from './shaders/baseHalo.frag.glsl'
import BASE_MOTES_VERT from './shaders/baseMotes.vert.glsl'
import BASE_MOTES_FRAG from './shaders/baseMotes.frag.glsl'
import GEM_HALO_VERT from './shaders/gemHalo.vert.glsl'
import GEM_HALO_FRAG from './shaders/gemHalo.frag.glsl'

const HALO_CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildBaseHaloGeometry(
  bases: ShrineBase[],
  islandScale: number
): THREE.BufferGeometry {
  const positions = new Float32Array(bases.length * 4 * 3)
  const haloUvs = new Float32Array(bases.length * 4 * 2)
  const colors = new Float32Array(bases.length * 4 * 3)
  const indices: number[] = []

  bases.forEach((base, i) => {
    const reach = base.radius * BASE_HALO_SPREAD
    HALO_CORNERS.forEach(([across, along], corner) => {
      const vertex = i * 4 + corner
      positions.set(
        [
          base.center.x + across * reach,
          base.center.y + BASE_HALO_LIFT / islandScale,
          base.center.z - along * reach,
        ],
        vertex * 3
      )
      haloUvs.set([across * BASE_HALO_SPREAD, along * BASE_HALO_SPREAD], vertex * 2)
      colors.set([base.color.r, base.color.g, base.color.b], vertex * 3)
    })
    indices.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3)
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aHaloUv', new THREE.BufferAttribute(haloUvs, 2))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  return geometry
}

export function buildMoteGeometry(bases: ShrineBase[]): THREE.BufferGeometry {
  const count = bases.length * MOTES_PER_BASE
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count * 4)
  const radii = new Float32Array(count)
  const colors = new Float32Array(count * 3)

  bases.forEach((base, baseIndex) => {
    for (let i = 0; i < MOTES_PER_BASE; i++) {
      const mote = baseIndex * MOTES_PER_BASE + i
      positions.set([base.center.x, base.center.y, base.center.z], mote * 3)
      seeds.set(
        [
          (i + rand(0, 0.5)) / MOTES_PER_BASE,
          rand(0, Math.PI * 2),
          mix(MOTE_INNER_SHARE, 1, Math.sqrt(Math.random())),
          rand(0.6, 1.2),
        ],
        mote * 4
      )
      radii[mote] = base.radius
      colors.set([base.color.r, base.color.g, base.color.b], mote * 3)
    }
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  return geometry
}

export function buildGemHaloGeometry(gems: ShrineGem[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(gems.flatMap((gem) => gem.center.toArray())), 3)
  )
  geometry.setAttribute(
    'aRadius',
    new THREE.BufferAttribute(new Float32Array(gems.map((gem) => gem.radius)), 1)
  )
  geometry.setAttribute(
    'aColor',
    new THREE.BufferAttribute(new Float32Array(gems.flatMap((gem) => gem.color.toArray())), 3)
  )
  return geometry
}

// ── Materials ─────────────────────────────────────────────────────────────────

function glowMaterial(
  vertexShader: string,
  fragmentShader: string,
  defines: Record<string, number>,
  uniforms: Record<string, THREE.IUniform>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: floatDefines(defines),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uGlow: { value: 0 }, ...uniforms },
  })
}

export const createBaseHaloMaterial = () =>
  glowMaterial(
    BASE_HALO_VERT,
    BASE_HALO_FRAG,
    {
      HALO_SPREAD: BASE_HALO_SPREAD,
      HALO_FILL: BASE_HALO_FILL,
      HALO_STRENGTH: BASE_HALO_STRENGTH,
    },
    {}
  )

export const createMoteMaterial = () =>
  glowMaterial(
    BASE_MOTES_VERT,
    BASE_MOTES_FRAG,
    {
      LIFETIME: MOTE_LIFETIME,
      SWIRL: MOTE_SWIRL,
      SPREAD: MOTE_SPREAD,
      STRENGTH: MOTE_STRENGTH,
    },
    { uTime: { value: 0 }, uSize: { value: 1 }, uRise: { value: 0 } }
  )

export const createGemHaloMaterial = () =>
  glowMaterial(
    GEM_HALO_VERT,
    GEM_HALO_FRAG,
    { HALO_SPREAD: GEM_HALO_SPREAD, HALO_STRENGTH: GEM_HALO_STRENGTH },
    { uPixelsPerUnit: { value: 1 } }
  )
