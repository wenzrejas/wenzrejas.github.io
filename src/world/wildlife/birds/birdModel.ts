import * as THREE from 'three'
import { MAX_BIRDS, SHADOW_COLOR, SHADOW_OPACITY } from './constants'
import { createTriangleSoup, type TrianglePoint } from '@/utils/geometry'
import { floatDefines } from '@/utils/glsl'
import WING_FLAP_GLSL from './shaders/wingFlap.glsl'

const BODY_COLOR = new THREE.Color('#f4f1ea')
const WING_COLOR = new THREE.Color('#d6dbe0')
const TIP_COLOR = new THREE.Color('#2d3238')
const WING_ROOT = 0.05

// ── Geometry ──────────────────────────────────────────────────────────────────

export function buildBirdGeometry(): THREE.BufferGeometry {
  const { positions, colors, addTriangle } = createTriangleSoup()

  const head: TrianglePoint = [0, 0.03, 0.3]
  const ridge: TrianglePoint = [0, 0.05, 0]
  const shoulderL: TrianglePoint = [-0.06, 0, 0.08]
  const shoulderR: TrianglePoint = [0.06, 0, 0.08]
  const tailL: TrianglePoint = [-0.07, 0, -0.28]
  const tailR: TrianglePoint = [0.07, 0, -0.28]

  addTriangle(BODY_COLOR, head, shoulderL, ridge)
  addTriangle(BODY_COLOR, head, ridge, shoulderR)
  addTriangle(BODY_COLOR, shoulderL, tailL, ridge)
  addTriangle(BODY_COLOR, shoulderR, ridge, tailR)
  addTriangle(BODY_COLOR, ridge, tailL, tailR)

  for (const side of [-1, 1]) {
    const rootFront: TrianglePoint = [side * WING_ROOT, 0.01, 0.12]
    const rootBack: TrianglePoint = [side * WING_ROOT, 0.01, -0.08]
    const elbowFront: TrianglePoint = [side * 0.26, 0.02, 0.12]
    const elbowBack: TrianglePoint = [side * 0.24, 0.02, -0.1]
    const handBack: TrianglePoint = [side * 0.36, 0.015, -0.08]
    const handFront: TrianglePoint = [side * 0.4, 0.01, 0.05]
    const tip: TrianglePoint = [side * 0.52, 0, -0.12]

    addTriangle(WING_COLOR, rootFront, rootBack, elbowBack)
    addTriangle(WING_COLOR, rootFront, elbowBack, elbowFront)
    addTriangle(WING_COLOR, elbowFront, elbowBack, handBack)
    addTriangle(WING_COLOR, elbowFront, handBack, handFront)
    addTriangle(TIP_COLOR, handFront, handBack, tip)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute(
    'aLift',
    new THREE.InstancedBufferAttribute(new Float32Array(MAX_BIRDS), 1).setUsage(
      THREE.DynamicDrawUsage
    )
  )
  geometry.computeVertexNormals()
  return geometry
}

// ── Material ──────────────────────────────────────────────────────────────────

export function createBirdMaterial(): THREE.MeshLambertMaterial {
  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
    side: THREE.DoubleSide,
  })
  applyWingFlap(material)
  return material
}

export function createShadowMaterial(): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({
    color: SHADOW_COLOR,
    opacity: SHADOW_OPACITY,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  applyWingFlap(material)
  return material
}

function applyWingFlap(material: THREE.Material): void {
  material.defines = { ...material.defines, ...floatDefines({ WING_ROOT }) }
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WING_FLAP_GLSL}`)
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed = flapWings(transformed);'
      )
  }
}
