import * as THREE from 'three'
import { BEAM_COLOR, BEAM_LENGTH, BEAM_SEGMENTS, BEAM_SPREAD_DEG, BEAM_TILT_DEG } from './constants'
import BEAM_VERT from './shaders/luminaBeam.vert.glsl'
import BEAM_FRAG from './shaders/luminaBeam.frag.glsl'

const HALF_SPREAD = THREE.MathUtils.degToRad(BEAM_SPREAD_DEG) / 2
export const BEAM_TILT = THREE.MathUtils.degToRad(BEAM_TILT_DEG)

export function buildLighthouseBeamGeometry(lensRadius: number): THREE.CylinderGeometry {
  const startRadius = lensRadius / BEAM_LENGTH
  const geometry = new THREE.CylinderGeometry(
    startRadius,
    startRadius + Math.tan(HALF_SPREAD),
    1,
    BEAM_SEGMENTS,
    1,
    true
  )
  geometry.rotateZ(Math.PI / 2)
  geometry.translate(0.5, 0, 0)
  return geometry
}

export const createLighthouseBeamMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: BEAM_VERT,
    fragmentShader: BEAM_FRAG,
    uniforms: {
      uColor: { value: new THREE.Color(BEAM_COLOR) },
      uIntensity: { value: 0 },
    },
  })
