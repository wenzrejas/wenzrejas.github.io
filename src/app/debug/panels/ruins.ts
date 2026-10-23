import { useControls, folder } from 'leva'
import { RUIN_PLACEMENTS } from '@/depths/scene/sunken-ruins/constants'
import type { RuinControls } from '../types'

const RUIN_LABELS = ['Crystal arch', 'Armillary', 'Open book', 'Cube stack', 'Planet arc', 'Clock']

const schema = (level: number) => {
  const placement = RUIN_PLACEMENTS[level]
  return {
    scale: { value: placement.scale, min: 1, max: 20, step: 0.1 },
    Position: folder({
      offsetX: { value: placement.offsetX, min: -120, max: 120, step: 0.5, label: 'X' },
      offsetY: { value: placement.offsetY, min: -80, max: 80, step: 0.5, label: 'Y' },
      offsetZ: { value: placement.offsetZ, min: -120, max: 120, step: 0.5, label: 'Z' },
    }),
    Rotation: folder({
      tilt: { value: placement.tilt, min: -45, max: 45, step: 0.5, label: 'tilt°' },
      turn: { value: placement.turn, min: -180, max: 180, step: 1, label: 'turn°' },
      lean: { value: placement.lean, min: -45, max: 45, step: 0.5, label: 'lean°' },
    }),
  }
}

const panel = (level: number) => `Ruins / ${level + 1} ${RUIN_LABELS[level]}`
const PANEL_OPTIONS = { collapsed: true }

export function useRuinControls(): RuinControls[] {
  return [
    useControls(panel(0), schema(0), PANEL_OPTIONS),
    useControls(panel(1), schema(1), PANEL_OPTIONS),
    useControls(panel(2), schema(2), PANEL_OPTIONS),
    useControls(panel(3), schema(3), PANEL_OPTIONS),
    useControls(panel(4), schema(4), PANEL_OPTIONS),
    useControls(panel(5), schema(5), PANEL_OPTIONS),
  ]
}
