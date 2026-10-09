import * as THREE from 'three'
import { GROVE_TOOLS, type ToolKey } from '@/panels/toolkit/constants'
import { isEngaged } from '@/interaction/hover'
import { mix, rand } from '@/utils/math'
import {
  ORB_FADE_SHARE,
  ORB_FLOAT_HEIGHT,
  ORB_FLOAT_RATE,
  ORB_HALO_SPREAD,
  ORB_HIDE_POP_SECONDS,
  ORB_HIDE_PULL,
  ORB_HIDE_STAGGER_SECONDS,
  ORB_LAYER_GAP,
  ORB_LAYER_SIZE,
  ORB_POP_OVERSHOOT,
  ORB_POP_SECONDS,
  ORB_RADIUS,
  ORB_REVOLVE_RATE,
  ORB_RING_CLEARANCE,
  ORB_RING_HEIGHT,
  ORB_SPIRAL,
  ORB_STAGGER_SECONDS,
  RING_LAYER_DELAY,
  RING_REVEAL_SECONDS,
} from './constants'
import {
  createHoverTimeline,
  stepHoverTimeline,
  type HoverTimeline,
} from '@/world/islands/shared/hoverTimeline'
import type { Statue } from '../shrines'

export interface Orbit extends HoverTimeline {
  statue: Statue
  center: THREE.Vector3
  radius: number
  layers: number
}

export interface LogoOrb {
  orbit: Orbit
  tool: ToolKey
  slot: number
  lift: number
  direction: number
  showDelay: number
  hideDelay: number
  floatPhase: number
  position: THREE.Vector3
  size: number
  opacity: number
}

const { clamp, smoothstep } = THREE.MathUtils

const FULL_SHOW_SECONDS = ORB_STAGGER_SECONDS + ORB_POP_SECONDS
const FULL_HIDE_SECONDS = ORB_HIDE_STAGGER_SECONDS + ORB_HIDE_POP_SECONDS
const ORB_QUAD_SIZE = ORB_RADIUS * 2 * ORB_HALO_SPREAD

function orbitAround(statue: Statue): Orbit {
  const { bounds } = statue
  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())
  center.y = mix(bounds.min.y, bounds.max.y, ORB_RING_HEIGHT)
  return {
    ...createHoverTimeline(),
    statue,
    center,
    radius: Math.max(size.x, size.z) / 2 + ORB_RING_CLEARANCE + ORB_RADIUS,
    layers: Math.ceil(GROVE_TOOLS[statue.grove].length / ORB_LAYER_SIZE),
  }
}

export const layerLift = (layer: number) => layer * ORB_LAYER_GAP
export const layerDirection = (layer: number) => (layer % 2 === 0 ? 1 : -1)

function splitIntoLayers(tools: ToolKey[], layers: number): ToolKey[][] {
  return Array.from({ length: layers }, (_, layer) =>
    tools.slice(
      Math.round((layer * tools.length) / layers),
      Math.round(((layer + 1) * tools.length) / layers)
    )
  )
}

function orbsOn(orbit: Orbit): LogoOrb[] {
  const tools = GROVE_TOOLS[orbit.statue.grove]
  return splitIntoLayers(tools, orbit.layers).flatMap((layerTools, layer) =>
    layerTools.map((tool, i) => {
      const order = tools.indexOf(tool) / tools.length
      return {
        orbit,
        tool,
        slot: ((i + layer / 2) / layerTools.length) * Math.PI * 2,
        lift: layerLift(layer),
        direction: layerDirection(layer),
        showDelay: order * ORB_STAGGER_SECONDS,
        hideDelay: (1 - order) * ORB_HIDE_STAGGER_SECONDS,
        floatPhase: rand(0, Math.PI * 2),
        position: new THREE.Vector3(),
        size: 0,
        opacity: 0,
      }
    })
  )
}

export function arrangeOrbs(statues: Statue[]) {
  const orbits = statues.map(orbitAround)
  return { orbits, orbs: orbits.flatMap(orbsOn) }
}

export function revealOrbits(orbits: Orbit[], dt: number) {
  for (const orbit of orbits) {
    const engaged = isEngaged(orbit.isHovered, orbit.statue.grove)
    stepHoverTimeline(orbit, engaged, dt, FULL_HIDE_SECONDS, FULL_SHOW_SECONDS)
  }
}

export const orbitReveal = ({ seconds, presence }: Orbit) =>
  (seconds / FULL_SHOW_SECONDS) * presence

export const ringReveal = ({ seconds, presence }: Orbit, layer: number) =>
  clamp((seconds - layer * RING_LAYER_DELAY) / RING_REVEAL_SECONDS, 0, 1) * presence

function popScale(progress: number) {
  const remaining = progress - 1
  return 1 + remaining * remaining * ((ORB_POP_OVERSHOOT + 1) * remaining + ORB_POP_OVERSHOOT)
}

export function floatOrb(orb: LogoOrb, time: number) {
  const { orbit } = orb
  const hiddenSeconds = (1 - orbit.presence) * FULL_HIDE_SECONDS
  const progress = clamp((orbit.seconds - orb.showDelay) / ORB_POP_SECONDS, 0, 1)
  const leaving = clamp((hiddenSeconds - orb.hideDelay) / ORB_HIDE_POP_SECONDS, 0, 1)
  const vanish = smoothstep(1 - leaving, 0, 1)
  const spread = (1 - (1 - progress) ** 3) * mix(ORB_HIDE_PULL, 1, vanish)
  const turn = time * ORB_REVOLVE_RATE - (1 - spread) * ORB_SPIRAL
  const angle = orb.slot + turn * orb.direction
  const float = Math.sin(time * ORB_FLOAT_RATE + orb.floatPhase) * ORB_FLOAT_HEIGHT
  orb.position.set(
    orbit.center.x + Math.cos(angle) * orbit.radius * spread,
    orbit.center.y + orb.lift + float,
    orbit.center.z + Math.sin(angle) * orbit.radius * spread
  )
  orb.size = ORB_QUAD_SIZE * popScale(progress) * vanish
  orb.opacity = smoothstep(progress, 0, ORB_FADE_SHARE) * vanish
}
