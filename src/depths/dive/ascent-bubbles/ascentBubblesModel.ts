import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { seededRandom } from '@/utils/random'
import {
  BUBBLE_CENTRE_BIAS,
  BUBBLE_EDGE_TINT,
  BUBBLE_FAN,
  BUBBLE_FAR_ALPHA,
  BUBBLE_FAR_COUNT,
  BUBBLE_FAR_SCALE,
  BUBBLE_LARGEST_PIXELS,
  BUBBLE_MID_COUNT,
  BUBBLE_NEAR_ALPHA,
  BUBBLE_NEAR_COUNT,
  BUBBLE_NEAR_SCALE,
  BUBBLE_RISE,
  BUBBLE_RISE_PER_SIZE,
  BUBBLE_SEED,
  BUBBLE_SMALLEST_PIXELS,
  BUBBLE_SQUASH,
  BUBBLE_SQUASH_RATE,
  BUBBLE_STREAM_JITTER,
  BUBBLE_STREAM_SHARE,
  BUBBLE_STREAMS,
  BUBBLE_TINT,
  BUBBLE_WOBBLE,
  BUBBLE_WOBBLE_RATE,
} from './constants'
import ASCENT_BUBBLES_VERT from './shaders/ascentBubbles.vert.glsl'
import ASCENT_BUBBLES_FRAG from './shaders/ascentBubbles.frag.glsl'

const LAYER_COUNTS = [BUBBLE_FAR_COUNT, BUBBLE_MID_COUNT, BUBBLE_NEAR_COUNT]

function buildBubbleGeometry() {
  const random = seededRandom(BUBBLE_SEED)
  const total = LAYER_COUNTS.reduce((sum, count) => sum + count, 0)
  const seeds = new Float32Array(total * 4)
  const layers = new Float32Array(total)
  let bubble = 0
  for (const [layer, count] of LAYER_COUNTS.entries()) {
    for (let inLayer = 0; inLayer < count; inLayer++, bubble++) {
      seeds.set([random(), random(), random(), random()], bubble * 4)
      layers[bubble] = layer
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3))
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 4))
  geometry.setAttribute('layer', new THREE.BufferAttribute(layers, 1))
  return geometry
}

const createBubbleMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: ASCENT_BUBBLES_VERT,
    fragmentShader: ASCENT_BUBBLES_FRAG,
    defines: floatDefines({
      FAR_SCALE: BUBBLE_FAR_SCALE,
      NEAR_SCALE: BUBBLE_NEAR_SCALE,
      FAR_ALPHA: BUBBLE_FAR_ALPHA,
      NEAR_ALPHA: BUBBLE_NEAR_ALPHA,
      SMALLEST_PIXELS: BUBBLE_SMALLEST_PIXELS,
      LARGEST_PIXELS: BUBBLE_LARGEST_PIXELS,
      RISE: BUBBLE_RISE,
      RISE_PER_SIZE: BUBBLE_RISE_PER_SIZE,
      CENTRE_BIAS: BUBBLE_CENTRE_BIAS,
      FAN: BUBBLE_FAN,
      STREAMS: BUBBLE_STREAMS,
      STREAM_SHARE: BUBBLE_STREAM_SHARE,
      STREAM_JITTER: BUBBLE_STREAM_JITTER,
      WOBBLE: BUBBLE_WOBBLE,
      WOBBLE_RATE: BUBBLE_WOBBLE_RATE,
      SQUASH: BUBBLE_SQUASH,
      SQUASH_RATE: BUBBLE_SQUASH_RATE,
    }),
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTravel: { value: 0 },
      uTime: { value: 0 },
      uPresence: { value: 0 },
      uPixelRatio: { value: 1 },
      uTint: { value: displayColorOf(BUBBLE_TINT) },
      uEdgeTint: { value: displayColorOf(BUBBLE_EDGE_TINT) },
    },
  })

export function buildAscentBubbles() {
  const bubbles = new THREE.Points(buildBubbleGeometry(), createBubbleMaterial())
  bubbles.frustumCulled = false
  bubbles.renderOrder = RENDER_LAYER.veilBubbles
  return bubbles
}
