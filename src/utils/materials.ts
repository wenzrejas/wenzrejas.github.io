import * as THREE from 'three'
import BEAM_CONE_FRAG from '@/shaders/beamCone.frag.glsl'
import BEAM_CONE_VERT from '@/shaders/beamCone.vert.glsl'
import { floatDefines } from './glsl'

export const createAdditiveMaterial = (parameters: THREE.ShaderMaterialParameters) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    ...parameters,
  })

interface BeamConeLook {
  fadeIn: number
  falloff: number
  edgeLevel: number
}

export const createBeamConeMaterial = (
  color: THREE.Color,
  { fadeIn, falloff, edgeLevel }: BeamConeLook
) =>
  createAdditiveMaterial({
    side: THREE.DoubleSide,
    vertexShader: BEAM_CONE_VERT,
    fragmentShader: BEAM_CONE_FRAG,
    defines: floatDefines({
      BEAM_FADE_IN: fadeIn,
      BEAM_FALLOFF: falloff,
      BEAM_EDGE_LEVEL: edgeLevel,
    }),
    uniforms: {
      uColor: { value: color },
      uIntensity: { value: 0 },
    },
  })
