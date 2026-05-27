import { create } from 'zustand'
import type {
  OceanControls,
  ShipControls,
  WakeControls,
  BoundaryControls,
  WindLineControls,
  WeatherControls,
  DayCycleControls,
  CameraControls,
} from '../components/Debug/types'
import { OCEAN_DEFAULTS } from '../components/World/Ocean/constants'
import {
  BASE_Y,
  BOB_AMP,
  BOB_SPEED,
  MOVE_SPEED,
  TURN_SPEED,
  TILT_MAX,
  TILT_SPEED,
  PARTICLE_LIFETIME,
  PARTICLE_SPEED,
  FOAM_BOUND,
  FOAM_Y,
  WAKE_ARM_NEAR,
  WAKE_ARM_FAR,
  WAKE_ARM_HALF_WIDTH,
  WAKE_MIN_SAMPLE_DIST,
  RIPPLE_LIFETIME,
  RIPPLE_EXPAND_SPEED,
  RIPPLE_SPAWN_DIST,
  RIPPLE_HALF_SPREAD,
  RIPPLE_DEPTH,
} from '../components/World/Ship/constants'
import { BOUNDARY_RADIUS, BOUNDARY_FALLOFF, BOUNDARY_FOG_COLOR } from '../components/World/Boundary/constants'
import {
  WIND_ENABLED,
  WIND_ANGLE,
  WIND_SPEED,
  LINE_DURATION,
  LINE_LENGTH,
  LINE_Y,
  WAVE_AMPLITUDE,
  LINE_WIDTH,
  SPAWN_INTERVAL,
  WIND_OPACITY,
} from '../components/World/WindLines/constants'

export interface DebugState {
  ocean: OceanControls
  ship: ShipControls
  wake: WakeControls
  windLines: WindLineControls
  boundary: BoundaryControls
  weather: WeatherControls
  dayCycle: DayCycleControls
  camera: CameraControls
}

export const useDebugStore = create<DebugState>(() => ({
  ocean: { ...OCEAN_DEFAULTS },
  ship: {
    moveSpeed: MOVE_SPEED,
    turnSpeed: TURN_SPEED,
    baseY: BASE_Y,
    bobAmp: BOB_AMP,
    bobSpeed: BOB_SPEED,
    tiltMax: TILT_MAX,
    tiltSpeed: TILT_SPEED,
    partLife: PARTICLE_LIFETIME,
    partSpeed: PARTICLE_SPEED,
    foamBound: FOAM_BOUND,
    foamY: FOAM_Y,
  },
  wake: {
    armNear: WAKE_ARM_NEAR,
    armFar: WAKE_ARM_FAR,
    armHalfWidth: WAKE_ARM_HALF_WIDTH,
    minSampleDist: WAKE_MIN_SAMPLE_DIST,
    rippleLifetime: RIPPLE_LIFETIME,
    expandSpeed: RIPPLE_EXPAND_SPEED,
    spawnDist: RIPPLE_SPAWN_DIST,
    halfSpread: RIPPLE_HALF_SPREAD,
    rippleDepth: RIPPLE_DEPTH,
  },
  windLines: {
    windEnabled: WIND_ENABLED,
    windAngle: WIND_ANGLE,
    windSpeed: WIND_SPEED,
    lineDuration: LINE_DURATION,
    lineLength: LINE_LENGTH,
    lineY: LINE_Y,
    waveAmplitude: WAVE_AMPLITUDE,
    lineWidth: LINE_WIDTH,
    spawnInterval: SPAWN_INTERVAL,
    windOpacity: WIND_OPACITY,
  },
  boundary: {
    radius: BOUNDARY_RADIUS,
    falloff: BOUNDARY_FALLOFF,
    fogColor: BOUNDARY_FOG_COLOR,
  },
  weather: {
    weatherEnabled: true,
    weatherType: 'auto',
  },
  dayCycle: {
    cycleSpeed: 1.0,
  },
  camera: {
    orbitCamera: false,
  },
}))
