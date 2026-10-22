import * as THREE from 'three'
import { floatDefines, glslFloat } from '@/utils/glsl'
import { rand } from '@/utils/math'
import { oceanSurfaceUniforms } from '@/world/environment/ocean/oceanSurfaceUniforms'
import { buildCellTexture } from './cellTexture'
import {
  CELL_TEXTURE_CELLS,
  CELL_TEXTURE_RANGE,
  FOAM_CELLS_ACROSS,
  FOAM_CELLS_ALONG,
  FOAM_DENSE,
  FOAM_END_REACH,
  FOAM_FINE_CELLS_ACROSS,
  FOAM_FINE_CELLS_ALONG,
  FOAM_FINE_PACE,
  FOAM_SPARSE,
  FOAM_STRENGTH,
  HIGHLIGHT_DASH_SHARE,
  HIGHLIGHT_DASHES,
  HIGHLIGHT_STRENGTH,
  PAD_DEPTH,
  PAD_FLOW,
  PAD_LIFT,
  PAD_WIDTH_SHARE,
  POOL_PAD_DEPTH,
  POOL_PAD_LIFT,
  POOL_PAD_WIDTH_SHARE,
  POOL_SPLASH_PARTICLES,
  SEA_SPLASH_PARTICLES,
  SPLASH_ANGLE_MAX,
  SPLASH_ANGLE_MIN,
  SPLASH_BOUNDS_MARGIN,
  SPLASH_HEIGHT,
  SPLASH_LIFT,
  SPLASH_RATE,
  SPLASH_RATE_SPREAD,
  SPLASH_REACH,
  SPLASH_SIZE,
  TONE_BASE,
  TONE_PEAK,
} from './constants'
import { FLOW_SPEEDS, type Cascades, type FlowKind, type FlowMesh } from './cascades'
import type { SplashSite } from './waterfallSplash'
import WATERFALL_VERT from './shaders/waterfall.vert.glsl'
import WATER_FRAG from './shaders/waterfallWater.frag.glsl'
import HIGHLIGHT_FRAG from './shaders/waterfallHighlight.frag.glsl'
import FOAM_PAD_VERT from './shaders/foamPad.vert.glsl'
import FOAM_PAD_FRAG from './shaders/foamPad.frag.glsl'
import SPLASH_VERT from './shaders/splash.vert.glsl'
import SPLASH_FRAG from './shaders/splash.frag.glsl'

export const flowUniforms = {
  uFlowTime: { value: 0 },
  uFoamColor: { value: new THREE.Color() },
  uPixelsPerUnit: { value: 1 },
  uCellMap: { value: buildCellTexture() },
}

const glslVec2 = (x: number, y: number) => `vec2(${glslFloat(x)}, ${glslFloat(y)})`

const FOAM_DEFINES = {
  FOAM_SCALE_A: glslVec2(FOAM_CELLS_ACROSS, FOAM_CELLS_ALONG),
  FOAM_SCALE_B: glslVec2(FOAM_FINE_CELLS_ACROSS, FOAM_FINE_CELLS_ALONG),
  ...floatDefines({
    FOAM_PACE_B: FOAM_FINE_PACE,
    FOAM_DENSE,
    FOAM_SPARSE,
    CELL_TEXTURE_CELLS,
    CELL_TEXTURE_RANGE,
  }),
}

const foamUniforms = () => ({
  uFlowTime: flowUniforms.uFlowTime,
  uFoamColor: flowUniforms.uFoamColor,
  uCellMap: flowUniforms.uCellMap,
})

// ── Cascade materials ─────────────────────────────────────────────────────────

const createWaterMaterial = (isFalling: boolean) =>
  new THREE.ShaderMaterial({
    vertexShader: WATERFALL_VERT,
    fragmentShader: WATER_FRAG,
    defines: {
      ...FOAM_DEFINES,
      ...floatDefines({ FOAM_END_REACH, FOAM_STRENGTH, TONE_BASE, TONE_PEAK }),
      ...(isFalling ? { FALLING: '' } : {}),
    },
    side: THREE.DoubleSide,
    uniforms: { ...oceanSurfaceUniforms, ...foamUniforms() },
  })

export function createCascadeMaterials(): Record<FlowKind, THREE.ShaderMaterial> {
  return {
    sheet: createWaterMaterial(true),
    channel: createWaterMaterial(false),
    highlight: new THREE.ShaderMaterial({
      vertexShader: WATERFALL_VERT,
      fragmentShader: HIGHLIGHT_FRAG,
      defines: floatDefines({
        HIGHLIGHT_DASHES,
        HIGHLIGHT_DASH_SHARE,
        HIGHLIGHT_STRENGTH,
        TONE_BASE,
      }),
      side: THREE.DoubleSide,
      uniforms: { ...oceanSurfaceUniforms, ...foamUniforms() },
    }),
  }
}

