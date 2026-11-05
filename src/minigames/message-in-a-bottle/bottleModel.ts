import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { mergeParts } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import type { SparkleGem } from '@/world/islands/shared/gem-sparkles/sparkleSpots'
import { patchShader } from '@/world/islands/shared/materialPatch'
import { BOTTLE_SPOTS, type BottleKey } from './bottleSpots'
import {
  BOTTLE_CENTRE,
  BOTTLE_CONTENT_BANDS,
  BOTTLE_CONTENTS_ROUGHNESS,
  BOTTLE_GLASS_COLOR,
  BOTTLE_GLASS_OPACITY,
  BOTTLE_GLASS_PROFILE,
  BOTTLE_GLASS_RIM_OPACITY,
  BOTTLE_GLASS_RIM_POWER,
  BOTTLE_GLASS_ROUGHNESS,
  BOTTLE_GLINT_COLOR,
  BOTTLE_GLINT_SPOTS,
  BOTTLE_SEGMENTS,
} from './constants'
import GLASS_RIM from './shaders/glassRim.frag.glsl'

type ContentBand = (typeof BOTTLE_CONTENT_BANDS)[number]

// ── Contents ──────────────────────────────────────────────────────────────────

function buildContentBand({ bottom, top, bottomRadius, topRadius, color }: ContentBand) {
  const band = new THREE.CylinderGeometry(topRadius, bottomRadius, top - bottom, BOTTLE_SEGMENTS)
  band.translate(0, (bottom + top) / 2 - BOTTLE_CENTRE, 0)
  const { r, g, b } = new THREE.Color(color)
  const count = band.getAttribute('position').count
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) colors.set([r, g, b], i * 3)
  band.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return band
}

export const buildBottleContents = () => mergeParts(BOTTLE_CONTENT_BANDS.map(buildContentBand))

export const createBottleContentsMaterial = () =>
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: BOTTLE_CONTENTS_ROUGHNESS,
    flatShading: true,
  })

// ── Glass ─────────────────────────────────────────────────────────────────────

export const buildBottleGlass = () =>
  new THREE.LatheGeometry(
    BOTTLE_GLASS_PROFILE.map(
      ({ radius, height }) => new THREE.Vector2(radius, height - BOTTLE_CENTRE)
    ),
    BOTTLE_SEGMENTS
  )

export const createBottleGlassMaterial = () =>
  patchShader(
    new THREE.MeshStandardMaterial({
      color: BOTTLE_GLASS_COLOR,
      roughness: BOTTLE_GLASS_ROUGHNESS,
      flatShading: true,
      transparent: true,
      opacity: BOTTLE_GLASS_OPACITY,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    {
      uniforms: {},
      defines: floatDefines({
        GLASS_RIM_OPACITY: BOTTLE_GLASS_RIM_OPACITY,
        GLASS_RIM_POWER: BOTTLE_GLASS_RIM_POWER,
      }),
      fragment: { opaque_fragment: GLASS_RIM },
    }
  )

// ── Glint ─────────────────────────────────────────────────────────────────────

const GLINT_COLOR = displayColorOf(BOTTLE_GLINT_COLOR)

export function bottleGlintGem(
  node: THREE.Object3D,
  bottles: readonly BottleKey[],
  scale: number
): SparkleGem {
  const starts = new Float32Array(bottles.length * BOTTLE_GLINT_SPOTS.length * 3)
  bottles.forEach((bottle, bottleIndex) => {
    const { x, z } = BOTTLE_SPOTS[bottle]
    BOTTLE_GLINT_SPOTS.forEach(({ across, height, along }, spotIndex) => {
      const index = (bottleIndex * BOTTLE_GLINT_SPOTS.length + spotIndex) * 3
      starts.set([x + across * scale, height * scale, z + along * scale], index)
    })
  })
  return {
    node,
    color: GLINT_COLOR,
    sparkleSpots: { starts, ends: starts },
  }
}
