import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import {
  PRIMARY_WAVE_X,
  PRIMARY_WAVE_Z,
  RAIN_DARKEN,
  WIND_SWELL_ALIGNED_GAIN,
  WIND_SWELL_CALM,
  WIND_SWELL_RATE,
} from './constants'

const PRIMARY_WAVE_DIRECTION = new THREE.Vector2(PRIMARY_WAVE_X, PRIMARY_WAVE_Z).normalize()

export function paintOcean(uniforms: Record<string, THREE.IUniform>, time: number) {
  const ocean = useDebugStore.getState().ocean
  const cycle = useCycleStore.getState()
  const weather = useWeatherStore.getState()
  const rainDarken = 1 - weather.rainIntensity * RAIN_DARKEN

  uniforms.uTime.value = time
  uniforms.uWaveAmplitude.value = ocean.waveAmplitude
  uniforms.uWaveSpeed.value = ocean.waveSpeed
  uniforms.uScale.value = ocean.waterScale
  uniforms.uSmoothness.value = ocean.cellSmoothness
  uniforms.uEdgeThreshold.value = ocean.edgeThreshold
  uniforms.uEdgeSoftness.value = ocean.edgeSoftness
  uniforms.uFlowX.value = ocean.flowX
  uniforms.uFlowZ.value = ocean.flowZ
  uniforms.uCellSpeed.value = ocean.cellSpeed
  uniforms.uNoiseScale.value = ocean.noiseScale
  uniforms.uNoiseFlowSpeed.value = ocean.noiseFlowSpeed
  uniforms.uDistortAmount.value = ocean.distortAmount
  ;(uniforms.uDeepColor.value as THREE.Color).copy(cycle.oceanDeep).multiplyScalar(rainDarken)
  ;(uniforms.uMidColor.value as THREE.Color).copy(cycle.oceanMid).multiplyScalar(rainDarken)
  uniforms.uMidPosition.value = ocean.midPosition
  ;(uniforms.uHighlight.value as THREE.Color).set(ocean.highlightColor)
  ;(uniforms.uFoamColor.value as THREE.Color).copyLinearToSRGB(cycle.foamColor)
  uniforms.uOpacity.value = ocean.opacity
  uniforms.uDeepOpacity.value = ocean.deepOpacity
  uniforms.uFresnelPower.value = ocean.fresnelPower
  uniforms.uFresnelStrength.value = ocean.fresnelStrength * cycle.fresnel
  uniforms.uFoamAmount.value = ocean.foamAmount
  uniforms.uSpecularStrength.value = ocean.specularStrength * cycle.specular
  uniforms.uSpecularPower.value = ocean.specularPower
  uniforms.uCrestStrength.value = ocean.crestStrength
  ;(uniforms.uSunDirection.value as THREE.Vector3).copy(cycle.oceanSunDirection)
  ;(uniforms.uMoonDirection.value as THREE.Vector3).copy(cycle.oceanMoonDirection)
  uniforms.uMoonIntensity.value = cycle.nightFactor * Math.max(0, weather.moonMultiplier - 1.0)
}

export function swellWithWind(
  uniforms: Record<string, THREE.IUniform>,
  windSwell: number,
  delta: number
) {
  const alignment = useWindStore.getState().direction.dot(PRIMARY_WAVE_DIRECTION)
  const target =
    (WIND_SWELL_CALM + (WIND_SWELL_ALIGNED_GAIN * (alignment + 1)) / 2) *
    useWeatherStore.getState().waveAmplitudeMultiplier
  const nextSwell = windSwell + (target - windSwell) * Math.min(1, delta * WIND_SWELL_RATE)
  uniforms.uWindAmplitude.value = nextSwell
  return nextSwell
}
