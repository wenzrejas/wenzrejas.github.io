import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { CHIME_COLOR, CHIME_FACE_RADIUS, CHIME_RING_WIDTH } from './constants'
import CHIME_RING_VERT from './shaders/chimeRing.vert.glsl'
import CHIME_RING_FRAG from './shaders/chimeRing.frag.glsl'

export const buildChimeRing = () =>
  new THREE.PlaneGeometry(CHIME_FACE_RADIUS * 2, CHIME_FACE_RADIUS * 2)

export const createChimeRingMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: CHIME_RING_VERT,
    fragmentShader: CHIME_RING_FRAG,
    defines: floatDefines({ RING_WIDTH: CHIME_RING_WIDTH }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 1 },
      uStrength: { value: 0 },
      uColor: { value: displayColorOf(CHIME_COLOR) },
    },
  })
