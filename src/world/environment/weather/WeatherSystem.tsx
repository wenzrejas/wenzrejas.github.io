import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { CALM_WEATHER, WEATHER_FRAME_PRIORITY, WEATHER_PARAMS } from './constants'
import { advanceLightning, createLightning } from './lightning'
import {
  advanceWeatherCycle,
  applyWeather,
  blendWeather,
  createWeatherCycle,
  driftClouds,
} from './weatherCycle'
import OceanSparkles from './OceanSparkles'
import Rain from './Rain'
import RainRipples from './RainRipples'

interface WeatherSystemProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function WeatherSystem({ shipRef }: WeatherSystemProps) {
  const cycle = useRef(createWeatherCycle())
  const lightning = useRef(createLightning())

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const { weatherEnabled, weatherType } = useDebugStore.getState().weather
    const weather = useWeatherStore.getState()
    const wantsClearSkies = weather.wantsClearSkies
    weather.wantsClearSkies = false

    if (!weatherEnabled) applyWeather(weather, 'sunny', CALM_WEATHER)
    else if (weatherType !== 'auto') applyWeather(weather, weatherType, WEATHER_PARAMS[weatherType])
    else {
      advanceWeatherCycle(cycle.current, dt, wantsClearSkies)
      blendWeather(weather, cycle.current)
    }

    driftClouds(weather, useWindStore.getState().dir, dt)
    advanceLightning(lightning.current, weather, dt)
  }, WEATHER_FRAME_PRIORITY)

  return (
    <>
      <Rain shipRef={shipRef} />
      <RainRipples shipRef={shipRef} />
      <OceanSparkles shipRef={shipRef} />
    </>
  )
}
