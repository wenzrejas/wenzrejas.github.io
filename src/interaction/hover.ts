import { usePanelStore, type PanelKey } from '../store/panelStore'
import { MAX_FRAME_SECONDS } from '../utils/time'
import { HOVER_EASE_RATE, HOVER_SNAP_GAP } from './constants'

export function easeHover(hoverable: { hoverBlend: number }, isHovered: boolean, delta: number) {
  const target = isHovered ? 1 : 0
  const step = Math.min(1, HOVER_EASE_RATE * Math.min(delta, MAX_FRAME_SECONDS))
  const eased = hoverable.hoverBlend + (target - hoverable.hoverBlend) * step
  hoverable.hoverBlend = Math.abs(target - eased) < HOVER_SNAP_GAP ? target : eased
}

export function setHovered(hoverable: { isHovered: boolean }, isHovered: boolean) {
  hoverable.isHovered = isHovered
}

export const isEngaged = (isHovered: boolean, panel: PanelKey) =>
  isHovered || usePanelStore.getState().activePanel === panel
