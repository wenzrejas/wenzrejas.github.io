import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import { AWAKEN_COLOR } from '../constants'
import {
  VORTEX_BEAM_FLOW_DENSITY,
  VORTEX_BEAM_FLOW_DEPTH,
  VORTEX_BEAM_HEIGHT,
  VORTEX_BEAM_LAYERS,
  VORTEX_BEAM_RADIUS,
  VORTEX_BEAM_SEGMENTS,
  VORTEX_BEAM_TOP_FADE,
} from './constants'
import VORTEX_BEAM_VERT from './shaders/vortexBeam.vert.glsl'
import VORTEX_BEAM_FRAG from './shaders/vortexBeam.frag.glsl'

type VortexBeamLayer = (typeof VORTEX_BEAM_LAYERS)[number]

export const buildVortexBeamGeometry = () =>
  new THREE.CylinderGeometry(
    VORTEX_BEAM_RADIUS,
    VORTEX_BEAM_RADIUS,
    VORTEX_BEAM_HEIGHT,
    VORTEX_BEAM_SEGMENTS,
    1,
    true
  ).translate(0, VORTEX_BEAM_HEIGHT / 2, 0)

export const createVortexBeamMaterial = ({ sharpness, strength, flowRate }: VortexBeamLayer) =>
  createAdditiveGlowMaterial(
    VORTEX_BEAM_VERT,
    VORTEX_BEAM_FRAG,
    {
      FLOW_DENSITY: VORTEX_BEAM_FLOW_DENSITY,
      FLOW_DEPTH: VORTEX_BEAM_FLOW_DEPTH,
      TOP_FADE: VORTEX_BEAM_TOP_FADE,
    },
    {
      uColor: { value: displayColorOf(AWAKEN_COLOR) },
      uSharpness: { value: sharpness },
      uStrength: { value: strength },
      uFlowRate: { value: flowRate },
      uTime: { value: 0 },
    }
  )
