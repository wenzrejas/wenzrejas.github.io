import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import type { DistanceField } from '../shore/shoreField'
import { FOAM_GRAIN, FOAM_JAG } from './constants'
import FOAM_VERT from './shaders/foam.vert.glsl'
import FOAM_FRAG from './shaders/foam.frag.glsl'

export const buildHullFieldQuad = ({ size, centerX, centerZ }: DistanceField) =>
  new THREE.PlaneGeometry(size, size).rotateX(Math.PI / 2).translate(centerX, 0, centerZ)

export function createHullFoamMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    defines: floatDefines({ FOAM_JAG, FOAM_GRAIN }),
    uniforms: {
      uHullField: { value: null },
      uModelScale: { value: 1 },
      uReach: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(1, 1, 1) },
    },
    vertexShader: FOAM_VERT,
    fragmentShader: FOAM_FRAG,
  })
}
