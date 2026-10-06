import * as THREE from 'three'
import SCREEN_QUAD_VERT from '@/shaders/screenQuad.vert.glsl'
import { floatDefines } from '@/utils/glsl'
import { paintMapPieces } from '../map-imagery/mapImageryModel'
import {
  DISSOLVE_CELL_PIXELS,
  DISSOLVE_SOFTNESS,
  VOYAGE_SHIFT_X,
  VOYAGE_SHIFT_Y,
} from './constants'
import { createDissolveField, fieldBytes, type DissolveField } from './dissolveField'
import MIST_DISSOLVE_FRAG from './shaders/mistDissolve.frag.glsl'

interface DissolvePlan {
  width: number
  height: number
  field: DissolveField
  snapshot: HTMLCanvasElement
}

export interface DissolveTextures {
  plan: DissolvePlan
  snapshot: THREE.CanvasTexture
  field: THREE.DataTexture
  fieldLowest: number
  fieldSpan: number
}

let plan: DissolvePlan | null = null

function paintSnapshot(paper: HTMLCanvasElement, ship: HTMLImageElement | null) {
  const snapshot = document.createElement('canvas')
  snapshot.width = paper.width
  snapshot.height = paper.height
  const context = snapshot.getContext('2d')!
  const pixelRatio = paper.width / paper.clientWidth
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.drawImage(paper, 0, 0, paper.clientWidth, paper.clientHeight)
  paintMapPieces(context, paper.clientWidth, paper.clientHeight)
  if (ship) {
    const box = ship.getBoundingClientRect()
    context.drawImage(ship, box.left, box.top, box.width, box.height)
  }
  return snapshot
}

export function prepareMistDissolve(paper: HTMLCanvasElement, ship: HTMLImageElement | null) {
  const width = paper.clientWidth
  const height = paper.clientHeight
  if (plan?.width === width && plan.height === height) return plan
  const field = createDissolveField(
    width,
    height,
    width / 2 + VOYAGE_SHIFT_X,
    height / 2 + VOYAGE_SHIFT_Y
  )
  plan = { width, height, field, snapshot: paintSnapshot(paper, ship) }
  return plan
}

export const preparedMistDissolve = () => plan

export function createMistDissolveMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: SCREEN_QUAD_VERT,
    fragmentShader: MIST_DISSOLVE_FRAG,
    defines: floatDefines({ DISSOLVE_SOFTNESS }),
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uSnapshot: { value: null },
      uField: { value: null },
      uFieldScale: { value: new THREE.Vector2(1, 1) },
      uFieldLowest: { value: 0 },
      uFieldSpan: { value: 1 },
      uFront: { value: 0 },
    },
  })
}

export function createDissolveTextures(dissolvePlan: DissolvePlan): DissolveTextures {
  const snapshot = new THREE.CanvasTexture(dissolvePlan.snapshot)
  snapshot.colorSpace = THREE.SRGBColorSpace
  snapshot.generateMipmaps = false
  snapshot.minFilter = THREE.LinearFilter

  const { columns, rows } = dissolvePlan.field
  const { bytes, lowest, span } = fieldBytes(dissolvePlan.field)
  const field = new THREE.DataTexture(bytes, columns, rows, THREE.RedFormat)
  field.unpackAlignment = 1
  field.minFilter = THREE.LinearFilter
  field.magFilter = THREE.LinearFilter
  field.needsUpdate = true

  return { plan: dissolvePlan, snapshot, field, fieldLowest: lowest, fieldSpan: span }
}

export function bindDissolveTextures(
  uniforms: Record<string, THREE.IUniform>,
  { plan: dissolvePlan, snapshot, field, fieldLowest, fieldSpan }: DissolveTextures
) {
  const { width, height, field: values } = dissolvePlan
  uniforms.uSnapshot.value = snapshot
  uniforms.uField.value = field
  uniforms.uFieldLowest.value = fieldLowest
  uniforms.uFieldSpan.value = fieldSpan
  uniforms.uFieldScale.value.set(
    width / (values.columns * DISSOLVE_CELL_PIXELS),
    height / (values.rows * DISSOLVE_CELL_PIXELS)
  )
}

export function disposeDissolveTextures({ snapshot, field }: DissolveTextures) {
  snapshot.dispose()
  field.dispose()
}
