import * as THREE from 'three'
import GLOW_POINT_FRAG from '@/shaders/glowPoint.frag.glsl'
import { displayColorOf } from '@/utils/color'
import { TOOL_LOGO_SPRITE_URL, type ToolKey } from '@/panels/toolkit/constants'
import { floatDefines } from '@/utils/glsl'
import { rand } from '@/utils/math'
import { createAdditiveGlowMaterial } from '@/world/islands/shared/glowMaterial'
import {
  LOGO_ATLAS_CELL,
  LOGO_ATLAS_PADDING,
  ORB_BACKLIGHT_BLUR,
  ORB_BACKLIGHT_OPACITY,
  ORB_BACKLIGHT_SPREAD,
  ORB_BODY_OPACITY,
  ORB_BODY_SHADE,
  ORB_CAUSTIC_OFFSET,
  ORB_CAUSTIC_SPREAD,
  ORB_CAUSTIC_STRENGTH,
  ORB_FILM_BANDS,
  ORB_FILM_DRIFT,
  ORB_FILM_STRENGTH,
  ORB_FLOAT_HEIGHT,
  ORB_FLOAT_RATE,
  ORB_FRESNEL_POWER,
  ORB_GLASS_COLOR,
  ORB_GLINT_START,
  ORB_HALO_FILM,
  ORB_HALO_SPREAD,
  ORB_HALO_STRENGTH,
  ORB_LENS_ZOOM,
  ORB_LIGHT_DIRECTION,
  ORB_LOGO_SHARE,
  ORB_PULSE_DEPTH,
  ORB_PULSE_RATE,
  ORB_REVOLVE_RATE,
  ORB_RIM_LIGHT,
  ORB_RIM_OPACITY,
  ORB_SHEEN_POWER,
  ORB_SHEEN_STRENGTH,
  ORB_TWINKLE_PERIOD,
  ORB_TWINKLE_RAY_WIDTH,
  ORB_TWINKLE_RIM,
  ORB_TWINKLE_SHARE,
  ORB_TWINKLE_SIZE,
  ORB_TWINKLE_STRENGTH,
  STARDUST_COLOR,
  STARDUST_PER_LAYER,
  STARDUST_PIXELS,
  STARDUST_SCATTER,
  STARDUST_STRENGTH,
  STARDUST_TWINKLE_RATE,
  STARDUST_WANDER,
} from './constants'
import { layerDirection, layerLift, type Orbit } from './orbits'
import LOGO_ORB_VERT from './shaders/logoOrb.vert.glsl'
import LOGO_ORB_FRAG from './shaders/logoOrb.frag.glsl'
import STARDUST_VERT from './shaders/stardust.vert.glsl'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

export interface LogoAtlas {
  canvas: HTMLCanvasElement
  texture: THREE.CanvasTexture
  tools: ToolKey[]
  columns: number
  rows: number
}

// ── Atlas ─────────────────────────────────────────────────────────────────────

export function createLogoAtlas(tools: ToolKey[]): LogoAtlas {
  const unique = [...new Set(tools)]
  const columns = Math.ceil(Math.sqrt(unique.length))
  const rows = Math.ceil(unique.length / columns)
  const canvas = document.createElement('canvas')
  canvas.width = columns * LOGO_ATLAS_CELL
  canvas.height = rows * LOGO_ATLAS_CELL
  const texture = new THREE.CanvasTexture(canvas)
  texture.premultiplyAlpha = true
  return { canvas, texture, tools: unique, columns, rows }
}

