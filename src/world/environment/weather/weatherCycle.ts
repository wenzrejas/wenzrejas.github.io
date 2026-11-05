import * as THREE from 'three'
import { eventDelta } from '@/store/cinematicStore'
import { isNightEventOn, spoilsNightEvent } from '@/store/nightEventStore'
import type { WeatherState, WeatherType } from '@/store/weatherStore'
import { mix } from '@/utils/math'
import {
  CLEAR_SKIES_TRANSITION,
  CLEARED_WEATHER,
  CLOUD_DRIFT_SPEED,
  RAIN_SHOWN_INTENSITY,
  STABLE_MIN,
  STARTING_WEATHER,
  TRANSITION,
  WEATHER_PARAMS,
} from './constants'

export interface WeatherParams {
  lightMultiplier: number
  moonMultiplier: number
  waveAmplitudeMultiplier: number
  windMultiplier: number
  rainIntensity: number
  overcastAmount: number
  cloudShadow: number
}

interface WeatherCycle {
  current: WeatherType
  next: WeatherType
  transition: number
  isBlending: boolean
  isClearing: boolean
  stableTimer: number
}

const WEATHERS = Object.keys(WEATHER_PARAMS) as WeatherType[]

export const isClearSky = (type: WeatherType) => type === 'sunny' || type === 'moonlit'

function pickOther(current: WeatherType): WeatherType {
  const others = WEATHERS.filter(
    (weather) => weather !== current && !(isNightEventOn() && spoilsNightEvent(weather))
  )
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

export function applyWeather(
  weather: WeatherState,
  type: WeatherType,
  weatherParams: WeatherParams
) {
  weather.type = type
  weather.comingType = type
  weather.lightMultiplier = weatherParams.lightMultiplier
  weather.moonMultiplier = weatherParams.moonMultiplier
  weather.waveAmplitudeMultiplier = weatherParams.waveAmplitudeMultiplier
  weather.windMultiplier = weatherParams.windMultiplier
  weather.rainIntensity = weatherParams.rainIntensity
  weather.overcastAmount = weatherParams.overcastAmount
  weather.cloudShadow = weatherParams.cloudShadow
}

export function blendWeather(weather: WeatherState, cycle: WeatherCycle) {
  const progress = cycle.isBlending ? cycle.transition : 0
  const eased = THREE.MathUtils.smoothstep(progress, 0, 1)
  const from = WEATHER_PARAMS[cycle.current]
  const to = WEATHER_PARAMS[cycle.next]

  weather.lightMultiplier = mix(from.lightMultiplier, to.lightMultiplier, eased)
  weather.moonMultiplier = mix(from.moonMultiplier, to.moonMultiplier, eased)
  weather.waveAmplitudeMultiplier = mix(
    from.waveAmplitudeMultiplier,
    to.waveAmplitudeMultiplier,
    eased
  )
  weather.windMultiplier = mix(from.windMultiplier, to.windMultiplier, eased)
  weather.rainIntensity = mix(from.rainIntensity, to.rainIntensity, eased)
  const dominant = progress > 0.5 ? cycle.next : cycle.current
  weather.type = weather.rainIntensity >= RAIN_SHOWN_INTENSITY ? 'rainy' : dominant
  weather.comingType = cycle.isBlending ? cycle.next : cycle.current
  weather.overcastAmount = mix(from.overcastAmount, to.overcastAmount, eased)
  weather.cloudShadow = mix(from.cloudShadow, to.cloudShadow, eased)
}

export function driftClouds(weather: WeatherState, windDirection: THREE.Vector2, dt: number) {
  const drift = CLOUD_DRIFT_SPEED * weather.windMultiplier * dt
  weather.cloudOffset.x += windDirection.x * drift
  weather.cloudOffset.y += windDirection.y * drift
}
