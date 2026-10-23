import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { buildVeilQuad } from '../veilQuad'
import {
  SWIRL_ABYSS_COLOR,
  SWIRL_ABYSS_GLOW_COLOR,
  SWIRL_CORE,
  SWIRL_CORE_SHADE,
  SWIRL_CORE_STRENGTH,
  SWIRL_FEATHER,
  SWIRL_RIM_GLOW,
  SWIRL_SPEED,
  SWIRL_STREAK_FROM,
  SWIRL_STREAK_GLOW,
  SWIRL_STREAK_SCALE,
  SWIRL_STREAK_STRETCH,
  SWIRL_TWIST,
  SWIRL_WOBBLE,
} from './constants'
import SWIRL_FRAG from './shaders/swirl.frag.glsl'

export const buildSwirl = (geometry: THREE.BufferGeometry) =>
  buildVeilQuad(
    geometry,
    {
      fragmentShader: SWIRL_FRAG,
      defines: floatDefines({
        FEATHER: SWIRL_FEATHER,
        WOBBLE: SWIRL_WOBBLE,
        SWIRL_TWIST,
        SWIRL_CORE,
        SWIRL_SPEED,
        STREAK_SCALE: SWIRL_STREAK_SCALE,
        STREAK_STRETCH: SWIRL_STREAK_STRETCH,
        STREAK_FROM: SWIRL_STREAK_FROM,
        STREAK_GLOW: SWIRL_STREAK_GLOW,
        CORE_SHADE: SWIRL_CORE_SHADE,
        CORE_STRENGTH: SWIRL_CORE_STRENGTH,
        RIM_GLOW: SWIRL_RIM_GLOW,
      }),
      uniforms: {
        uCover: { value: 0 },
        uOpacity: { value: 1 },
        uTime: { value: 0 },
        uCentre: { value: new THREE.Vector2(0.5, 0.5) },
        uAspect: { value: 1 },
        uAbyss: { value: displayColorOf(SWIRL_ABYSS_COLOR) },
        uAbyssGlow: { value: displayColorOf(SWIRL_ABYSS_GLOW_COLOR) },
      },
    },
    RENDER_LAYER.veil
  )
