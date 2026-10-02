import * as THREE from 'three'
import { eventDelta } from '@/store/cinematicStore'
import type { WeatherState, WeatherType } from '@/store/weatherStore'
import { mix } from '@/utils/math'
import {
  CLEAR_SKIES_TRANSITION,
  CLEARED_WEATHER,
  CLOUD_DRIFT_SPEED,
  STABLE_MIN,
  STARTING_WEATHER,
  TRANSITION,
  WEATHER_PARAMS,
} from './constants'

export interface WeatherParams {
  lightMult: number
  moonMult: number
  waveAmpMult: number
  windMult: number
  rainIntensity: number
  overcastAmount: number
  cloudShadow: number
}

export interface WeatherCycle {
  current: WeatherType
  next: WeatherType
  transition: number
  isBlending: boolean
  isClearing: boolean
  stableTimer: number
}

const WEATHERS = Object.keys(WEATHER_PARAMS) as WeatherType[]

export const isClearSky = (type: WeatherType) => type === 'sunny' || type === 'moonlit'

export function pickOther(current: WeatherType): WeatherType {
  const others = WEATHERS.filter((weather) => weather !== current)
  return others[Math.floor(Math.random() * others.length)]
}

export const createWeatherCycle = (): WeatherCycle => ({
  current: STARTING_WEATHER,
  next: pickOther(STARTING_WEATHER),
  transition: 0,
  isBlending: false,
  isClearing: false,
  stableTimer: STABLE_MIN,
})

function steerToClearSkies(cycle: WeatherCycle) {
  if (!cycle.isBlending) {
    if (isClearSky(cycle.current)) return
    cycle.next = CLEARED_WEATHER
    cycle.transition = 0
    cycle.isBlending = true
  } else if (isClearSky(cycle.current) && !isClearSky(cycle.next)) {
    const clearType = cycle.current
    cycle.current = cycle.next
    cycle.next = clearType
    cycle.transition = 1 - cycle.transition
  } else if (!isClearSky(cycle.next)) {
    cycle.next = CLEARED_WEATHER
  }
  cycle.isClearing = true
}

export function advanceWeatherCycle(cycle: WeatherCycle, dt: number, wantsClearSkies: boolean) {
  if (wantsClearSkies) steerToClearSkies(cycle)

  if (!cycle.isBlending) {
    cycle.stableTimer -= eventDelta(dt)
    if (cycle.stableTimer <= 0) {
      cycle.next = pickOther(cycle.current)
      cycle.isBlending = true
      cycle.transition = 0
    }
    return
  }

  const transitionSeconds = cycle.isClearing ? CLEAR_SKIES_TRANSITION : TRANSITION
  cycle.transition = Math.min(1, cycle.transition + dt / transitionSeconds)
  if (cycle.transition >= 1) {
    cycle.current = cycle.next
    cycle.isBlending = false
    cycle.isClearing = false
    cycle.stableTimer = STABLE_MIN
  }
}

export function applyWeather(weather: WeatherState, type: WeatherType, params: WeatherParams) {
  weather.type = type
  weather.lightMult = params.lightMult
  weather.moonMult = params.moonMult
  weather.waveAmpMult = params.waveAmpMult
  weather.windMult = params.windMult
  weather.rainIntensity = params.rainIntensity
  weather.overcastAmount = params.overcastAmount
  weather.cloudShadow = params.cloudShadow
}

export function blendWeather(weather: WeatherState, cycle: WeatherCycle) {
  const progress = cycle.isBlending ? cycle.transition : 0
  const eased = THREE.MathUtils.smoothstep(progress, 0, 1)
  const from = WEATHER_PARAMS[cycle.current]
  const to = WEATHER_PARAMS[cycle.next]

  weather.type = progress > 0.5 ? cycle.next : cycle.current
  weather.lightMult = mix(from.lightMult, to.lightMult, eased)
  weather.moonMult = mix(from.moonMult, to.moonMult, eased)
  weather.waveAmpMult = mix(from.waveAmpMult, to.waveAmpMult, eased)
  weather.windMult = mix(from.windMult, to.windMult, eased)
  weather.rainIntensity = mix(from.rainIntensity, to.rainIntensity, eased)
  weather.overcastAmount = mix(from.overcastAmount, to.overcastAmount, eased)
  weather.cloudShadow = mix(from.cloudShadow, to.cloudShadow, eased)
}

export function driftClouds(weather: WeatherState, windDirection: THREE.Vector2, dt: number) {
  const drift = CLOUD_DRIFT_SPEED * weather.windMult * dt
  weather.cloudOffset.x += windDirection.x * drift
  weather.cloudOffset.y += windDirection.y * drift
}
