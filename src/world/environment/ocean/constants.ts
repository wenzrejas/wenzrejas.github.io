export const OCEAN_PLANE_SIZE = 2600
export const OCEAN_SEGMENTS = 128
export const OCEAN_Y = -0.1
export const OCEAN_FUNNEL_OVERSHOOT = 1.3
export const OCEAN_WHIRLPOOL_CALM_REACH = 1.5
export const OCEAN_WAVE_REACH = 12
export const OCEAN_GRID_FRAME_PRIORITY = 0.5

// ── Shore calm ────────────────────────────────────────────────────────────────
export const SHORE_CALM_START = 14
export const SHORE_CALM_BAND = 46
export const SHORE_CALM_MAP_RESOLUTION = 512

// ── Surface ───────────────────────────────────────────────────────────────────
export const RAIN_DARKEN = 0.22

// ── Light noise ───────────────────────────────────────────────────────────────
export const LIGHT_NOISE_MEAN = 0.375
export const LIGHT_NOISE_SPREAD = 0.559

// ── Wind swell ────────────────────────────────────────────────────────────────
export const PRIMARY_WAVE_X = 0.97
export const PRIMARY_WAVE_Z = -0.26
export const WIND_SWELL_CALM = 0.5
export const WIND_SWELL_ALIGNED_GAIN = 0.8
export const WIND_SWELL_RATE = 0.05

export const OCEAN_DEFAULTS = {
  waterScale: 0.08,
  cellSmoothness: 0.18,
  edgeThreshold: 0.075,
  edgeSoftness: 0.065,
  flowX: -0.23,
  flowZ: 0.06,
  cellSpeed: 0.55,
  noiseScale: 1.32,
  noiseFlowSpeed: 0.25,
  distortAmount: 0.3,
  deepColor: '#27a3d8',
  midColor: '#59c0e8',
  midPosition: 0.31,
  highlightColor: '#ffffff',
  opacity: 1,
  deepOpacity: 0.85,
  waveAmplitude: 2.5,
  waveSpeed: 1,
  fresnelPower: 3.5,
  fresnelStrength: 0.45,
  foamAmount: 0.2,
  specularStrength: 0.45,
  specularPower: 5.0,
  crestStrength: 0.15,
  sunX: 2.5,
  sunY: 3.5,
  sunZ: 0,
}
