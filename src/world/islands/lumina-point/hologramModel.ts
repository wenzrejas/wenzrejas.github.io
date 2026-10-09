import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import {
  HOLOGRAM_SCAN_DENSITY,
  HOLOGRAM_SCAN_SPEED,
  LOGO_FLICKER_CHANCE,
  LOGO_FLICKER_DEPTH,
  LOGO_FLICKER_RATE,
  LOGO_RIM_GAIN,
  LOGO_RIM_POWER,
  LOGO_SCAN_DEPTH,
  PROJECTION_FLARE,
  PROJECTION_SCAN_DEPTH,
  PROJECTION_SEGMENTS,
  PROJECTION_STRENGTH,
} from './constants'
import type { FloatingLogo, Projection } from './monoliths'
import HOLOGRAM_VERT from './shaders/hologram.vert.glsl'
import HOLOGRAM_FRAG from './shaders/hologram.frag.glsl'
import PROJECTION_VERT from './shaders/projection.vert.glsl'
import PROJECTION_FRAG from './shaders/projection.frag.glsl'

export interface HologramUniforms {
  uTime: THREE.IUniform<number>
  projectorLevel: THREE.IUniform<number>
  logoLevel: THREE.IUniform<number>
}

export const createHologramUniforms = (): HologramUniforms => ({
  uTime: { value: 0 },
  projectorLevel: { value: 0 },
  logoLevel: { value: 0 },
})

const SCAN_DEFINES = {
  SCAN_DENSITY: HOLOGRAM_SCAN_DENSITY,
  SCAN_SPEED: HOLOGRAM_SCAN_SPEED,
}

// ── Projection ────────────────────────────────────────────────────────────────

export function buildProjectionGeometry({
  base,
  baseRadius,
  topRadius,
  height,
  color,
}: Projection): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(
    topRadius * PROJECTION_FLARE,
    baseRadius,
    height,
    PROJECTION_SEGMENTS,
    1,
    true
  )
  geometry.translate(base.x, base.y + height / 2, base.z)

  const colors = new Float32Array(geometry.getAttribute('position').count * 3)
  for (let i = 0; i < colors.length; i += 3) colors.set([color.r, color.g, color.b], i)
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  return geometry
}

export const createProjectionMaterial = (shared: HologramUniforms) =>
  new THREE.ShaderMaterial({
    vertexShader: PROJECTION_VERT,
    fragmentShader: PROJECTION_FRAG,
    defines: floatDefines({
      ...SCAN_DEFINES,
      SCAN_DEPTH: PROJECTION_SCAN_DEPTH,
      STRENGTH: PROJECTION_STRENGTH,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: shared.uTime, uLevel: shared.projectorLevel },
  })

// ── Logos ─────────────────────────────────────────────────────────────────────

const createHologramMaterial = (color: THREE.Color, opacity: number, shared: HologramUniforms) =>
  new THREE.ShaderMaterial({
    vertexShader: HOLOGRAM_VERT,
    fragmentShader: HOLOGRAM_FRAG,
    defines: floatDefines({
      ...SCAN_DEFINES,
      SCAN_DEPTH: LOGO_SCAN_DEPTH,
      RIM_POWER: LOGO_RIM_POWER,
      RIM_GAIN: LOGO_RIM_GAIN,
      FLICKER_RATE: LOGO_FLICKER_RATE,
      FLICKER_CHANCE: LOGO_FLICKER_CHANCE,
      FLICKER_DEPTH: LOGO_FLICKER_DEPTH,
    }),
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: shared.uTime,
      uLevel: shared.logoLevel,
      uColor: { value: color },
      uOpacity: { value: opacity },
    },
  })

export function dressLogos(logos: FloatingLogo[], shared: HologramUniforms): () => void {
  const worn = logos.flatMap(({ surfaces }) =>
    surfaces.map(({ mesh, color, opacity }) => {
      const original = { material: mesh.material, renderOrder: mesh.renderOrder }
      const hologram = createHologramMaterial(color, opacity, shared)
      mesh.material = hologram
      mesh.renderOrder = RENDER_LAYER.glow
      return { mesh, original, hologram }
    })
  )

  return () => {
    for (const { mesh, original, hologram } of worn) {
      mesh.material = original.material
      mesh.renderOrder = original.renderOrder
      hologram.dispose()
    }
  }
}
