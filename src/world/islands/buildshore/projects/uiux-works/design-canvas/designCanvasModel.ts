import * as THREE from 'three'
import { DESIGN_CANVAS_COPY } from '@/data/islandCopy'
import UV_QUAD_VERT from '@/shaders/uvQuad.vert.glsl'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import {
  GRID_BASE_ALPHA,
  GRID_CELLS,
  GRID_COLOR,
  GRID_LINE_WIDTH,
  GRID_SWEEP_SHARPNESS,
  LABEL_FONT,
  LABEL_GAP_PIXELS,
  LABEL_HALO_COLOR,
  LABEL_HALO_PIXELS,
  LABEL_HEIGHT_PIXELS,
  LABEL_ICON_PIXELS,
  LABEL_ICON_SPREAD_SHARE,
  LABEL_ICON_TILE_SHARE,
  LABEL_TEXT_NUDGE_PIXELS,
  LABEL_WIDTH_PIXELS,
  PILL_FONT,
  PILL_HEIGHT_PIXELS,
  PILL_RADIUS_PIXELS,
  PILL_TEXT_COLOR,
  PILL_WIDTH_PIXELS,
  SELECTION_COLOR,
  SELECTION_FILL_ALPHA,
  SELECTION_HANDLE_PIXELS,
  SELECTION_STROKE_PIXELS,
} from './constants'
import LAYOUT_GRID_FRAG from './shaders/layoutGrid.frag.glsl'
import SCREEN_BOX_VERT from './shaders/screenBox.vert.glsl'
import SELECTION_BOX_FRAG from './shaders/selectionBox.frag.glsl'
import SCREEN_LABEL_FRAG from './shaders/screenLabel.frag.glsl'

export interface ScreenLabel {
  texture: THREE.CanvasTexture
  halfSize: THREE.Vector2
}

// ── Layout grid ───────────────────────────────────────────────────────────────

export const createLayoutGridMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: UV_QUAD_VERT,
    fragmentShader: LAYOUT_GRID_FRAG,
    defines: floatDefines({
      CELLS: GRID_CELLS,
      LINE_WIDTH: GRID_LINE_WIDTH,
      BASE_ALPHA: GRID_BASE_ALPHA,
      SWEEP_SHARPNESS: GRID_SWEEP_SHARPNESS,
    }),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: displayColorOf(GRID_COLOR) },
      uLevel: { value: 0 },
      uSweep: { value: 0 },
    },
  })

// ── Screen-space quads ────────────────────────────────────────────────────────

export const buildScreenQuad = () => new THREE.PlaneGeometry(2, 2)

const screenUniforms = () => ({
  uViewport: { value: new THREE.Vector2(1, 1) },
  uHalfSize: { value: new THREE.Vector2(1, 1) },
  uOffset: { value: new THREE.Vector2() },
  uLevel: { value: 0 },
})

export const createSelectionBoxMaterial = (pixelRatio: number) =>
  new THREE.ShaderMaterial({
    vertexShader: SCREEN_BOX_VERT,
    fragmentShader: SELECTION_BOX_FRAG,
    defines: floatDefines({
      STROKE: SELECTION_STROKE_PIXELS * pixelRatio,
      HANDLE: SELECTION_HANDLE_PIXELS * pixelRatio,
      FILL_ALPHA: SELECTION_FILL_ALPHA,
    }),
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      ...screenUniforms(),
      uColor: { value: displayColorOf(SELECTION_COLOR) },
      uBoxHalf: { value: new THREE.Vector2(1, 1) },
    },
  })

export const createScreenLabelMaterial = (label: ScreenLabel) =>
  new THREE.ShaderMaterial({
    vertexShader: SCREEN_BOX_VERT,
    fragmentShader: SCREEN_LABEL_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { ...screenUniforms(), uLabel: { value: label.texture } },
  })

export function showLayoutGrid(material: THREE.ShaderMaterial, level: number, sweep: number): void {
  material.uniforms.uLevel.value = level
  material.uniforms.uSweep.value = sweep
}

