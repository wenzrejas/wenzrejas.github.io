import { useControls, folder } from 'leva'
import {
  BASE_Y,
  BOB_AMP,
  BOB_SPEED,
  FOAM_WIDTH_TRIM,
  FOAM_Y,
  MODEL_TARGET_SIZE,
  MOVE_SPEED,
  PARTICLE_LIFETIME,
  PARTICLE_SPEED,
  TILT_MAX,
  TILT_SPEED,
  TURN_SPEED,
} from '../../World/Ship/constants'
import type { ShipControls } from '../types'

export function useShipControls() {
  return useControls(
    'Ship',
    {
      Model: folder({
        modelSize: { value: MODEL_TARGET_SIZE, min: 5, max: 150, step: 0.5, label: 'size' },
      }),
      Movement: folder({
        moveSpeed: { value: MOVE_SPEED, min: 0, max: 150, step: 1 },
        turnSpeed: { value: TURN_SPEED, min: 0, max: 3, step: 0.01 },
      }),
      Bob: folder({
        baseY: { value: BASE_Y, min: -20, max: 20, step: 0.1 },
        bobAmp: { value: BOB_AMP, min: 0, max: 5, step: 0.1 },
        bobSpeed: { value: BOB_SPEED, min: 0, max: 5, step: 0.1 },
      }),
      Tilt: folder({
        tiltMax: { value: TILT_MAX, min: 0, max: 0.5, step: 0.01 },
        tiltSpeed: { value: TILT_SPEED, min: 0, max: 20, step: 0.5 },
      }),
      Ripple: folder({
        partLife: { value: PARTICLE_LIFETIME, min: 0.1, max: 5, step: 0.1 },
        partSpeed: { value: PARTICLE_SPEED, min: 0, max: 30, step: 1 },
      }),
      Foam: folder({
        foamWidth: { value: FOAM_WIDTH_TRIM, min: 0.3, max: 2, step: 0.01, label: 'width x hull' },
        foamY: { value: FOAM_Y, min: -3, max: 3, step: 0.05, label: 'Y position' },
      }),
    },
    { collapsed: true }
  ) as ShipControls
}
