import { useControls, folder } from 'leva'
import {
  RIPPLE_DEPTH,
  RIPPLE_EXPAND_SPEED,
  RIPPLE_HALF_SPREAD,
  RIPPLE_LIFETIME,
  RIPPLE_SPAWN_DIST,
  WAKE_ARM_FAR,
  WAKE_ARM_HALF_WIDTH,
  WAKE_ARM_NEAR,
  WAKE_MIN_SAMPLE_DIST,
} from '../../World/Ship/constants'
import type { WakeControls } from '../types'

export function useWakeControls() {
  return useControls(
    'Wake',
    {
      Trail: folder({
        armNear: { value: WAKE_ARM_NEAR, min: 0, max: 30, step: 0.1, label: 'arm near' },
        armFar: { value: WAKE_ARM_FAR, min: 0, max: 60, step: 0.5, label: 'arm far' },
        armHalfWidth: {
          value: WAKE_ARM_HALF_WIDTH,
          min: 0,
          max: 10,
          step: 0.1,
          label: 'arm width',
        },
        minSampleDist: {
          value: WAKE_MIN_SAMPLE_DIST,
          min: 0.1,
          max: 5,
          step: 0.1,
          label: 'sample dist',
        },
      }),
      Ripples: folder({
        rippleLifetime: { value: RIPPLE_LIFETIME, min: 0.1, max: 5, step: 0.1, label: 'lifetime' },
        expandSpeed: {
          value: RIPPLE_EXPAND_SPEED,
          min: 0,
          max: 40,
          step: 0.5,
          label: 'expand speed',
        },
        spawnDist: { value: RIPPLE_SPAWN_DIST, min: 1, max: 30, step: 0.5, label: 'spawn dist' },
        halfSpread: { value: RIPPLE_HALF_SPREAD, min: 0, max: 20, step: 0.1, label: 'half spread' },
        rippleDepth: { value: RIPPLE_DEPTH, min: 0, max: 20, step: 0.1, label: 'depth' },
      }),
    },
    { collapsed: true }
  ) as WakeControls
}
