import type * as THREE from 'three'
import { WEATHER_COPY } from '@/data/hudCopy'
import { useCycleStore } from '@/store/cycleStore'
import { useWeatherStore, type WeatherType } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { isClearSky } from '@/world/environment/weather/weatherCycle'
import { bearingDegrees, nearestPointIndex } from '../north'
import { DAY_END_TIME, DAY_START_TIME } from './constants'

const isDaytime = (timeOfDay: number) => timeOfDay >= DAY_START_TIME && timeOfDay < DAY_END_TIME

export function shownWeather(type: WeatherType, timeOfDay: number): WeatherType {
  if (!isClearSky(type)) return type
  return isDaytime(timeOfDay) ? 'sunny' : 'moonlit'
}

function windOriginBearing(direction: THREE.Vector2): number {
  const downwindBearing = bearingDegrees(Math.atan2(direction.x, direction.y))
  return (downwindBearing + 180) % 360
}

export const windOriginName = (direction: THREE.Vector2) =>
  WEATHER_COPY.windDirections[nearestPointIndex(windOriginBearing(direction))]

export const readWeather = () =>
  shownWeather(useWeatherStore.getState().type, useCycleStore.getState().timeOfDay)

export const readWindPoint = () => windOriginName(useWindStore.getState().dir)
