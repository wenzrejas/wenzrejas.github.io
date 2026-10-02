import type { WeatherType } from '@/store/weatherStore'
import { CYCLE_DURATION, DAY_CYCLE_FRAME_PRIORITY } from '../day-night-cycle/constants'
import type { WeatherParams } from './weatherCycle'

// ── Weather cycle ─────────────────────────────────────────────────────────────
export const WEATHER_PARAMS: Record<WeatherType, WeatherParams> = {
  sunny: {
    lightMult: 1.3,
    moonMult: 0.5,
    waveAmpMult: 1.0,
    windMult: 0.6,
    rainIntensity: 0.0,
    overcastAmount: 0.0,
    cloudShadow: 0.15,
  },
  cloudy: {
    lightMult: 1.0,
    moonMult: 0.7,
    waveAmpMult: 1.1,
    windMult: 1.0,
    rainIntensity: 0.0,
    overcastAmount: 0.0,
    cloudShadow: 0.52,
  },
  rainy: {
    lightMult: 0.45,
    moonMult: 0.1,
    waveAmpMult: 2.2,
    windMult: 1.6,
    rainIntensity: 1.0,
    overcastAmount: 0.8,
    cloudShadow: 0.9,
  },
  windy: {
    lightMult: 0.85,
    moonMult: 0.8,
    waveAmpMult: 1.7,
    windMult: 2.5,
    rainIntensity: 0.0,
    overcastAmount: 0.2,
    cloudShadow: 0.35,
  },
  moonlit: {
    lightMult: 0.9,
    moonMult: 3.0,
    waveAmpMult: 0.2,
    windMult: 0.2,
    rainIntensity: 0.0,
    overcastAmount: 0.0,
    cloudShadow: 0.1,
  },
}

export const CALM_WEATHER: WeatherParams = {
  lightMult: 1,
  moonMult: 1,
  waveAmpMult: 1,
  windMult: 1,
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

// ── Moon sparkles ─────────────────────────────────────────────────────────────
export const SPARKLE_COUNT = 250
export const SPARKLE_SPREAD = 325
export const SPARKLE_Y = 1.5
export const SPARKLE_LIFE_MIN = 1
export const SPARKLE_LIFE_MAX = 3.5
export const SPARKLE_SIZE_MIN = 8
export const SPARKLE_SIZE_MAX = 16
export const SPARKLE_COLOR = '#c8f0ff'
export const SPARKLE_ARM_SHARPNESS = 14
export const SPARKLE_ARM_FALLOFF = 1.5
export const SPARKLE_GLOW_RADIUS = 3.5
export const SPARKLE_MOON_RANGE = 2
export const SPARKLE_NIGHT_START = 0.6
export const SPARKLE_VISIBLE_LEVEL = 0.005

// ── Rain ──────────────────────────────────────────────────────────────────────
export const RAIN_DROPS = 600
export const RAIN_VISIBLE_LEVEL = 0.01
