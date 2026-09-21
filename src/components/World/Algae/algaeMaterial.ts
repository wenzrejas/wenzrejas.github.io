import * as THREE from 'three'
import { floatDefines } from '../../../utils/glsl'
import { waveUniforms } from '../Ocean/waveUniforms'
import { algaeDefines, algaeUniforms } from './algaeField'
import {
  CREST_BRIGHT,
  CREST_DIM,
  SCATTER_PUSH,
  SCATTER_RADIUS,
  SPARK_COLOR,
  SPECK_SCALE,
  SPECK_SIZE,
  SPECK_THRESHOLD,
  TRAIL_LIFE,
  TRAIL_POINTS,
} from './constants'
import { trailUniform } from './scatterTrail'
import ALGAE_VERT from './shaders/algae.vert.glsl'
import ALGAE_FRAG from './shaders/algae.frag.glsl'

export function createAlgaeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: ALGAE_VERT,
    fragmentShader: ALGAE_FRAG,
    defines: {
      ...algaeDefines,
      TRAIL_POINTS,
      ...floatDefines({
        TRAIL_LIFE,
        SCATTER_RADIUS,
        SCATTER_PUSH,
        SPECK_SCALE,
        SPECK_SIZE,
        SPECK_THRESHOLD,
        CREST_DIM,
        CREST_BRIGHT,
      }),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...algaeUniforms, ...waveUniforms, uTrail: trailUniform },
  })
}

export function createSparkMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: SPARK_COLOR,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}
