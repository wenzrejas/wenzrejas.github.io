import * as THREE from 'three'
import { MAX_BIRDS, SHADOW_COLOR, SHADOW_OPACITY } from './constants'
import { floatDefines } from '../../../utils/glsl'
import WING_FLAP_GLSL from './shaders/wingFlap.glsl'

type Point = [number, number, number]

const BODY_COLOR = new THREE.Color('#f4f1ea')
const WING_COLOR = new THREE.Color('#d6dbe0')
const TIP_COLOR = new THREE.Color('#2d3238')
const WING_ROOT = 0.05

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildBirdGeometry(): THREE.BufferGeometry {
  const positions: number[] = []
  const colors: number[] = []

  const tri = (color: THREE.Color, a: Point, b: Point, c: Point) => {
    for (const p of [a, b, c]) {
      positions.push(...p)
      colors.push(color.r, color.g, color.b)
    }
  }

  const head: Point = [0, 0.03, 0.3]
  const ridge: Point = [0, 0.05, 0]
  const shoulderL: Point = [-0.06, 0, 0.08]
  const shoulderR: Point = [0.06, 0, 0.08]
  const tailL: Point = [-0.07, 0, -0.28]
  const tailR: Point = [0.07, 0, -0.28]

  tri(BODY_COLOR, head, shoulderL, ridge)
  tri(BODY_COLOR, head, ridge, shoulderR)
  tri(BODY_COLOR, shoulderL, tailL, ridge)
  tri(BODY_COLOR, shoulderR, ridge, tailR)
  tri(BODY_COLOR, ridge, tailL, tailR)

  for (const s of [-1, 1]) {
    const rootFront: Point = [s * WING_ROOT, 0.01, 0.12]
    const rootBack: Point = [s * WING_ROOT, 0.01, -0.08]
    const elbowFront: Point = [s * 0.26, 0.02, 0.12]
    const elbowBack: Point = [s * 0.24, 0.02, -0.1]
    const handBack: Point = [s * 0.36, 0.015, -0.08]
    const handFront: Point = [s * 0.4, 0.01, 0.05]
    const tip: Point = [s * 0.52, 0, -0.12]

    tri(WING_COLOR, rootFront, rootBack, elbowBack)
    tri(WING_COLOR, rootFront, elbowBack, elbowFront)
    tri(WING_COLOR, elbowFront, elbowBack, handBack)
    tri(WING_COLOR, elbowFront, handBack, handFront)
    tri(TIP_COLOR, handFront, handBack, tip)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setAttribute(
    'aLift',
    new THREE.InstancedBufferAttribute(new Float32Array(MAX_BIRDS), 1).setUsage(
      THREE.DynamicDrawUsage
    )
  )
  geo.computeVertexNormals()
  return geo
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createBirdMaterial(): THREE.MeshLambertMaterial {
  const mat = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
    side: THREE.DoubleSide,
  })
  applyWingFlap(mat)
  return mat
}

export function createShadowMaterial(): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: SHADOW_COLOR,
    opacity: SHADOW_OPACITY,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  applyWingFlap(mat)
  return mat
}

function applyWingFlap(mat: THREE.Material): void {
  mat.defines = { ...mat.defines, ...floatDefines({ WING_ROOT }) }
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WING_FLAP_GLSL}`)
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed = flapWings(transformed);'
      )
  }
}
