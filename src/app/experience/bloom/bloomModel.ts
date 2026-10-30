import * as THREE from 'three'
import SCREEN_QUAD_VERT from '@/shaders/screenQuad.vert.glsl'
import { floatDefines } from '@/utils/glsl'
import {
  BLOOM_FAINTEST_GLOW,
  BLOOM_GLOW_CEILING,
  BLOOM_GLOW_KNEE,
  BLOOM_LEVELS,
  BLOOM_RESOLUTION,
  BLOOM_SOFTNESS,
  BLOOM_SPREAD,
} from './constants'
import BLOOM_COMPOSITE_FRAG from './shaders/bloomComposite.frag.glsl'
import BLOOM_DOWNSAMPLE_FRAG from './shaders/bloomDownsample.frag.glsl'
import BLOOM_PREFILTER_FRAG from './shaders/bloomPrefilter.frag.glsl'
import BLOOM_UPSAMPLE_FRAG from './shaders/bloomUpsample.frag.glsl'

export interface BloomChain {
  scene: THREE.Scene
  camera: THREE.Camera
  quad: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  frame: THREE.WebGLRenderTarget
  levels: THREE.WebGLRenderTarget[]
  prefilter: THREE.ShaderMaterial
  downsample: THREE.ShaderMaterial
  upsample: THREE.ShaderMaterial
  composite: THREE.ShaderMaterial
}

const buildPass = (fragmentShader: string, parameters: THREE.ShaderMaterialParameters = {}) =>
  new THREE.ShaderMaterial({
    vertexShader: SCREEN_QUAD_VERT,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    ...parameters,
    uniforms: {
      uSource: { value: null },
      uSourceTexel: { value: new THREE.Vector2() },
      ...parameters.uniforms,
    },
  })

const buildTarget = (type: THREE.TextureDataType) =>
  new THREE.WebGLRenderTarget(1, 1, { type, depthBuffer: false })

export function createBloomChain(): BloomChain {
  const prefilter = buildPass(BLOOM_PREFILTER_FRAG, {
    defines: floatDefines({ SOFTNESS: BLOOM_SOFTNESS }),
    uniforms: { uThreshold: { value: 1 } },
  })
  const downsample = buildPass(BLOOM_DOWNSAMPLE_FRAG)
  const upsample = buildPass(BLOOM_UPSAMPLE_FRAG, {
    defines: floatDefines({ SPREAD: BLOOM_SPREAD }),
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  })
  const composite = buildPass(BLOOM_COMPOSITE_FRAG, {
    defines: floatDefines({
      FAINTEST_GLOW: BLOOM_FAINTEST_GLOW,
      GLOW_KNEE: BLOOM_GLOW_KNEE,
      GLOW_HEADROOM: BLOOM_GLOW_CEILING - BLOOM_GLOW_KNEE,
    }),
    uniforms: { uStrength: { value: 0 } },
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), prefilter)
  quad.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(quad)
  return {
    scene,
    camera: new THREE.Camera(),
    quad,
    frame: buildTarget(THREE.UnsignedByteType),
    levels: Array.from({ length: BLOOM_LEVELS }, () => buildTarget(THREE.HalfFloatType)),
    prefilter,
    downsample,
    upsample,
    composite,
  }
}

export function sizeBloomChain({ frame, levels }: BloomChain, width: number, height: number) {
  frame.setSize(width, height)
  levels.forEach((level, index) => {
    const levelResolution = BLOOM_RESOLUTION / 2 ** index
    level.setSize(
      Math.max(1, Math.round(width * levelResolution)),
      Math.max(1, Math.round(height * levelResolution))
    )
  })
}

export function disposeBloomChain(chain: BloomChain) {
  chain.quad.geometry.dispose()
  chain.frame.dispose()
  for (const level of chain.levels) level.dispose()
  for (const pass of [chain.prefilter, chain.downsample, chain.upsample, chain.composite]) {
    pass.dispose()
  }
}
