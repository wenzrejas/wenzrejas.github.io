import * as THREE from 'three'
import SCREEN_QUAD_VERT from '@/shaders/screenQuad.vert.glsl'
import DARKNESS_FRAG from './shaders/darkness.frag.glsl'

export const createDarknessMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: SCREEN_QUAD_VERT,
    fragmentShader: DARKNESS_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { uDarkness: { value: 1 } },
  })
