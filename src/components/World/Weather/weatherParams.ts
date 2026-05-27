import type { WeatherType } from '../../../store/weatherStore'
import { CYCLE_DURATION } from '../DayNightCycle/DayNightCycle'

export interface WeatherParams {
  lightMult: number
  moonMult: number
  waveAmpMult: number
  windMult: number
  rainIntensity: number
  overcastAmount: number
  cloudShadow: number
}

export const PARAMS: Record<WeatherType, WeatherParams> = {
  //                  light  moon  wave  wind  rain  overcast  cloudShadow
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

export const WEATHERS = Object.keys(PARAMS) as WeatherType[]

export const TRANSITION = 30
export const STABLE_MIN = CYCLE_DURATION / 2 - TRANSITION

export function pickOther(current: WeatherType): WeatherType {
  const others = WEATHERS.filter((w) => w !== current)
  return others[Math.floor(Math.random() * others.length)]
}

export function lerpParam(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
