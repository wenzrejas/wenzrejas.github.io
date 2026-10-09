import * as THREE from 'three'
import { columnBoundingSphere } from '@/utils/bounds'
import { floatDefines } from '@/utils/glsl'
import { rand } from '@/utils/math'
import {
  NOTE_ATLAS_CELL,
  NOTE_COLOR,
  NOTE_COUNT,
  NOTE_FADE_FROM,
  NOTE_LIFETIME,
  NOTE_OUTLINE_COLOR,
  NOTE_OUTLINE_WIDTH,
  NOTE_POP_OVERSHOOT,
  NOTE_POP_SECONDS,
  NOTE_RISE,
  NOTE_SIZE,
  NOTE_SIZE_VARIANCE,
  NOTE_SPREAD,
  NOTE_SWAY,
  NOTE_SWAY_RATE,
  NOTE_TILT,
  NOTE_TILT_RATE,
} from './constants'
import MUSIC_NOTES_VERT from './shaders/musicNotes.vert.glsl'
import MUSIC_NOTES_FRAG from './shaders/musicNotes.frag.glsl'

const GLYPH_DESIGN_SIZE = 100

// ── Atlas ─────────────────────────────────────────────────────────────────────

function eighthNote(): Path2D {
  const glyph = new Path2D('M49 74 L49 16 L55 16 C60 30 80 34 76 58 C72 44 64 40 55 38 L55 74 Z')
  glyph.ellipse(40, 76, 14, 10, -0.45, 0, Math.PI * 2)
  return glyph
}

function beamedNotes(): Path2D {
  const glyph = new Path2D('M36 78 L36 28 L84 16 L84 70 L79 70 L79 32 L41 42 L41 78 Z')
  glyph.ellipse(28, 79, 12, 9, -0.45, 0, Math.PI * 2)
  glyph.ellipse(71, 71, 12, 9, -0.45, 0, Math.PI * 2)
  return glyph
}

const NOTE_GLYPHS = [eighthNote, beamedNotes]

function paintGlyph(context: CanvasRenderingContext2D, glyph: Path2D, cell: number) {
  const scale = NOTE_ATLAS_CELL / (GLYPH_DESIGN_SIZE + NOTE_OUTLINE_WIDTH * 2)
  const inset = NOTE_OUTLINE_WIDTH * scale
  context.setTransform(scale, 0, 0, scale, cell * NOTE_ATLAS_CELL + inset, inset)
  context.stroke(glyph)
  context.fill(glyph)
}

export function paintNoteAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = NOTE_GLYPHS.length * NOTE_ATLAS_CELL
  canvas.height = NOTE_ATLAS_CELL

  const context = canvas.getContext('2d')!
  context.lineJoin = 'round'
  context.lineWidth = NOTE_OUTLINE_WIDTH * 2
  context.strokeStyle = NOTE_OUTLINE_COLOR
  context.fillStyle = NOTE_COLOR
  NOTE_GLYPHS.forEach((drawGlyph, cell) => paintGlyph(context, drawGlyph(), cell))

  const texture = new THREE.CanvasTexture(canvas)
  texture.premultiplyAlpha = true
  return texture
}

// ── Notes ─────────────────────────────────────────────────────────────────────

function noteReach(): THREE.Sphere {
  const noteRadius = NOTE_SIZE * (1 + NOTE_SIZE_VARIANCE) * (1 + NOTE_POP_OVERSHOOT)
  const spread = NOTE_SPREAD + NOTE_SWAY + noteRadius
  return columnBoundingSphere(spread, -noteRadius, NOTE_RISE + noteRadius)
}

export function buildNoteGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array(NOTE_COUNT * 3)
  const seeds = new Float32Array(NOTE_COUNT * 4)
  for (let i = 0; i < NOTE_COUNT; i++) {
    seeds.set(
      [
        i / NOTE_COUNT,
        rand(0, Math.PI * 2),
        rand(1 - NOTE_SIZE_VARIANCE, 1 + NOTE_SIZE_VARIANCE),
        i % NOTE_GLYPHS.length,
      ],
      i * 4
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
  geometry.boundingSphere = noteReach()
  return geometry
}

export const createNoteMaterial = (atlas: THREE.Texture) =>
  new THREE.ShaderMaterial({
    vertexShader: MUSIC_NOTES_VERT,
    fragmentShader: MUSIC_NOTES_FRAG,
    defines: floatDefines({
      LIFETIME: NOTE_LIFETIME,
      RISE: NOTE_RISE,
      SPREAD: NOTE_SPREAD,
      SWAY: NOTE_SWAY,
      SWAY_RATE: NOTE_SWAY_RATE,
      POP_SHARE: NOTE_POP_SECONDS / NOTE_LIFETIME,
      POP_OVERSHOOT: NOTE_POP_OVERSHOOT,
      FADE_FROM: NOTE_FADE_FROM,
      TILT: NOTE_TILT,
      TILT_RATE: NOTE_TILT_RATE,
      GLYPH_COUNT: NOTE_GLYPHS.length,
    }),
    transparent: true,
    depthWrite: false,
    premultipliedAlpha: true,
    uniforms: {
      uAtlas: { value: atlas },
      uSeconds: { value: 0 },
      uSize: { value: 1 },
      uLastLaunch: { value: 0 },
    },
  })
