import * as THREE from 'three'
import {
  FORWARD_RISE,
  GROUND_FORWARD,
  HEIGHT_RISE,
  SCREEN_RIGHT,
} from '@/app/experience/cameraFraming'
import { useCycleStore } from '@/store/cycleStore'
import { floatDefines, glslVec2 } from '@/utils/glsl'
import { cloudShadowUniforms } from '../weather/cloudShadow'
import {
  FOG_BROAD_TILE,
  FOG_DETAIL_BLUR,
  FOG_FINE_SHARE,
  FOG_FINE_TILE,
  FOG_FLOOR_Y,
  FOG_HAZE,
  FOG_HAZE_REACH,
  FOG_LEAN_SHARE,
  FOG_LIGHT_GAIN,
  FOG_LIGHT_STEP,
  FOG_OUTER_MARGIN,
  FOG_RISE_END,
  FOG_RISE_START,
  FOG_RISE_WARP,
  FOG_SEGMENTS,
  FOG_SHEET_LEVEL,
  FOG_SHEET_REACH,
  FOG_SHEET_SWELL,
  FOG_SHEET_SWELL_BASE,
  FOG_SHEET_WARP,
  FOG_SHELLS,
  FOG_SOFT,
  FOG_VALLEY,
} from './constants'
import FRAG from './shaders/boundary.frag.glsl'
import VERT from './shaders/boundary.vert.glsl'

const AWAY_X = -GROUND_FORWARD.x
const AWAY_Z = -GROUND_FORWARD.y
const LEAN = (FOG_LEAN_SHARE * HEIGHT_RISE) / FORWARD_RISE

export function buildFogShells() {
  const ring = new THREE.RingGeometry(1, 2, FOG_SEGMENTS, 1)
  const lifts = Float32Array.from({ length: FOG_SHELLS }, (_, shell) => shell / FOG_SHELLS)

  const geometry = new THREE.InstancedBufferGeometry()
  geometry.setAttribute('position', ring.getAttribute('position'))
  geometry.setIndex(ring.getIndex())
  geometry.setAttribute('aLift', new THREE.InstancedBufferAttribute(lifts, 1))
  geometry.instanceCount = FOG_SHELLS
  return geometry
}

export const createFogMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    defines: {
      FOG_SEEN_ACROSS: glslVec2(SCREEN_RIGHT.x, SCREEN_RIGHT.z),
      FOG_SEEN_RISE: glslVec2(AWAY_X * FORWARD_RISE, AWAY_Z * FORWARD_RISE),
      FOG_LEAN: glslVec2(GROUND_FORWARD.x * LEAN, GROUND_FORWARD.y * LEAN),
      ...floatDefines({
        FOG_BROAD_TILE,
        FOG_DETAIL_BLUR,
        FOG_FINE_SHARE,
        FOG_FINE_TILE,
        FOG_FLOOR_Y,
        FOG_HAZE,
        FOG_HAZE_REACH,
        FOG_LIGHT_GAIN,
        FOG_LIGHT_STEP,
        FOG_OUTER_MARGIN,
        FOG_RISE_END,
        FOG_RISE_START,
        FOG_RISE_WARP,
        FOG_SHEET_LEVEL,
        FOG_SHEET_REACH,
        FOG_SHEET_SWELL,
        FOG_SHEET_SWELL_BASE,
        FOG_SHEET_WARP,
        FOG_SHELLS,
        FOG_SOFT,
        FOG_VALLEY,
      }),
    },
    uniforms: {
      uTime: { value: 0 },
      uRadius: { value: 0 },
      uFalloff: { value: 0 },
      uHeight: { value: 0 },
      uColor: { value: useCycleStore.getState().fogColor },
      uShade: { value: new THREE.Color() },
      uLit: { value: new THREE.Color() },
      uLight: { value: new THREE.Vector2() },
      uCloudMap: cloudShadowUniforms.uCloudMap,
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
  })
