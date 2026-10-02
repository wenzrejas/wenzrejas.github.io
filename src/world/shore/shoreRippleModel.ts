import * as THREE from 'three'
import type { IslandKey } from '../islands/shared/constants'
import type { ShoreRing } from '../islands/shared/islandSpec'
import { ISLAND_KEYS, ISLAND_SPECS } from '../islands/shared/islandSpecs'
import { createIslandTransform, islandTransform } from '../islands/shared/islandTransform'
import { SHORE_DEFAULTS, SHORE_MARGIN } from './constants'
import SHORE_VERT from './shaders/shore.vert.glsl'
import SHORE_FRAG from './shaders/shore.frag.glsl'

export interface ShoreRipple {
  id: string
  key: IslandKey
  ring: ShoreRing
  peak: number
  span: number
  texture: THREE.DataTexture
  material: THREE.ShaderMaterial
}

const FLAT_PROFILE = new Float32Array(8).fill(1)

function profileTexture(profile: Float32Array) {
  const peak = Math.max(...profile)
  const bytes = new Uint8Array(profile.length)
  for (let i = 0; i < profile.length; i++) bytes[i] = Math.round((profile[i] / peak) * 255)

  const texture = new THREE.DataTexture(
    bytes,
    profile.length,
    1,
    THREE.RedFormat,
    THREE.UnsignedByteType
  )
  texture.wrapS = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return { texture, peak }
}

export function buildShoreRipples(): ShoreRipple[] {
  const ripples: ShoreRipple[] = []
  const shipped = createIslandTransform()

  for (const key of ISLAND_KEYS) {
    const spec = ISLAND_SPECS[key]
    const baseScale = islandTransform(key, spec.tuning, shipped).scale

    spec.shore.forEach((ring, i) => {
      const options = { ...SHORE_DEFAULTS, ...spec.shoreOptions, ...ring.options }
      const { texture, peak } = profileTexture(ring.profile ?? FLAT_PROFILE)
      const peakModel = ring.profile ? peak : ring.radius

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uProfile: { value: texture },
          uScale: { value: peakModel * baseScale },
          uRotation: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(1, 1, 1) },
          uWidth: { value: options.width },
          uRim: { value: options.rim },
          uReach: { value: options.reach },
          uInset: { value: options.inset },
          uSpeed: { value: options.speed },
          uSegments: { value: options.segments },
          uDashMin: { value: options.dashMin },
          uDashMax: { value: options.dashMax },
          uDashBias: { value: options.dashBias },
          uStrength: { value: options.strength },
          uWobble: { value: options.wobble },
        },
        vertexShader: SHORE_VERT,
        fragmentShader: SHORE_FRAG,
      })

      const outer = peakModel * baseScale
      const span = (outer + options.reach + options.wobble + SHORE_MARGIN) * 2
      ripples.push({ id: `${key}-${i}`, key, ring, peak: peakModel, span, texture, material })
    })
  }

  return ripples
}