function placeLogo(sprite: Element, tool: ToolKey, cell: number, columns: number) {
  const viewBox = sprite.querySelector(`symbol#${tool}`)!.getAttribute('viewBox')!
  const [, , width, height] = viewBox.split(/[\s,]+/).map(Number)
  const fit = (LOGO_ATLAS_CELL - LOGO_ATLAS_PADDING * 2) / Math.hypot(width, height)
  const use = sprite.ownerDocument.createElementNS(SVG_NAMESPACE, 'use')
  use.setAttribute('href', `#${tool}`)
  use.setAttribute('x', String(((cell % columns) + 0.5) * LOGO_ATLAS_CELL - (width * fit) / 2))
  use.setAttribute(
    'y',
    String((Math.floor(cell / columns) + 0.5) * LOGO_ATLAS_CELL - (height * fit) / 2)
  )
  use.setAttribute('width', String(width * fit))
  use.setAttribute('height', String(height * fit))
  sprite.append(use)
}

export async function paintLogoAtlas({ canvas, texture, tools, columns }: LogoAtlas) {
  const markup = await (await fetch(TOOL_LOGO_SPRITE_URL)).text()
  const sprite = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  sprite.setAttribute('width', String(canvas.width))
  sprite.setAttribute('height', String(canvas.height))
  tools.forEach((tool, cell) => placeLogo(sprite, tool, cell, columns))

  const svg = new Blob([new XMLSerializer().serializeToString(sprite)], { type: 'image/svg+xml' })
  const image = new Image()
  image.src = URL.createObjectURL(svg)
  await image.decode()
  canvas.getContext('2d')!.drawImage(image, 0, 0)
  URL.revokeObjectURL(image.src)
  texture.needsUpdate = true
}

// ── Orb ───────────────────────────────────────────────────────────────────────

export const buildOrbGeometry = () => new THREE.PlaneGeometry(1, 1)

function atlasCell({ tools, columns, rows }: LogoAtlas, tool: ToolKey) {
  const cell = tools.indexOf(tool)
  const column = cell % columns
  const row = Math.floor(cell / columns)
  return new THREE.Vector4(column / columns, 1 - (row + 1) / rows, 1 / columns, 1 / rows)
}

