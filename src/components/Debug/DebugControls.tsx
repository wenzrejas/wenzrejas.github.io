import { useControls, folder } from 'leva'
import { OCEAN_DEFAULTS } from '../World/Ocean/constants'
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
} from '../World/Ship/constants'
import { BOUNDARY_RADIUS, BOUNDARY_FALLOFF, BOUNDARY_FOG_COLOR } from '../World/Boundary/constants'
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
} from '../World/WindLines/constants'
import type {
  OceanControls,
  ShipControls,
  WakeControls,
  BoundaryControls,
  WindLineControls,
  WeatherControls,
  DayCycleControls,
  CameraControls,
} from './types'
import { useDebugStore } from '../../store/debugStore'

// Syncs Leva panel values into the Zustand debug store each render.
// Components read from useDebugStore instead of a React context.
export function DebugSync() {
  const ocean = useControls(
    'Ocean',
    {
      Wave: folder({
        waveAmp: { value: OCEAN_DEFAULTS.waveAmp, min: 0, max: 15, step: 0.1 },
        waveSpeed: { value: OCEAN_DEFAULTS.waveSpeed, min: 0, max: 5, step: 0.05 },
      }),
      Cell: folder({
        waterScale: { value: OCEAN_DEFAULTS.waterScale, min: 0.01, max: 1, step: 0.01 },
        cellSmoothness: { value: OCEAN_DEFAULTS.cellSmoothness, min: 0, max: 1, step: 0.01 },
        edgeThreshold: { value: OCEAN_DEFAULTS.edgeThreshold, min: 0, max: 0.5, step: 0.005 },
        edgeSoftness: { value: OCEAN_DEFAULTS.edgeSoftness, min: 0, max: 0.3, step: 0.005 },
        cellSpeed: { value: OCEAN_DEFAULTS.cellSpeed, min: 0, max: 3, step: 0.05 },
      }),
      Flow: folder({
        flowX: { value: OCEAN_DEFAULTS.flowX, min: -1, max: 1, step: 0.01 },
        flowZ: { value: OCEAN_DEFAULTS.flowZ, min: -1, max: 1, step: 0.01 },
        noiseScale: { value: OCEAN_DEFAULTS.noiseScale, min: 0.1, max: 5, step: 0.01 },
        noiseFlowSpeed: { value: OCEAN_DEFAULTS.noiseFlowSpeed, min: 0, max: 2, step: 0.01 },
        distortAmount: { value: OCEAN_DEFAULTS.distortAmount, min: 0, max: 1, step: 0.01 },
      }),
      Color: folder({
        deepColor: { value: OCEAN_DEFAULTS.deepColor },
        midColor: { value: OCEAN_DEFAULTS.midColor },
        midPos: { value: OCEAN_DEFAULTS.midPos, min: 0, max: 1, step: 0.01 },
        highlightColor: { value: OCEAN_DEFAULTS.highlightColor },
        opacity: { value: OCEAN_DEFAULTS.opacity, min: 0, max: 1, step: 0.01 },
        deepOpacity: { value: OCEAN_DEFAULTS.deepOpacity, min: 0, max: 1, step: 0.01 },
      }),
      Fresnel: folder({
        fresnelPower: { value: OCEAN_DEFAULTS.fresnelPower, min: 0, max: 10, step: 0.1 },
        fresnelStrength: { value: OCEAN_DEFAULTS.fresnelStrength, min: 0, max: 1, step: 0.01 },
      }),
      foamAmount: { value: OCEAN_DEFAULTS.foamAmount, min: 0, max: 1, step: 0.01 },
      Specular: folder({
        specularStrength: { value: OCEAN_DEFAULTS.specularStrength, min: 0, max: 1, step: 0.01 },
        specularPower: { value: OCEAN_DEFAULTS.specularPower, min: 1, max: 64, step: 0.5 },
      }),
      crestStrength: { value: OCEAN_DEFAULTS.crestStrength, min: 0, max: 1, step: 0.01 },
      Light: folder({
        sunX: { value: OCEAN_DEFAULTS.sunX, min: -20, max: 20, step: 0.5, label: 'sun X' },
        sunY: { value: OCEAN_DEFAULTS.sunY, min: 0, max: 20, step: 0.5, label: 'sun Y' },
        sunZ: { value: OCEAN_DEFAULTS.sunZ, min: -20, max: 20, step: 0.5, label: 'sun Z' },
      }),
    },
    { collapsed: true }
  ) as OceanControls

  const ship = useControls(
    'Ship',
    {
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
        foamBound: { value: FOAM_BOUND, min: 0.01, max: 0.5, step: 0.005, label: 'bound' },
        foamY: { value: FOAM_Y, min: -3, max: 3, step: 0.05, label: 'Y position' },
      }),
    },
    { collapsed: true }
  ) as ShipControls

  const wake = useControls(
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

  const boundary = useControls(
    'Boundary',
    {
      radius: { value: BOUNDARY_RADIUS, min: 50, max: 1500, step: 10 },
      falloff: { value: BOUNDARY_FALLOFF, min: 20, max: 500, step: 10, label: 'falloff' },
      fogColor: { value: BOUNDARY_FOG_COLOR, label: 'fog color' },
    },
    { collapsed: true }
  ) as BoundaryControls

  const windLines = useControls(
    'Wind Lines',
    {
      windEnabled: { value: WIND_ENABLED, label: 'enabled' },
      windAngle: { value: WIND_ANGLE, min: 0, max: 360, step: 1, label: 'angle (deg)' },
      windSpeed: { value: WIND_SPEED, min: 0, max: 60, step: 0.5, label: 'speed' },
      lineDuration: { value: LINE_DURATION, min: 0.5, max: 10, step: 0.1, label: 'duration' },
      lineLength: { value: LINE_LENGTH, min: 10, max: 300, step: 1, label: 'length' },
      lineY: { value: LINE_Y, min: 0, max: 150, step: 1, label: 'height' },
      waveAmplitude: { value: WAVE_AMPLITUDE, min: 0, max: 20, step: 0.1, label: 'wave amplitude' },
      lineWidth: { value: LINE_WIDTH, min: 0.1, max: 10, step: 0.1, label: 'ribbon width' },
      spawnInterval: {
        value: SPAWN_INTERVAL,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: 'spawn interval',
      },
      windOpacity: { value: WIND_OPACITY, min: 0, max: 1, step: 0.01, label: 'opacity' },
    },
    { collapsed: true }
  ) as WindLineControls

  const weather = useControls(
    'Weather',
    {
      weatherEnabled: { value: true, label: 'enabled' },
      weatherType: {
        value: 'auto',
        options: ['auto', 'sunny', 'cloudy', 'rainy', 'windy', 'moonlit'],
        label: 'type',
      },
    },
    { collapsed: true }
  ) as WeatherControls

  const dayCycle = useControls(
    'Day / Night',
    {
      cycleSpeed: { value: 1.0, min: 0, max: 10, step: 0.1, label: 'speed (0 = pause)' },
    },
    { collapsed: true }
  ) as DayCycleControls

  const camera = useControls(
    'Camera',
    {
      orbitCamera: { value: false, label: 'orbit (free look)' },
    },
    { collapsed: true }
  ) as CameraControls

  useDebugStore.setState({ ocean, ship, wake, windLines, boundary, weather, dayCycle, camera })

  return null
}