function addFlowAttribute({ mesh, kind, phase }: FlowMesh): void {
  const count = mesh.geometry.getAttribute('position').count
  const flow = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    flow[i * 2] = phase
    flow[i * 2 + 1] = FLOW_SPEEDS[kind]
  }
  mesh.geometry.setAttribute('aFlow', new THREE.BufferAttribute(flow, 2))
}

export function dressCascades(
  { flows }: Cascades,
  materials: Record<FlowKind, THREE.ShaderMaterial>
): void {
  for (const flow of flows) {
    addFlowAttribute(flow)
    flow.mesh.material = materials[flow.kind]
  }
}

// ── Foam pads ─────────────────────────────────────────────────────────────────

const PAD_CORNERS = [
  [-1, 0],
  [1, 0],
  [-1, 1],
  [1, 1],
]

const padShapeOf = (site: SplashSite) =>
  site.intoSea
    ? { halfWidth: site.halfWidth * PAD_WIDTH_SHARE, depth: PAD_DEPTH, y: PAD_LIFT }
    : {
        halfWidth: site.halfWidth * POOL_PAD_WIDTH_SHARE,
        depth: POOL_PAD_DEPTH,
        y: site.y + POOL_PAD_LIFT,
      }

export function buildFoamPadGeometry(sites: SplashSite[]): THREE.BufferGeometry {
  const positions: number[] = []
  const uvs: number[] = []
  const seeds: number[] = []
  const indices: number[] = []
  sites.forEach((site, i) => {
    const seed = Math.random()
    const { halfWidth, depth, y } = padShapeOf(site)
    for (const [side, outward] of PAD_CORNERS) {
      positions.push(
        site.x + site.alongX * halfWidth * side + site.awayX * depth * outward,
        y,
        site.z + site.alongZ * halfWidth * side + site.awayZ * depth * outward
      )
      uvs.push((side + 1) / 2, outward)
      seeds.push(seed)
    }
    const first = i * PAD_CORNERS.length
    indices.push(first, first + 1, first + 2, first + 1, first + 3, first + 2)
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))
  geometry.setIndex(indices)
  return geometry
}

export const createFoamPadMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: FOAM_PAD_VERT,
    fragmentShader: FOAM_PAD_FRAG,
    defines: { ...FOAM_DEFINES, ...floatDefines({ PAD_FLOW }) },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    uniforms: foamUniforms(),
  })

// ── Splash ────────────────────────────────────────────────────────────────────

export function buildSplashGeometry(sites: SplashSite[]): THREE.BufferGeometry {
  const centres: number[] = []
  const spans: number[] = []
  const aways: number[] = []
  const seeds: number[] = []
  for (const site of sites) {
    const count = site.intoSea ? SEA_SPLASH_PARTICLES : POOL_SPLASH_PARTICLES
    const baseY = (site.intoSea ? 0 : site.y) + SPLASH_LIFT
    for (let i = 0; i < count; i++) {
      centres.push(site.x, baseY, site.z)
      spans.push(site.alongX * site.halfWidth, 0, site.alongZ * site.halfWidth)
      aways.push(site.awayX, 0, site.awayZ)
      seeds.push(
        rand(-1, 1),
        rand(SPLASH_ANGLE_MIN, SPLASH_ANGLE_MAX),
        i / count,
        rand(1 - SPLASH_RATE_SPREAD, 1 + SPLASH_RATE_SPREAD)
      )
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(centres, 3))
  geometry.setAttribute('aSpan', new THREE.Float32BufferAttribute(spans, 3))
  geometry.setAttribute('aAway', new THREE.Float32BufferAttribute(aways, 3))
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 4))
  geometry.computeBoundingSphere()
  geometry.boundingSphere!.radius += SPLASH_REACH + SPLASH_HEIGHT + SPLASH_BOUNDS_MARGIN
  return geometry
}

export const createSplashMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: SPLASH_VERT,
    fragmentShader: SPLASH_FRAG,
    defines: floatDefines({ SPLASH_RATE, SPLASH_REACH, SPLASH_HEIGHT, SPLASH_SIZE }),
    uniforms: { ...foamUniforms(), uPixelsPerUnit: flowUniforms.uPixelsPerUnit },
  })
