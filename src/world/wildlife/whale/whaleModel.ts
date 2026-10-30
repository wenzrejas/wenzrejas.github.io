import * as THREE from 'three'
import { buildWhaleShapeGeometry } from '../shared/whale-shape/whaleShapeModel'
import { createWildlifeMaterial } from '../shared/wildlifeMaterial'
import {
  BEND_SPAN,
  BEND_START,
  FLIPPER_FREQ,
  FLIPPER_LIFT,
  FLIPPER_SPLAY_DEGREES,
  FLIPPER_SWEEP,
  FLUKE_FLARE_REACH,
  FLUKE_ROOT_THICKNESS,
  FLUKE_SPAN,
  FLUKE_TIP_LIFT,
  FLUKE_TIP_THICKNESS,
  HEAD_NOD,
  STROKE_AMPLITUDE,
  STROKE_LAG,
  STROKE_SWAY,
} from './constants'
import BODY_VERT_GLSL from './shaders/whaleBody.vert.glsl'
import BODY_FRAG_GLSL from './shaders/whaleBody.frag.glsl'

const BACK_COLOR = new THREE.Color('#33475c')
const BELLY_COLOR = new THREE.Color('#c2ccd2')
const FLIPPER_COLOR = new THREE.Color('#dde5e9')
const FLUKE_COLOR = new THREE.Color('#2b3c4d')
const BELLY_LINE = -0.3

// ── Geometry ──────────────────────────────────────────────────────────────────

export const buildWhaleGeometry = () =>
  buildWhaleShapeGeometry(
    {
      back: BACK_COLOR,
      belly: BELLY_COLOR,
      flipper: FLIPPER_COLOR,
      fluke: FLUKE_COLOR,
      bellyLine: BELLY_LINE,
    },
    {
      flipperSplay: THREE.MathUtils.degToRad(FLIPPER_SPLAY_DEGREES),
      flatFlukes: {
        span: FLUKE_SPAN,
        flareReach: FLUKE_FLARE_REACH,
        rootThickness: FLUKE_ROOT_THICKNESS,
        tipThickness: FLUKE_TIP_THICKNESS,
        tipLift: FLUKE_TIP_LIFT,
      },
    }
  )

// ── Material ──────────────────────────────────────────────────────────────────

export const whaleUniforms = {
  uPhase: { value: 0 },
  uTurnCurve: { value: 0 },
  uClimbCurve: { value: 0 },
  uFade: { value: 1 },
}

export function createWhaleMaterial(): THREE.MeshLambertMaterial {
  return createWildlifeMaterial({
    vertexGlsl: BODY_VERT_GLSL,
    fragmentGlsl: BODY_FRAG_GLSL,
    deform: 'swimWhale',
    fade: 'uFade',
    uniforms: whaleUniforms,
    defines: {
      BEND_START,
      BEND_SPAN,
      STROKE_LAG,
      STROKE_AMPLITUDE,
      STROKE_SWAY,
      HEAD_NOD,
      FLIPPER_FREQ,
      FLIPPER_SWEEP,
      FLIPPER_LIFT,
    },
  })
}
