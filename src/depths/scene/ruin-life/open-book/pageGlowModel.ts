import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { createAdditiveMaterial } from '@/utils/materials'
import { PAGE_GLOW_COLOR } from './constants'
import PAGE_GLOW_VERT from './shaders/pageGlow.vert.glsl'
import PAGE_GLOW_FRAG from './shaders/pageGlow.frag.glsl'

export const buildPageGlow = () => new THREE.PlaneGeometry(1, 1)

export const createPageGlowMaterial = () =>
  createAdditiveMaterial({
    vertexShader: PAGE_GLOW_VERT,
    fragmentShader: PAGE_GLOW_FRAG,
    uniforms: {
      uSize: { value: new THREE.Vector2(1, 1) },
      uStrength: { value: 0 },
      uColor: { value: displayColorOf(PAGE_GLOW_COLOR) },
    },
  })
