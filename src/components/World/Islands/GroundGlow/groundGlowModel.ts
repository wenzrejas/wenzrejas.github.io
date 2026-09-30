import * as THREE from 'three'
import { floatDefines } from '../../../../utils/glsl'
import { mix, rand } from '../../../../utils/math'
import type { GlowSite, GroundGlowTuning } from './glowSites'
import GROUND_HALO_VERT from './shaders/groundHalo.vert.glsl'
import GROUND_HALO_FRAG from './shaders/groundHalo.frag.glsl'
import GROUND_MOTES_VERT from './shaders/groundMotes.vert.glsl'
import GROUND_MOTES_FRAG from './shaders/groundMotes.frag.glsl'

const HALO_CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildHaloGeometry(
  sites: GlowSite[],
  tuning: GroundGlowTuning,
  islandScale: number
): THREE.BufferGeometry {
  const positions = new Float32Array(sites.length * 4 * 3)
  const haloUvs = new Float32Array(sites.length * 4 * 2)
  const colors = new Float32Array(sites.length * 4 * 3)
  const siteIndices = new Float32Array(sites.length * 4)
  const indices: number[] = []

  sites.forEach((site, i) => {
    const reach = site.radius * tuning.haloSpread
    HALO_CORNERS.forEach(([across, along], corner) => {
      const vertex = i * 4 + corner
      positions.set(
        [
          site.center.x + across * reach,
          site.center.y + tuning.haloLift / islandScale,
          site.center.z - along * reach,
        ],
        vertex * 3
      )
      haloUvs.set([across * tuning.haloSpread, along * tuning.haloSpread], vertex * 2)
      colors.set([site.color.r, site.color.g, site.color.b], vertex * 3)
      siteIndices[vertex] = i
    })
    indices.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3)
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aHaloUv', new THREE.BufferAttribute(haloUvs, 2))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSite', new THREE.BufferAttribute(siteIndices, 1))
  geometry.setIndex(indices)
  return geometry
}

function moteReach(sites: GlowSite[], tuning: GroundGlowTuning, islandScale: number): THREE.Sphere {
  const reach = new THREE.Box3()
  const rise = tuning.moteRise / islandScale
  for (const { center, radius } of sites) {
    const spread = radius * (1 + tuning.moteSpread)
    reach.expandByPoint(new THREE.Vector3(center.x - spread, center.y, center.z - spread))
    reach.expandByPoint(new THREE.Vector3(center.x + spread, center.y + rise, center.z + spread))
  }
  return reach.getBoundingSphere(new THREE.Sphere())
}

export function buildMoteGeometry(
  sites: GlowSite[],
  tuning: GroundGlowTuning,
  islandScale: number
): THREE.BufferGeometry {
  const count = sites.length * tuning.motesPerSite
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count * 4)
  const radii = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const siteIndices = new Float32Array(count)

  sites.forEach((site, siteIndex) => {
    for (let i = 0; i < tuning.motesPerSite; i++) {
      const mote = siteIndex * tuning.motesPerSite + i
      positions.set([site.center.x, site.center.y, site.center.z], mote * 3)
      seeds.set(
        [
          (i + rand(0, 0.5)) / tuning.motesPerSite,
          rand(0, Math.PI * 2),
          mix(tuning.moteInnerShare, 1, Math.sqrt(Math.random())),
          rand(0.6, 1.2),
        ],
        mote * 4
      )
      radii[mote] = site.radius
      colors.set([site.color.r, site.color.g, site.color.b], mote * 3)
      siteIndices[mote] = siteIndex
    }
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSite', new THREE.BufferAttribute(siteIndices, 1))
  geometry.boundingSphere = moteReach(sites, tuning, islandScale)
  return geometry
}

// ── Materials ─────────────────────────────────────────────────────────────────

export function createAdditiveGlowMaterial(
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

function splitGlowBySite(material: THREE.ShaderMaterial, siteCount: number): THREE.ShaderMaterial {
  material.uniforms.uGlow.value = new Array<number>(siteCount).fill(0)
  material.defines.SITE_COUNT = siteCount
  return material
}

export const createHaloMaterial = (tuning: GroundGlowTuning, siteCount: number) =>
  splitGlowBySite(
    createAdditiveGlowMaterial(
      GROUND_HALO_VERT,
      GROUND_HALO_FRAG,
      {
        HALO_SPREAD: tuning.haloSpread,
        HALO_FILL: tuning.haloFill,
        HALO_STRENGTH: tuning.haloStrength,
      },
      {}
    ),
    siteCount
  )

export const createMoteMaterial = (tuning: GroundGlowTuning, siteCount: number) =>
  splitGlowBySite(
    createAdditiveGlowMaterial(
      GROUND_MOTES_VERT,
      GROUND_MOTES_FRAG,
      {
        LIFETIME: tuning.moteLifetime,
        SWIRL: tuning.moteSwirl,
        SPREAD: tuning.moteSpread,
        STRENGTH: tuning.moteStrength,
      },
      { uTime: { value: 0 }, uSize: { value: 1 }, uRise: { value: 0 } }
    ),
    siteCount
  )
