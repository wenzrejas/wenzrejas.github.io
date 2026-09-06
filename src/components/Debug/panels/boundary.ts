import { useControls } from 'leva'
import {
  BOUNDARY_FALLOFF,
  BOUNDARY_FOG_COLOR,
  BOUNDARY_RADIUS,
} from '../../World/Boundary/constants'
import type { BoundaryControls } from '../types'

export function useBoundaryControls() {
  return useControls(
    'Boundary',
    {
      radius: { value: BOUNDARY_RADIUS, min: 50, max: 1500, step: 10 },
      falloff: { value: BOUNDARY_FALLOFF, min: 20, max: 500, step: 10, label: 'falloff' },
      fogColor: { value: BOUNDARY_FOG_COLOR, label: 'fog color' },
    },
    { collapsed: true }
  ) as BoundaryControls
}
