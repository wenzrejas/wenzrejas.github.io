import * as THREE from 'three'
import { useDepthsStore } from '@/store/depthsStore'
import { isDepthsInView } from '@/store/viewStore'
import { LEVEL_DROP } from '../constants'
import { wakeShare } from '../ruin-life/shared/ruinWake'
import { levelDepth, levelSpot, type Timeline } from '../timeline/timeline'
import {
  DOCK_FULL_LEVELS,
  DOCK_GONE_LEVELS,
  PANEL_ACROSS,
  PANEL_DEPTH_Z,
  PANEL_FADE_RATE,
  PANEL_LIFT,
  PANEL_SLIDE_PIXELS,
  PANEL_TOP_CLEARANCE_PIXELS,
  READ_BOTTOM_MARGIN_PIXELS,
  UNDER_ARRIVE_FROM,
  UNDER_GONE,
  UNDER_READ_END,
  UNDER_TUCK_PIXELS,
} from './constants'

export type PanelLayout = 'anchored' | 'docked' | 'under'

interface PanelReveal {
  presence: number
  height: number
}

const { damp, smoothstep } = THREE.MathUtils

const _ruinSpot = new THREE.Vector3()
const _panelSpot = new THREE.Vector3()
const _laterSpot = new THREE.Vector3()

export const createPanelReveal = (): PanelReveal => ({ presence: 0, height: 0 })

export const panelSide = (level: number) => -Math.sign(levelSpot(level, _ruinSpot).x)

export const panelSpot = (level: number): [number, number, number] => [
  panelSide(level) * PANEL_ACROSS,
  levelDepth(level) + PANEL_LIFT,
  PANEL_DEPTH_Z,
]

export function measurePanel(reveal: PanelReveal, card: HTMLElement) {
  const observer = new ResizeObserver(() => {
    reveal.height = card.offsetHeight
  })
  observer.observe(card)
  return () => observer.disconnect()
}

function screenYAfterTravel(
  levels: number,
  travelled: number,
  camera: THREE.Camera,
  height: number
) {
  _laterSpot.copy(_panelSpot)
  _laterSpot.y += (levels - travelled) * LEVEL_DROP
  return ((1 - _laterSpot.project(camera).y) / 2) * height
}

function settleBelowTopRow(restY: number, cardHeight: number, screenHeight: number) {
  const reachToClear = PANEL_TOP_CLEARANCE_PIXELS - (restY - cardHeight / 2)
  const roomBelow = screenHeight - READ_BOTTOM_MARGIN_PIXELS - (restY + cardHeight / 2)
  return Math.max(0, Math.min(reachToClear, roomBelow))
}

function dockedExtraPace(firstY: number, lastY: number, cardHeight: number, screenHeight: number) {
  const reachToTop = cardHeight / 2 + PANEL_TOP_CLEARANCE_PIXELS - firstY
  const reachToBottom = lastY + cardHeight / 2 + READ_BOTTOM_MARGIN_PIXELS - screenHeight
  return Math.max(0, reachToTop, reachToBottom) / DOCK_FULL_LEVELS
}

function underExtraPace(lastY: number, cardHeight: number, screenHeight: number) {
  const finishTop = screenHeight - cardHeight - READ_BOTTOM_MARGIN_PIXELS
  return Math.max(0, lastY + UNDER_TUCK_PIXELS - finishTop) / UNDER_READ_END
}

export const panelPosition =
  (layout: PanelLayout, level: number, timeline: Timeline, reveal: PanelReveal) =>
  (
    anchor: THREE.Object3D,
    camera: THREE.Camera,
    { width, height }: { width: number; height: number }
  ) => {
    _panelSpot.setFromMatrixPosition(anchor.matrixWorld)
    const travelled = timeline.viewedLevel - level
    const y = screenYAfterTravel(travelled, travelled, camera, height)
    if (layout === 'under') {
      const lastY = screenYAfterTravel(UNDER_READ_END, travelled, camera, height)
      const extraPace = underExtraPace(lastY, reveal.height, height)
      return [0, y + UNDER_TUCK_PIXELS - Math.max(0, travelled) * extraPace]
    }
    const restY = screenYAfterTravel(0, travelled, camera, height)
    const settle = settleBelowTopRow(restY, reveal.height, height)
    if (layout === 'anchored') return [((_panelSpot.project(camera).x + 1) / 2) * width, y + settle]
    const firstY = screenYAfterTravel(-DOCK_FULL_LEVELS, travelled, camera, height) + settle
    const lastY = screenYAfterTravel(DOCK_FULL_LEVELS, travelled, camera, height) + settle
    return [0, y + settle - travelled * dockedExtraPace(firstY, lastY, reveal.height, height)]
  }

const isPanelShown = () => isDepthsInView() && useDepthsStore.getState().isRevealed

function panelPresence(layout: PanelLayout, timeline: Timeline, level: number) {
  if (layout === 'anchored') return wakeShare(timeline, level)
  const travelled = timeline.viewedLevel - level
  if (layout === 'docked') {
    return 1 - smoothstep(Math.abs(travelled), DOCK_FULL_LEVELS, DOCK_GONE_LEVELS)
  }
  return (
    smoothstep(travelled, UNDER_ARRIVE_FROM, 0) *
    (1 - smoothstep(travelled, UNDER_READ_END, UNDER_GONE))
  )
}

export function stepPanelReveal(
  reveal: PanelReveal,
  layout: PanelLayout,
  timeline: Timeline,
  level: number,
  dt: number
) {
  const target = isPanelShown() ? panelPresence(layout, timeline, level) : 0
  reveal.presence = damp(reveal.presence, target, PANEL_FADE_RATE, dt)
}

export function showPanel(card: HTMLElement, slideSide: number, presence: number) {
  card.style.opacity = presence.toFixed(3)
  card.style.transform = `translateX(${(slideSide * (1 - presence) * PANEL_SLIDE_PIXELS).toFixed(1)}px)`
  card.style.visibility = presence > 0.002 ? 'visible' : 'hidden'
}
