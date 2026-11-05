import { useControls } from 'leva'
import {
  BOUNDARY_BANK_HEIGHT,
  BOUNDARY_FALLOFF,
  BOUNDARY_RADIUS,
} from '@/world/environment/boundary/constants'
import type { BoundaryControls } from '../types'

export function useBoundaryControls() {
  return useControls(
    'Boundary',
    {
      radius: { value: BOUNDARY_RADIUS, min: 50, max: 1500, step: 10 },
      falloff: { value: BOUNDARY_FALLOFF, min: 20, max: 500, step: 10, label: 'falloff' },
      bankHeight: { value: BOUNDARY_BANK_HEIGHT, min: 0, max: 80, step: 1, label: 'bank height' },
    },
    { collapsed: true }
  ) as BoundaryControls
}