export function placeSelectionBox(
  material: THREE.ShaderMaterial,
  viewport: THREE.Vector2,
  boxHalf: THREE.Vector2,
  reachBeyond: number,
  level: number
): void {
  const { uniforms } = material
  uniforms.uViewport.value.copy(viewport)
  uniforms.uBoxHalf.value.copy(boxHalf)
  uniforms.uHalfSize.value.copy(boxHalf).addScalar(reachBeyond)
  uniforms.uLevel.value = level
}

export function placeScreenLabel(
  material: THREE.ShaderMaterial,
  label: ScreenLabel,
  viewport: THREE.Vector2,
  offset: THREE.Vector2,
  level: number
): void {
  const { uniforms } = material
  uniforms.uViewport.value.copy(viewport)
  uniforms.uHalfSize.value.copy(label.halfSize)
  uniforms.uOffset.value.copy(offset)
  uniforms.uLevel.value = level
}

// ── Labels ────────────────────────────────────────────────────────────────────

function paintLayerName(context: CanvasRenderingContext2D, height: number): void {
  const icon = LABEL_ICON_PIXELS / 2
  const tile = icon * LABEL_ICON_TILE_SHARE
  const spread = icon * LABEL_ICON_SPREAD_SHARE
  const textX = LABEL_ICON_PIXELS + LABEL_GAP_PIXELS / 2
  const textY = height / 2 + LABEL_TEXT_NUDGE_PIXELS
  context.fillStyle = SELECTION_COLOR
  context.strokeStyle = LABEL_HALO_COLOR
  context.lineWidth = LABEL_HALO_PIXELS
  context.lineJoin = 'round'
  for (const [x, y] of [
    [icon, height / 2 - spread],
    [icon, height / 2 + spread],
    [icon - spread, height / 2],
    [icon + spread, height / 2],
  ]) {
    context.save()
    context.translate(x, y)
    context.rotate(Math.PI / 4)
    context.strokeRect(-tile / 2, -tile / 2, tile, tile)
    context.fillRect(-tile / 2, -tile / 2, tile, tile)
    context.restore()
  }
  context.font = LABEL_FONT
  context.textBaseline = 'middle'
  context.strokeText(DESIGN_CANVAS_COPY.layerName, textX, textY)
  context.fillText(DESIGN_CANVAS_COPY.layerName, textX, textY)
}

function paintLayerSize(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = SELECTION_COLOR
  context.beginPath()
  context.roundRect(0, 0, width, height, PILL_RADIUS_PIXELS)
  context.fill()
  context.fillStyle = PILL_TEXT_COLOR
  context.font = PILL_FONT
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(DESIGN_CANVAS_COPY.layerSize, width / 2, height / 2 + LABEL_TEXT_NUDGE_PIXELS)
}

function createLabel(
  width: number,
  height: number,
  pixelRatio: number,
  paint: (context: CanvasRenderingContext2D) => void
): ScreenLabel {
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * pixelRatio)
  canvas.height = Math.ceil(height * pixelRatio)
  const texture = new THREE.CanvasTexture(canvas)
  const repaint = () => {
    const context = canvas.getContext('2d')!
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.clearRect(0, 0, width, height)
    paint(context)
    texture.needsUpdate = true
  }
  repaint()
  void document.fonts.load(LABEL_FONT).then(repaint)
  return { texture, halfSize: new THREE.Vector2(canvas.width / 2, canvas.height / 2) }
}

export const createLayerNameLabel = (pixelRatio: number) =>
  createLabel(LABEL_WIDTH_PIXELS, LABEL_HEIGHT_PIXELS, pixelRatio, (context) =>
    paintLayerName(context, LABEL_HEIGHT_PIXELS)
  )

export const createLayerSizeLabel = (pixelRatio: number) =>
  createLabel(PILL_WIDTH_PIXELS, PILL_HEIGHT_PIXELS, pixelRatio, (context) =>
    paintLayerSize(context, PILL_WIDTH_PIXELS, PILL_HEIGHT_PIXELS)
  )
