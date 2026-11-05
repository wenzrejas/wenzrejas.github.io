import type { RuinPlacement } from '@/depths/scene/sunken-ruins/ruinLayout'
import type { PhaseName } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import type { IslandKey } from '@/world/islands/shared/constants'
import type { IslandModelTuning } from '@/world/islands/shared/islandSpec'
import type { WeatherType } from '@/store/weatherStore'
import type { MusicTrack } from '@/audio/sounds'

export interface OceanControls {
  waveAmplitude: number
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
  midPosition: number
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
  brightness: number
  moveSpeed: number
  turnSpeed: number
  baseY: number
  bobAmplitude: number
  bobSpeed: number
  tiltMax: number
  tiltSpeed: number
  particleLife: number
  particleSpeed: number
  foamReach: number
  foamY: number
}

export type IslandControls = IslandModelTuning

export type RuinControls = RuinPlacement

export interface WakeControls {
  armNear: number
  armFar: number
  armHalfWidth: number
  minSampleDistance: number
  rippleLifetime: number
  expandSpeed: number
  spawnDistance: number
  halfSpread: number
  rippleDepth: number
}

export interface BoundaryControls {
  radius: number
  falloff: number
  bankHeight: number
}

export interface WindLineControls {
  windEnabled: boolean
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
  timeOfDay: 'auto' | PhaseName
}

export interface CameraControls {
  orbitCamera: boolean
  topView: boolean
}

export interface WildlifeControls {
  birdDelayMin: number
  birdDelayMax: number
  fishDelayMin: number
  fishDelayMax: number
  dolphinChance: number
  dolphinInterval: number
  turtleChance: number
  turtleInterval: number
  whaleChance: number
  whaleInterval: number
  algaeChance: number
  algaeInterval: number
  algaeAnyTime: boolean
}

export interface MusicControls {
  enabled: boolean
  track: MusicTrack
}

export interface RevealControls {
  previewCard: 'off' | IslandKey
}
