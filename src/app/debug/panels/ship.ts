import { useControls, folder } from 'leva'
import {
  BASE_Y,
  BOB_AMP,
  BOB_SPEED,
  FOAM_REACH,
  FOAM_Y,
  MODEL_BRIGHTNESS,
  MODEL_TARGET_SIZE,
  MOVE_SPEED,
  PARTICLE_LIFETIME,
  PARTICLE_SPEED,
  TILT_MAX,
  TILT_SPEED,
  TURN_SPEED,
} from '@/world/ship/constants'
import type { ShipControls } from '../types'

export function useShipControls() {
  return useControls(
    'Ship',
    {
      Model: folder({
        modelSize: { value: MODEL_TARGET_SIZE, min: 5, max: 150, step: 0.5, label: 'size' },
        brightness: { value: MODEL_BRIGHTNESS, min: 0.2, max: 1.5, step: 0.01 },
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
        foamReach: { value: FOAM_REACH, min: 0.5, max: 5, step: 0.1, label: 'reach' },
        foamY: { value: FOAM_Y, min: -3, max: 3, step: 0.05, label: 'Y position' },
      }),
    },
    { collapsed: true }
  ) as ShipControls
}
