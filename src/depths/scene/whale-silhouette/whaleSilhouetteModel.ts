import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { buildWhaleShapeGeometry } from '@/world/wildlife/shared/whale-shape/whaleShapeModel'
import { patchShader } from '@/world/islands/shared/materialPatch'
import {
  WHALE_BACK_COLOR,
  WHALE_BELLY_COLOR,
  WHALE_BELLY_LINE,
  WHALE_BEND_SPAN,
  WHALE_BEND_START,
  WHALE_DEPTH_Z,
  WHALE_FLIPPER_LIFT,
  WHALE_FLIPPER_RATE,
  WHALE_FLIPPER_SPREAD,
  WHALE_FLIPPER_SWEEP,
  WHALE_HEAD_NOD,
  WHALE_LENGTH,
  WHALE_STROKE_LAG,
  WHALE_STROKE_RATE,
  WHALE_STROKE_SWING,
  WHALE_WATER_SHARE,
} from './constants'
import SILHOUETTE_SHADE from './shaders/silhouetteShade.frag.glsl'
import SILHOUETTE_WATER from './shaders/silhouetteWater.frag.glsl'
import WHALE_SWIM_PARS from './shaders/whaleSwimPars.vert.glsl'
import WHALE_SWIM from './shaders/whaleSwim.vert.glsl'

export interface WhaleSilhouette {
  body: THREE.Mesh
  swimTime: { value: number }
}

const BACK = new THREE.Color(WHALE_BACK_COLOR)
const BELLY = new THREE.Color(WHALE_BELLY_COLOR)

// ── Shape ─────────────────────────────────────────────────────────────────────

const buildSilhouetteGeometry = () =>
  buildWhaleShapeGeometry(
    { back: BACK, belly: BELLY, flipper: BELLY, fluke: BACK, bellyLine: WHALE_BELLY_LINE },
    { flipperSplay: 0 }
  )

// ── Material ──────────────────────────────────────────────────────────────────

const createSilhouetteMaterial = (swimTime: { value: number }) =>
  patchShader(
    new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
    {
      uniforms: { uSwimTime: swimTime },
      defines: floatDefines({
        WHALE_BEND_START,
        WHALE_BEND_SPAN,
        WHALE_STROKE_RATE,
        WHALE_STROKE_LAG,
        WHALE_STROKE_SWING,
        WHALE_HEAD_NOD,
        WHALE_FLIPPER_RATE,
        WHALE_FLIPPER_SWEEP,
        WHALE_FLIPPER_LIFT,
        WHALE_FLIPPER_SPREAD,
        WHALE_WATER_SHARE,
      }),
      vertex: { common: WHALE_SWIM_PARS, begin_vertex: WHALE_SWIM },
      fragment: { colorspace_fragment: SILHOUETTE_SHADE, fog_fragment: SILHOUETTE_WATER },
    }
  )

export function buildWhaleSilhouette(): WhaleSilhouette {
  const swimTime = { value: 0 }
  const body = new THREE.Mesh(buildSilhouetteGeometry(), createSilhouetteMaterial(swimTime))
  body.scale.setScalar(WHALE_LENGTH)
  body.position.z = WHALE_DEPTH_Z
  return { body, swimTime }
}

export function disposeWhaleSilhouette({ body }: WhaleSilhouette) {
  body.geometry.dispose()
  ;(body.material as THREE.Material).dispose()
}
