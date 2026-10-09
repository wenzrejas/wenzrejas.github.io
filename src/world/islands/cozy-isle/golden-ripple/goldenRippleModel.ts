import * as THREE from 'three'
import FIELD_QUAD_VERT from '@/shaders/fieldQuad.vert.glsl'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { buildWaterlineField } from '@/world/shore/shoreField'
import {
  RIPPLE_COLOR,
  RIPPLE_CREST_COLOR,
  RIPPLE_EASE,
  RIPPLE_FADE_IN,
  RIPPLE_FADE_OUT_FROM,
  RIPPLE_FIELD_MARGIN,
  RIPPLE_FIELD_RESOLUTION,
  RIPPLE_INTERVAL_SECONDS,
  RIPPLE_REACH,
  RIPPLE_REFRACTION,
  RIPPLE_REFRACTION_GRAIN,
  RIPPLE_SECONDS,
  RIPPLE_SHIMMER_DEPTH,
  RIPPLE_SHIMMER_GRAIN,
  RIPPLE_SHIMMER_RATE,
  RIPPLE_SHIMMER_SWAY,
  RIPPLE_SPREAD,
  RIPPLE_START,
  RIPPLE_STRENGTH,
  RIPPLE_TRAIL_LENGTH,
  RIPPLE_TRAIL_STRENGTH,
  RIPPLE_WIDTH,
} from './constants'
import { COZY_MAIN_SHORE_RADIUS } from '../shoreProfile'
import GOLDEN_RIPPLE_FRAG from './shaders/goldenRipple.frag.glsl'

export const traceGoldenRippleField = (land: THREE.Object3D, waterY: number) =>
  buildWaterlineField(
    land,
    waterY,
    RIPPLE_FIELD_MARGIN,
    RIPPLE_FIELD_RESOLUTION,
    COZY_MAIN_SHORE_RADIUS
  )

export const createGoldenRippleMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: FIELD_QUAD_VERT,
    fragmentShader: GOLDEN_RIPPLE_FRAG,
    defines: {
      ...floatDefines({
        START: RIPPLE_START,
        REACH: RIPPLE_REACH,
        SECONDS: RIPPLE_SECONDS,
        INTERVAL: RIPPLE_INTERVAL_SECONDS,
        EASE: RIPPLE_EASE,
        WIDTH: RIPPLE_WIDTH,
        SPREAD: RIPPLE_SPREAD,
        TRAIL_LENGTH: RIPPLE_TRAIL_LENGTH,
        TRAIL_STRENGTH: RIPPLE_TRAIL_STRENGTH,
        FADE_IN: RIPPLE_FADE_IN,
        FADE_OUT_FROM: RIPPLE_FADE_OUT_FROM,
        STRENGTH: RIPPLE_STRENGTH,
        SHIMMER_GRAIN: RIPPLE_SHIMMER_GRAIN,
        SHIMMER_RATE: RIPPLE_SHIMMER_RATE,
        SHIMMER_DEPTH: RIPPLE_SHIMMER_DEPTH,
        SHIMMER_SWAY: RIPPLE_SHIMMER_SWAY,
        REFRACTION_GRAIN: RIPPLE_REFRACTION_GRAIN,
        REFRACTION: RIPPLE_REFRACTION,
      }),
      RIPPLES_ALIVE: Math.ceil(RIPPLE_SECONDS / RIPPLE_INTERVAL_SECONDS),
    },
    transparent: true,
    depthWrite: false,
    uniforms: {
      uField: { value: null },
      uSeconds: { value: 0 },
      uPresence: { value: 0 },
      uColor: { value: displayColorOf(RIPPLE_COLOR) },
      uCrestColor: { value: displayColorOf(RIPPLE_CREST_COLOR) },
    },
  })
