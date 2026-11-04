import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { dynamicInstancedAttribute } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import { mix } from '@/utils/math'
import { waveUniforms } from '@/world/environment/ocean/waveUniforms'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import {
  LANTERN_CAP_HEIGHT,
  LANTERN_CAP_TONE,
  LANTERN_CAPACITY,
  LANTERN_CREST_BRIGHT,
  LANTERN_CREST_DIM,
  LANTERN_EDGE_SHADE,
  LANTERN_FLICKER,
  LANTERN_FLICKER_RATE,
  LANTERN_GLOW_COLOR,
  LANTERN_HOOP_COLOR,
  LANTERN_HOOP_SHARE,
  LANTERN_HOT_COLOR,
  LANTERN_HOT_HEIGHT,
  LANTERN_HOT_SPREAD,
  LANTERN_MID_COLOR,
  LANTERN_PROFILE,
  LANTERN_SEAM_SHADE,
  LANTERN_SEAM_WIDTH,
  LANTERN_SEGMENTS,
  LANTERN_SQUARE_POWER,
  LANTERN_TONE_VARIATION,
  LANTERN_TOP_COLOR,
  LANTERN_UNLIT_COLOR,
  LANTERN_UNLIT_EMBER,
  LANTERN_UNLIT_EMBER_TIGHTNESS,
  LANTERN_UNLIT_HOOP_COLOR,
  LANTERN_UNLIT_SHADE_HIGH,
  LANTERN_UNLIT_SHADE_LOW,
  LANTERN_WAVE_TILT,
} from './constants'
import LANTERN_VERT from './shaders/lantern.vert.glsl'
import LANTERN_FRAG from './shaders/lantern.frag.glsl'
import LANTERN_GLOW_VERT from './shaders/lanternGlow.vert.glsl'
import LANTERN_GLOW_FRAG from './shaders/lanternGlow.frag.glsl'

function ringRadius(angle: number, squareShare: number): number {
  const across = Math.abs(Math.cos(angle)) ** LANTERN_SQUARE_POWER
  const along = Math.abs(Math.sin(angle)) ** LANTERN_SQUARE_POWER
  return mix(1, (across + along) ** (-1 / LANTERN_SQUARE_POWER), squareShare)
}

export function buildLanternBody(): THREE.BufferGeometry {
  const positions: number[] = []
  const shapes: number[] = []
  const indices: number[] = []
  const lastRow = LANTERN_PROFILE.length - 1
  const topHeight = LANTERN_PROFILE[lastRow].height

  LANTERN_PROFILE.forEach(({ height, radius, squareShare, cap }) => {
    for (let step = 0; step < LANTERN_SEGMENTS; step++) {
      const angle = (step / LANTERN_SEGMENTS) * Math.PI * 2
      const reach = radius * ringRadius(angle, squareShare)
      positions.push(Math.cos(angle) * reach, height, Math.sin(angle) * reach)
      shapes.push(height / topHeight, cap)
    }
  })

  for (let row = 0; row < lastRow; row++) {
    for (let step = 0; step < LANTERN_SEGMENTS; step++) {
      const next = (step + 1) % LANTERN_SEGMENTS
      const lower = row * LANTERN_SEGMENTS
      const upper = (row + 1) * LANTERN_SEGMENTS
      indices.push(lower + step, upper + step, lower + next)
      indices.push(lower + next, upper + step, upper + next)
    }
  }

  const capCentre = positions.length / 3
  positions.push(0, LANTERN_CAP_HEIGHT, 0)
  shapes.push(1, 1)
  for (let step = 0; step < LANTERN_SEGMENTS; step++) {
    const top = lastRow * LANTERN_SEGMENTS
    indices.push(top + step, capCentre, top + ((step + 1) % LANTERN_SEGMENTS))
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('shape', new THREE.Float32BufferAttribute(shapes, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.setAttribute('aLit', dynamicInstancedAttribute(LANTERN_CAPACITY))
  geometry.setAttribute('aSeed', dynamicInstancedAttribute(LANTERN_CAPACITY))
  geometry.setAttribute('aPresence', dynamicInstancedAttribute(LANTERN_CAPACITY))
  geometry.setAttribute('aAfloat', dynamicInstancedAttribute(LANTERN_CAPACITY))
  return geometry
}

export const createLanternMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: LANTERN_VERT,
    fragmentShader: LANTERN_FRAG,
    transparent: true,
    defines: floatDefines({
      HOT_HEIGHT: LANTERN_HOT_HEIGHT,
      HOT_SPREAD: LANTERN_HOT_SPREAD,
      EDGE_SHADE: LANTERN_EDGE_SHADE,
      SEAM_WIDTH: LANTERN_SEAM_WIDTH,
      SEAM_SHADE: LANTERN_SEAM_SHADE,
      HOOP_SHARE: LANTERN_HOOP_SHARE,
      CAP_TONE: LANTERN_CAP_TONE,
      TONE_VARIATION: LANTERN_TONE_VARIATION,
      UNLIT_SHADE_LOW: LANTERN_UNLIT_SHADE_LOW,
      UNLIT_SHADE_HIGH: LANTERN_UNLIT_SHADE_HIGH,
      UNLIT_EMBER: LANTERN_UNLIT_EMBER,
      UNLIT_EMBER_TIGHTNESS: LANTERN_UNLIT_EMBER_TIGHTNESS,
      FLICKER: LANTERN_FLICKER,
      FLICKER_RATE: LANTERN_FLICKER_RATE,
      CREST_DIM: LANTERN_CREST_DIM,
      CREST_BRIGHT: LANTERN_CREST_BRIGHT,
      WAVE_TILT: LANTERN_WAVE_TILT,
    }),
    uniforms: {
      ...waveUniforms,
      uTop: { value: displayColorOf(LANTERN_TOP_COLOR) },
      uMid: { value: displayColorOf(LANTERN_MID_COLOR) },
      uHot: { value: displayColorOf(LANTERN_HOT_COLOR) },
      uHoop: { value: displayColorOf(LANTERN_HOOP_COLOR) },
      uUnlit: { value: displayColorOf(LANTERN_UNLIT_COLOR) },
      uUnlitHoop: { value: displayColorOf(LANTERN_UNLIT_HOOP_COLOR) },
    },
  })

export function buildLanternGlow(): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(1, 1)
  geometry.setAttribute('aGlow', dynamicInstancedAttribute(LANTERN_CAPACITY * 2))
  geometry.setAttribute('aAfloat', dynamicInstancedAttribute(LANTERN_CAPACITY * 2))
  return geometry
}

export const createLanternGlowMaterial = () =>
  createAdditiveGlowMaterial(
    LANTERN_GLOW_VERT,
    LANTERN_GLOW_FRAG,
    { CREST_DIM: LANTERN_CREST_DIM, CREST_BRIGHT: LANTERN_CREST_BRIGHT },
    { ...waveUniforms, uColor: { value: displayColorOf(LANTERN_GLOW_COLOR) } }
  )
