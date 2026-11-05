import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { whirlpoolFunnelUniforms } from '@/world/islands/timewell-depth/whirlpoolFunnel'
import { OCEAN_DEFAULTS, OCEAN_FUNNEL_OVERSHOOT, OCEAN_WHIRLPOOL_CALM_REACH } from './constants'
import { oceanSurfaceUniforms } from './oceanSurfaceUniforms'
import FRAG from './shaders/ocean.frag.glsl'
import VERT from './shaders/ocean.vert.glsl'
import { waveUniforms } from './waveUniforms'

export const createOceanMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    vertexShader: VERT,
    fragmentShader: FRAG,
    defines: floatDefines({
      FUNNEL_OVERSHOOT: OCEAN_FUNNEL_OVERSHOOT,
      WHIRLPOOL_CALM_REACH: OCEAN_WHIRLPOOL_CALM_REACH,
    }),
    uniforms: {
      ...waveUniforms,
      ...oceanSurfaceUniforms,
      ...whirlpoolFunnelUniforms,
      uScale: { value: OCEAN_DEFAULTS.waterScale },
      uFlowX: { value: OCEAN_DEFAULTS.flowX },
      uFlowZ: { value: OCEAN_DEFAULTS.flowZ },
      uNoiseScale: { value: OCEAN_DEFAULTS.noiseScale },
      uNoiseFlowSpeed: { value: OCEAN_DEFAULTS.noiseFlowSpeed },
      uDistortAmount: { value: OCEAN_DEFAULTS.distortAmount },
      uFoamColor: { value: new THREE.Color(1, 1, 1) },
      uFoamAmount: { value: OCEAN_DEFAULTS.foamAmount },
      uCrestStrength: { value: OCEAN_DEFAULTS.crestStrength },
    },
  })
