import * as THREE from 'three'
import { buildBeamCone } from '@/utils/geometry'
import { createBeamConeMaterial } from '@/utils/materials'
import {
  BEAM_COLOR,
  BEAM_EDGE_LEVEL,
  BEAM_FADE_IN,
  BEAM_FALLOFF,
  BEAM_LENGTH,
  BEAM_SEGMENTS,
  BEAM_SPREAD_DEGREES,
  BEAM_TILT_DEGREES,
} from './constants'

export const BEAM_TILT = THREE.MathUtils.degToRad(BEAM_TILT_DEGREES)

export const buildLighthouseBeamGeometry = (lensRadius: number) =>
  buildBeamCone(lensRadius, BEAM_LENGTH, BEAM_SEGMENTS, BEAM_SPREAD_DEGREES)

export const createLighthouseBeamMaterial = () =>
  createBeamConeMaterial(new THREE.Color(BEAM_COLOR), {
    fadeIn: BEAM_FADE_IN,
    falloff: BEAM_FALLOFF,
    edgeLevel: BEAM_EDGE_LEVEL,
  })
