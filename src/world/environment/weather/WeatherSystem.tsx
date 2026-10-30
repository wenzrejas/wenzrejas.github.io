import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import {
  CALM_WEATHER,
  MOON_SPARKLES,
  SUN_SPARKLES,
  WEATHER_FRAME_PRIORITY,
  WEATHER_PARAMS,
} from './constants'
import { advanceLightning, createLightning } from './lightning'
import {
  advanceWeatherCycle,
  applyWeather,
  blendWeather,
  createWeatherCycle,
  driftClouds,
} from './weatherCycle'
import OceanSparkles from './OceanSparkles'
import { moonSparkleIntensity, sunSparkleIntensity } from './sparkleField'
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
    const { weatherEnabled, weatherType: debugWeather } = useDebugStore.getState().weather
    const weatherType = debugWeather === 'auto' ? useSettingsStore.getState().weather : debugWeather
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
      <OceanSparkles shipRef={shipRef} field={MOON_SPARKLES} intensityOf={moonSparkleIntensity} />
      <OceanSparkles shipRef={shipRef} field={SUN_SPARKLES} intensityOf={sunSparkleIntensity} />
    </>
  )
}
