import type { WeatherType } from '../../store/weatherStore'

export interface OceanControls {
  waveAmp: number
  waveSpeed: number
  waterScale: number
  cellSmoothness: number
  edgeThreshold: number
  edgeSoftness: number
  cellSpeed: number
  flowX: number
  flowZ: number
  noiseScale: number
  noiseFlowSpeed: number
  distortAmount: number
  deepColor: string
  midColor: string
  midPos: number
  highlightColor: string
  opacity: number
  deepOpacity: number
  fresnelPower: number
  fresnelStrength: number
  foamAmount: number
  specularStrength: number
  specularPower: number
  crestStrength: number
  sunX: number
  sunY: number
  sunZ: number
}

export interface ShipControls {
  modelSize: number
  moveSpeed: number
  turnSpeed: number
  baseY: number
  bobAmp: number
  bobSpeed: number
  tiltMax: number
  tiltSpeed: number
  partLife: number
  partSpeed: number
  foamWidth: number
  foamY: number
}

export interface IslandControls {
  scale: number
  rotation: number
  offsetX: number
  offsetY: number
  offsetZ: number
  brightness: number
}

export interface WakeControls {
  armNear: number
  armFar: number
  armHalfWidth: number
  minSampleDist: number
  rippleLifetime: number
  expandSpeed: number
  spawnDist: number
  halfSpread: number
  rippleDepth: number
}

export interface BoundaryControls {
  radius: number
  fogColor: string
  falloff: number
}

export interface WindLineControls {
  windEnabled: boolean
  windAngle: number
  windSpeed: number
  lineDuration: number
  lineLength: number
  lineY: number
  waveAmplitude: number
  lineWidth: number
  spawnInterval: number
  windOpacity: number
}

export interface WeatherControls {
  weatherEnabled: boolean
  weatherType: 'auto' | WeatherType
}

export interface DayCycleControls {
  cycleSpeed: number
}

export interface CameraControls {
  orbitCamera: boolean
}