export const createOrbMaterial = (atlas: LogoAtlas, tool: ToolKey) =>
  new THREE.ShaderMaterial({
    vertexShader: LOGO_ORB_VERT,
    fragmentShader: LOGO_ORB_FRAG,
    defines: floatDefines({
      HALO_SPREAD: ORB_HALO_SPREAD,
      HALO_STRENGTH: ORB_HALO_STRENGTH,
      BODY_OPACITY: ORB_BODY_OPACITY,
      RIM_OPACITY: ORB_RIM_OPACITY,
      BODY_SHADE: ORB_BODY_SHADE,
      FRESNEL_POWER: ORB_FRESNEL_POWER,
      RIM_LIGHT: ORB_RIM_LIGHT,
      SHEEN_POWER: ORB_SHEEN_POWER,
      SHEEN_STRENGTH: ORB_SHEEN_STRENGTH,
      GLINT_START: ORB_GLINT_START,
      CAUSTIC_OFFSET: ORB_CAUSTIC_OFFSET,
      CAUSTIC_SPREAD: ORB_CAUSTIC_SPREAD,
      CAUSTIC_STRENGTH: ORB_CAUSTIC_STRENGTH,
      FILM_STRENGTH: ORB_FILM_STRENGTH,
      FILM_BANDS: ORB_FILM_BANDS,
      FILM_DRIFT: ORB_FILM_DRIFT,
      HALO_FILM: ORB_HALO_FILM,
      PULSE_RATE: ORB_PULSE_RATE,
      PULSE_DEPTH: ORB_PULSE_DEPTH,
      LOGO_SHARE: ORB_LOGO_SHARE,
      LENS_ZOOM: ORB_LENS_ZOOM,
      BACKLIGHT_BLUR: ORB_BACKLIGHT_BLUR,
      BACKLIGHT_SPREAD: ORB_BACKLIGHT_SPREAD,
      BACKLIGHT_OPACITY: ORB_BACKLIGHT_OPACITY,
      TWINKLE_PERIOD: ORB_TWINKLE_PERIOD,
      TWINKLE_SHARE: ORB_TWINKLE_SHARE,
      TWINKLE_RIM: ORB_TWINKLE_RIM,
      TWINKLE_SIZE: ORB_TWINKLE_SIZE,
      TWINKLE_STRENGTH: ORB_TWINKLE_STRENGTH,
      RAY_WIDTH: ORB_TWINKLE_RAY_WIDTH,
    }),
    transparent: true,
    depthWrite: false,
    premultipliedAlpha: true,
    uniforms: {
      uAtlas: { value: atlas.texture },
      uCell: { value: atlasCell(atlas, tool) },
      uGlass: { value: displayColorOf(ORB_GLASS_COLOR) },
      uLight: { value: new THREE.Vector3(...ORB_LIGHT_DIRECTION).normalize() },
      uSeed: { value: Math.random() },
      uGlow: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
  })

// ── Stardust ──────────────────────────────────────────────────────────────────

function orbitReach({ center, radius, layers }: Orbit): THREE.Box3 {
  const reach = radius * (1 + STARDUST_WANDER)
  return new THREE.Box3(
    new THREE.Vector3(center.x - reach, center.y - ORB_FLOAT_HEIGHT, center.z - reach),
    new THREE.Vector3(
      center.x + reach,
      center.y + layerLift(layers - 1) + ORB_FLOAT_HEIGHT,
      center.z + reach
    )
  )
}

export function buildStardustGeometry(orbits: Orbit[]): THREE.BufferGeometry {
  const motes = orbits.flatMap((orbit, orbitIndex) =>
    Array.from({ length: orbit.layers * STARDUST_PER_LAYER }, (_, i) => ({
      orbit,
      orbitIndex,
      layer: Math.floor(i / STARDUST_PER_LAYER),
      share: (i % STARDUST_PER_LAYER) / STARDUST_PER_LAYER,
    }))
  )
  const positions = new Float32Array(motes.length * 3)
  const radii = new Float32Array(motes.length)
  const slots = new Float32Array(motes.length)
  const lifts = new Float32Array(motes.length)
  const directions = new Float32Array(motes.length)
  const phases = new Float32Array(motes.length)
  const orbitIndices = new Float32Array(motes.length)
  motes.forEach(({ orbit, orbitIndex, layer, share }, i) => {
    positions.set(orbit.center.toArray(), i * 3)
    radii[i] = orbit.radius
    slots[i] = (share + rand(-STARDUST_SCATTER, STARDUST_SCATTER)) * Math.PI * 2
    lifts[i] = layerLift(layer)
    directions[i] = layerDirection(layer)
    phases[i] = rand(0, Math.PI * 2)
    orbitIndices[i] = orbitIndex
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
  geometry.setAttribute('aSlot', new THREE.BufferAttribute(slots, 1))
  geometry.setAttribute('aLift', new THREE.BufferAttribute(lifts, 1))
  geometry.setAttribute('aDirection', new THREE.BufferAttribute(directions, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aOrbit', new THREE.BufferAttribute(orbitIndices, 1))
  const reach = new THREE.Box3()
  for (const orbit of orbits) reach.union(orbitReach(orbit))
  geometry.boundingSphere = reach.getBoundingSphere(new THREE.Sphere())
  return geometry
}

export function createStardustMaterial(orbitCount: number): THREE.ShaderMaterial {
  const material = createAdditiveGlowMaterial(
    STARDUST_VERT,
    GLOW_POINT_FRAG,
    {
      REVOLVE_RATE: ORB_REVOLVE_RATE,
      FLOAT_HEIGHT: ORB_FLOAT_HEIGHT,
      FLOAT_RATE: ORB_FLOAT_RATE,
      WANDER: STARDUST_WANDER,
      TWINKLE_RATE: STARDUST_TWINKLE_RATE,
      PIXELS: STARDUST_PIXELS,
      STRENGTH: STARDUST_STRENGTH,
    },
    {
      uColor: { value: displayColorOf(STARDUST_COLOR) },
      uReveal: { value: new Array<number>(orbitCount).fill(0) },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    }
  )
  material.defines.ORBIT_COUNT = orbitCount
  return material
}
