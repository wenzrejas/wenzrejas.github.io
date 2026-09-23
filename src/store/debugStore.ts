import { create } from 'zustand'
import { DEFAULT_MUSIC } from '../audio/constants'
import type {
  OceanControls,
  ShipControls,
  IslandControls,
  WakeControls,
  BoundaryControls,
  WindLineControls,
  WeatherControls,
  DayCycleControls,
  CameraControls,
  RevealControls,
  WildlifeControls,
  MusicControls,
} from '../components/Debug/types'
import { OCEAN_DEFAULTS } from '../components/World/Ocean/constants'
import {
  MODEL_TARGET_SIZE,
  BASE_Y,
  BOB_AMP,
  BOB_SPEED,
  MOVE_SPEED,
  TURN_SPEED,
  TILT_MAX,
  TILT_SPEED,
  PARTICLE_LIFETIME,
  PARTICLE_SPEED,
  FOAM_WIDTH_TRIM,
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
import {
  BOUNDARY_RADIUS,
  BOUNDARY_FALLOFF,
  BOUNDARY_FOG_COLOR,
} from '../components/World/Boundary/constants'
import type { IslandKey } from '../components/World/Islands/constants'
import { ISLAND_MODEL_DEFAULTS } from '../components/World/Islands/islandSpecs'
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
import {
  SPAWN_DELAY_MAX as BIRD_DELAY_MAX,
  SPAWN_DELAY_MIN as BIRD_DELAY_MIN,
} from '../components/World/Birds/constants'
import {
  SPAWN_DELAY_MAX as FISH_DELAY_MAX,
  SPAWN_DELAY_MIN as FISH_DELAY_MIN,
} from '../components/World/Fish/constants'
import {
  CHECK_INTERVAL as DOLPHIN_INTERVAL,
  SPAWN_CHANCE as DOLPHIN_CHANCE,
} from '../components/World/Dolphins/constants'
import {
  CHECK_INTERVAL as TURTLE_INTERVAL,
  SPAWN_CHANCE as TURTLE_CHANCE,
} from '../components/World/Turtles/constants'
import {
  CHECK_INTERVAL as WHALE_INTERVAL,
  SPAWN_CHANCE as WHALE_CHANCE,
} from '../components/World/Whale/constants'

export interface DebugState {
  ocean: OceanControls
  ship: ShipControls
  islands: Record<IslandKey, IslandControls>
  wake: WakeControls
  windLines: WindLineControls
  boundary: BoundaryControls
  weather: WeatherControls
  dayCycle: DayCycleControls
  camera: CameraControls
  reveal: RevealControls
  wildlife: WildlifeControls
  music: MusicControls
}

export const useDebugStore = create<DebugState>(() => ({
  ocean: { ...OCEAN_DEFAULTS },
  ship: {
    modelSize: MODEL_TARGET_SIZE,
    moveSpeed: MOVE_SPEED,
    turnSpeed: TURN_SPEED,
    baseY: BASE_Y,
    bobAmp: BOB_AMP,
    bobSpeed: BOB_SPEED,
    tiltMax: TILT_MAX,
    tiltSpeed: TILT_SPEED,
    partLife: PARTICLE_LIFETIME,
    partSpeed: PARTICLE_SPEED,
    foamWidth: FOAM_WIDTH_TRIM,
    foamY: FOAM_Y,
  },
  islands: { ...ISLAND_MODEL_DEFAULTS },
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
    timeOfDay: 'auto',
  },
  camera: {
    orbitCamera: false,
    topView: false,
  },
  reveal: {
    previewCard: 'off',
  },
  wildlife: {
    birdDelayMin: BIRD_DELAY_MIN,
    birdDelayMax: BIRD_DELAY_MAX,
    fishDelayMin: FISH_DELAY_MIN,
    fishDelayMax: FISH_DELAY_MAX,
    dolphinChance: DOLPHIN_CHANCE,
    dolphinInterval: DOLPHIN_INTERVAL,
    turtleChance: TURTLE_CHANCE,
    turtleInterval: TURTLE_INTERVAL,
    whaleChance: WHALE_CHANCE,
    whaleInterval: WHALE_INTERVAL,
  },
  music: {
    enabled: true,
    track: DEFAULT_MUSIC,
  },
}))
