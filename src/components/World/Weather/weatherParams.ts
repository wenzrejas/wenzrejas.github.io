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
  //                  light  moon  wave   wind  rain  overcast  cloudShadow
  sunny:   { lightMult: 1.30, moonMult: 0.5,  waveAmpMult: 0.70, windMult: 0.6,  rainIntensity: 0.0, overcastAmount: 0.00, cloudShadow: 0.15 },
  cloudy:  { lightMult: 1.00, moonMult: 0.7,  waveAmpMult: 1.10, windMult: 1.0,  rainIntensity: 0.0, overcastAmount: 0.00, cloudShadow: 0.52 },
  rainy:   { lightMult: 0.45, moonMult: 0.1,  waveAmpMult: 2.50, windMult: 1.6,  rainIntensity: 1.0, overcastAmount: 0.80, cloudShadow: 0.90 },
  windy:   { lightMult: 0.85, moonMult: 0.8,  waveAmpMult: 1.60, windMult: 2.5,  rainIntensity: 0.0, overcastAmount: 0.20, cloudShadow: 0.35 },
  moonlit: { lightMult: 0.70, moonMult: 2.50, waveAmpMult: 0.15, windMult: 0.2,  rainIntensity: 0.0, overcastAmount: 0.00, cloudShadow: 0.10 },
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
