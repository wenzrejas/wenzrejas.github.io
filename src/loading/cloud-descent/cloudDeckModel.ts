import * as THREE from 'three'
import SCREEN_QUAD_VERT from '@/shaders/screenQuad.vert.glsl'
import { floatDefines } from '@/utils/glsl'
import {
  BULGE_LIGHT_GAIN,
  BULGE_LIGHT_STEP,
  CENTER_CLEAR,
  CENTER_REACH,
  CLEAR_RISE,
  CLOUD_BAKE_MARGIN,
  CLOUD_DRIFT,
  CLOUD_LAYERS,
  CLOUD_LIT_COLOR,
  CLOUD_OCTAVES,
  CLOUD_SHADE_COLOR,
  CLOUD_SOFTNESS,
  CLOUD_TILT,
  LIGHT_BIAS,
  MASS_LIGHT_GAIN,
  MASS_LIGHT_STEP,
  PASS_FROM_ZOOM,
  PASS_TO_ZOOM,
  SHIP_CLEAR_REACH,
  SHIP_CLEARANCE,
} from './constants'
import CLOUD_BAKE_FRAG from './shaders/cloudBake.frag.glsl'
import CLOUD_DECK_FRAG from './shaders/cloudDeck.frag.glsl'

export interface CloudBakeRig {
  scene: THREE.Scene
  camera: THREE.Camera
  material: THREE.ShaderMaterial
  target: THREE.WebGLArrayRenderTarget
}

export function createCloudBakeRig(): CloudBakeRig {
  const material = new THREE.ShaderMaterial({
    vertexShader: SCREEN_QUAD_VERT,
    fragmentShader: CLOUD_BAKE_FRAG,
    defines: floatDefines({
      CLOUD_BAKE_MARGIN,
      CLOUD_TILT,
      CLOUD_OCTAVES,
      LIGHT_BIAS,
      BULGE_LIGHT_STEP,
      BULGE_LIGHT_GAIN,
      MASS_LIGHT_STEP,
      MASS_LIGHT_GAIN,
    }),
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uAspect: { value: 1 },
      uScale: { value: 1 },
      uOrigin: { value: new THREE.Vector2() },
    },
  })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(quad)
  const target = new THREE.WebGLArrayRenderTarget(1, 1, CLOUD_LAYERS.length, {
    format: THREE.RGFormat,
    depthBuffer: false,
  })
  return { scene, camera: new THREE.Camera(), material, target }
}

export function disposeCloudBakeRig({ scene, material, target }: CloudBakeRig) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) object.geometry.dispose()
  })
  material.dispose()
  target.dispose()
}

export function createCloudDeckMaterial(layerMaps: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: SCREEN_QUAD_VERT,
    fragmentShader: CLOUD_DECK_FRAG,
    defines: {
      CLOUD_LAYER_COUNT: CLOUD_LAYERS.length,
      ...floatDefines({
        CLOUD_BAKE_MARGIN,
        CLOUD_DRIFT,
        CLOUD_SOFTNESS,
        SHIP_CLEARANCE,
        SHIP_CLEAR_REACH,
        PASS_FROM_ZOOM,
        PASS_TO_ZOOM,
        CLEAR_RISE,
        CENTER_CLEAR,
        CENTER_REACH,
      }),
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uLayerMaps: { value: layerMaps },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uLayerScales: { value: CLOUD_LAYERS.map(({ scale }) => scale) },
      uLayerCoverages: { value: CLOUD_LAYERS.map(({ coverage }) => coverage) },
      uLayerOpacities: { value: CLOUD_LAYERS.map(({ opacity }) => opacity) },
      uLayerZooms: { value: CLOUD_LAYERS.map(() => 1) },
      uLitColor: { value: new THREE.Color(CLOUD_LIT_COLOR) },
      uShadeColor: { value: new THREE.Color(CLOUD_SHADE_COLOR) },
    },
  })
}
