import { create } from 'zustand'

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'moonlit'

interface WeatherState {
  type: WeatherType
  lightMult: number
  moonMult: number
  waveAmpMult: number
  windMult: number
  rainIntensity: number
  overcastAmount: number
  cloudShadow: number
  lightningFlash: number
}

export const useWeatherStore = create<WeatherState>(() => ({
  type: 'sunny',
  lightMult: 1.0,
  moonMult: 1.0,
  waveAmpMult: 1.0,
  windMult: 1.0,
  rainIntensity: 0.0,
  overcastAmount: 0.0,
  cloudShadow: 0.0,
  lightningFlash: 0.0,
}))
