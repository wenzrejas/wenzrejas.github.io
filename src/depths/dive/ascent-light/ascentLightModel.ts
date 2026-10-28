import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { buildVeilQuad } from '../veilQuad'
import {
  ASCENT_DEEP_COLOR,
  ASCENT_FEATHER,
  ASCENT_FLASH_FROM,
  ASCENT_LIGHT_COLOR,
  ASCENT_RIPPLE_DEPTH,
  ASCENT_RIPPLE_FREQUENCY,
  ASCENT_RIPPLE_RATE,
  ASCENT_SHAFT_DRIFT,
  ASCENT_SHAFT_FREQUENCY,
  ASCENT_SHAFT_GLOW,
  ASCENT_SHAFT_SHARPNESS,
  ASCENT_WAVE_FREQUENCY,
  ASCENT_WAVE_HEIGHT,
  ASCENT_WAVE_RATE,
} from './constants'
import ASCENT_LIGHT_FRAG from './shaders/ascentLight.frag.glsl'

export const buildAscentLight = (geometry: THREE.BufferGeometry) =>
  buildVeilQuad(
    geometry,
    {
      fragmentShader: ASCENT_LIGHT_FRAG,
      defines: floatDefines({
        FEATHER: ASCENT_FEATHER,
        WAVE_HEIGHT: ASCENT_WAVE_HEIGHT,
        WAVE_FREQUENCY: ASCENT_WAVE_FREQUENCY,
        WAVE_RATE: ASCENT_WAVE_RATE,
        SHAFT_FREQUENCY: ASCENT_SHAFT_FREQUENCY,
        SHAFT_DRIFT: ASCENT_SHAFT_DRIFT,
        SHAFT_SHARPNESS: ASCENT_SHAFT_SHARPNESS,
        SHAFT_GLOW: ASCENT_SHAFT_GLOW,
        FLASH_FROM: ASCENT_FLASH_FROM,
        RIPPLE_FREQUENCY: ASCENT_RIPPLE_FREQUENCY,
        RIPPLE_RATE: ASCENT_RIPPLE_RATE,
        RIPPLE_DEPTH: ASCENT_RIPPLE_DEPTH,
      }),
      uniforms: {
        uRise: { value: 0 },
        uFade: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uFlashStrength: { value: 1 },
        uDeep: { value: displayColorOf(ASCENT_DEEP_COLOR) },
        uLight: { value: displayColorOf(ASCENT_LIGHT_COLOR) },
      },
    },
    RENDER_LAYER.veil
  )
