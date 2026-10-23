import * as THREE from 'three'
import { useDepthsStore } from '@/store/depthsStore'
import { isDepthsInView } from '@/store/viewStore'
import { wakeShare } from '../ruin-life/shared/ruinWake'
import { levelDepth, levelSpot, type Timeline } from '../timeline/timeline'
import {
  PANEL_ACROSS,
  PANEL_DEPTH_Z,
  PANEL_FADE_RATE,
  PANEL_LIFT,
  PANEL_SLIDE_PIXELS,
} from './constants'

export interface PanelReveal {
  presence: number
}

const _ruinSpot = new THREE.Vector3()

export const panelSide = (level: number) => -Math.sign(levelSpot(level, _ruinSpot).x)

export const panelSpot = (level: number): [number, number, number] => [
  panelSide(level) * PANEL_ACROSS,
  levelDepth(level) + PANEL_LIFT,
  PANEL_DEPTH_Z,
]

const isPanelShown = () => isDepthsInView() && useDepthsStore.getState().isRevealed

export function stepPanelReveal(
  reveal: PanelReveal,
  timeline: Timeline,
  level: number,
  dt: number
) {
  const target = isPanelShown() ? wakeShare(timeline, level) : 0
  reveal.presence = THREE.MathUtils.damp(reveal.presence, target, PANEL_FADE_RATE, dt)
}

export function showPanel(card: HTMLElement, side: number, presence: number) {
  card.style.opacity = presence.toFixed(3)
  card.style.transform = `translateX(${(side * (1 - presence) * PANEL_SLIDE_PIXELS).toFixed(1)}px)`
  card.style.visibility = presence > 0.002 ? 'visible' : 'hidden'
}
