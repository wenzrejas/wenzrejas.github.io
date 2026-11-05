import type { WeatherType } from '@/store/weatherStore'
import { CYCLE_DURATION, DAY_CYCLE_FRAME_PRIORITY } from '../day-night-cycle/constants'
import type { SparkleField } from './sparkleField'
import type { WeatherParams } from './weatherCycle'

// ── Cloud shadows ─────────────────────────────────────────────────────────────
export const CLOUD_TILE = 620
export const CLOUD_PLANE_SIZE = 2600
export const CLOUD_SCROLL_SPEED = 8
export const CLOUD_MODEL_SHADOW_DARK = 0.5
export const CLOUD_GAIN_PER_COVER = 0.85
export const CLOUD_BIAS_PER_COVER = 0.14
export const CLOUD_PLANE_Y = 0.06
export const CLOUD_PLANE_MAX_OPACITY = 0.5
export const CLOUD_SHADOW_COLOR = '#0a2233'

// ── Cloud texture ─────────────────────────────────────────────────────────────
export const CLOUD_TEXTURE_SIZE = 256
export const CLOUD_TEXTURE_ANISOTROPY = 4
export const CLOUD_NOISE_FREQUENCY = 3
export const CLOUD_NOISE_OCTAVES = 5
export const CLOUD_OCTAVE_FALLOFF = 0.5
export const CLOUD_OCTAVE_GROWTH = 2
export const CLOUD_SHAPE_THRESHOLD = 0.48
export const CLOUD_SHAPE_SOFTNESS = 0.22
export const CLOUD_WARP_STRENGTH = 0.28
export const CLOUD_WARP_U_OFFSET: readonly [number, number] = [0.31, 0.77]
export const CLOUD_WARP_V_OFFSET: readonly [number, number] = [0.83, 0.19]
export const CLOUD_HASH_X = 127.1
export const CLOUD_HASH_Y = 311.7
export const CLOUD_HASH_SCALE = 43758.5453

// ── Weather cycle ─────────────────────────────────────────────────────────────
export const WEATHER_PARAMS: Record<WeatherType, WeatherParams> = {
  sunny: {
    lightMultiplier: 1.3,
    moonMultiplier: 0.5,
    waveAmplitudeMultiplier: 1.0,
    windMultiplier: 0.6,
    rainIntensity: 0.0,
    overcastAmount: 0.0,
    cloudShadow: 0.15,
  },
  cloudy: {
    lightMultiplier: 1.0,
    moonMultiplier: 0.7,
    waveAmplitudeMultiplier: 1.1,
    windMultiplier: 1.0,
    rainIntensity: 0.0,
    overcastAmount: 0.0,
    cloudShadow: 0.52,
  },
  rainy: {
    lightMultiplier: 0.45,
    moonMultiplier: 0.1,
    waveAmplitudeMultiplier: 2.2,
    windMultiplier: 1.6,
    rainIntensity: 1.0,
    overcastAmount: 0.8,
    cloudShadow: 0.9,
  },
  windy: {
    lightMultiplier: 0.85,
    moonMultiplier: 0.8,
    waveAmplitudeMultiplier: 1.7,
    windMultiplier: 2.5,
    rainIntensity: 0.0,
    overcastAmount: 0.2,
    cloudShadow: 0.35,
  },
  moonlit: {
    lightMultiplier: 0.9,
    moonMultiplier: 3.0,
    waveAmplitudeMultiplier: 0.2,
    windMultiplier: 0.2,
    rainIntensity: 0.0,
    overcastAmount: 0.0,
    cloudShadow: 0.1,
  },
}

export const CALM_WEATHER: WeatherParams = {
  lightMultiplier: 1,
  moonMultiplier: 1,
  waveAmplitudeMultiplier: 1,
  windMultiplier: 1,
  rainIntensity: 0,
  overcastAmount: 0,
  cloudShadow: 0,
}

export const TRANSITION = 30
export const STABLE_MIN = CYCLE_DURATION / 2 - TRANSITION
export const CLEAR_SKIES_TRANSITION = 3
export const CLEARED_WEATHER: WeatherType = 'sunny'
export const STARTING_WEATHER: WeatherType = 'sunny'
export const CLOUD_DRIFT_SPEED = 0.006
export const WEATHER_FRAME_PRIORITY = DAY_CYCLE_FRAME_PRIORITY - 1

// ── Lightning ─────────────────────────────────────────────────────────────────
export const LIGHTNING_FIRST_DELAY_MIN = 6
export const LIGHTNING_FIRST_DELAY_MAX = 16
export const LIGHTNING_DELAY_MIN = 5
export const LIGHTNING_DELAY_MAX = 17
export const LIGHTNING_STRIKE_SECONDS = 0.15
export const LIGHTNING_STRIKE_FADE = 8
export const LIGHTNING_ECHO_CHANCE = 0.6
export const LIGHTNING_GAP_SECONDS = 0.08
export const LIGHTNING_ECHO_FLASH = 0.55
export const LIGHTNING_ECHO_SECONDS = 0.12
export const LIGHTNING_ECHO_FADE = 6

// ── Ocean sparkles ────────────────────────────────────────────────────────────
export const SPARKLE_Y = 1.5
export const SPARKLE_VISIBLE_LEVEL = 0.005

// ── Moon sparkles ─────────────────────────────────────────────────────────────
export const MOON_SPARKLES: SparkleField = {
  count: 250,
  spread: 325,
  lifeMin: 1,
  lifeMax: 3.5,
  sizeMin: 8,
  sizeMax: 16,
  armSharpness: 14,
  armFalloff: 1.5,
  glowRadius: 3.5,
}
export const MOON_SPARKLE_COLOR = '#c8f0ff'
export const SPARKLE_MOON_RANGE = 2
export const SPARKLE_NIGHT_START = 0.6

// ── Ocean glitter ─────────────────────────────────────────────────────────────
export const OCEAN_GLITTER: SparkleField = {
  count: 220,
  spread: 325,
  lifeMin: 0.5,
  lifeMax: 1.6,
  sizeMin: 5,
  sizeMax: 10,
  armSharpness: 16,
  armFalloff: 2.5,
  glowRadius: 5,
}
export const GLITTER_DAY_STRENGTH = 0.65
export const GLITTER_NIGHT_STRENGTH = 0.75
export const GLITTER_CLEAR_SHADOW = 0.15
export const GLITTER_GONE_SHADOW = 0.6
export const GLITTER_NIGHT_END = 0.3

// ── Rain ripples ──────────────────────────────────────────────────────────────
export const RAIN_RIPPLE_MAX = 250
export const RAIN_RIPPLE_LIFETIME = 1.8
export const RAIN_RIPPLE_SPAWN_RATE = 80
export const RAIN_RIPPLE_SEGMENTS = 4
export const RAIN_RIPPLE_WHIRLPOOL_EYE_SHARE = 0.05
export const RAIN_RIPPLE_WHIRLPOOL_SWALLOW_SHARE = 0.2
export const RAIN_RIPPLE_MIN_INTENSITY = 0.01
export const RAIN_RIPPLE_VIEW_MARGIN = 1.15
export const RAIN_RIPPLE_BOUNDS_RADIUS = 1e6

// ── Rain ──────────────────────────────────────────────────────────────────────
export const RAIN_DROPS = 600
export const RAIN_VISIBLE_LEVEL = 0.01
export const RAIN_SHOWN_INTENSITY = 0.15
