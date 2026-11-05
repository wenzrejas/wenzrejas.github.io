import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { isIntroductionPending } from '@/store/guideStore'
import { dayPace, flashStrength, useSettingsStore } from '@/store/settingsStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import { useWeatherStore } from '@/store/weatherStore'
import { lerpVector3, mix } from '@/utils/math'
import {
  CYCLE_DURATION,
  LIGHTNING_BACKGROUND_WASH,
  LIGHTNING_FOG_WASH,
  LIGHTNING_HEMISPHERE_BOOST,
  LIGHTNING_MOON_BOOST,
  LIGHTNING_SUN_BOOST,
  OVERCAST_BACKGROUND_DIM,
  OVERCAST_FOG_DIM,
} from './constants'
import { BRIGHTEST_MOON, PHASES, sampleKeyframes, type KeyframeSample } from './dayNightKeyframes'
import { darkenSky, type SkyLights } from './skyDarkening'
import { flashSky } from './skyFlash'

const _sunPosition = new THREE.Vector3()
const _moonPosition = new THREE.Vector3()
const _white = new THREE.Color(1, 1, 1)

function advanceCycleTime(cycleTime: number, delta: number) {
  const { dayCycle } = useDebugStore.getState()
  const timeOfDay =
    dayCycle.timeOfDay === 'auto' ? useSettingsStore.getState().timeOfDay : dayCycle.timeOfDay
  if (timeOfDay !== 'auto') return PHASES[timeOfDay]
  if (useSkyBeamStore.getState().isActive || isIntroductionPending()) return cycleTime
  const cycleSpeed = dayCycle.cycleSpeed * dayPace()
  return (cycleTime + (delta * cycleSpeed) / CYCLE_DURATION) % 1
}

function paintCycleColours({ from, to, blend }: KeyframeSample, cycleTime: number) {
  const cycle = useCycleStore.getState()
  const { overcastAmount } = useWeatherStore.getState()
  cycle.nightFactor = mix(from.moonIntensity, to.moonIntensity, blend) / BRIGHTEST_MOON
  cycle.timeOfDay = cycleTime
  cycle.fresnel = mix(from.fresnel, to.fresnel, blend)
  cycle.specular = mix(from.specular, to.specular, blend)
  cycle.fogColor.lerpColors(from.fog, to.fog, blend)
  cycle.oceanDeep.lerpColors(from.oceanDeep, to.oceanDeep, blend)
  cycle.oceanMid.lerpColors(from.oceanMid, to.oceanMid, blend)
  cycle.foamColor.lerpColors(from.foam, to.foam, blend)
  cycle.sparkleColor.lerpColors(from.sparkle, to.sparkle, blend)
  if (overcastAmount > 0) cycle.fogColor.multiplyScalar(1 - overcastAmount * OVERCAST_FOG_DIM)

  lerpVector3(from.sunPosition, to.sunPosition, blend, _sunPosition)
  lerpVector3(from.moonPosition, to.moonPosition, blend, _moonPosition)
  cycle.oceanSunDirection.copy(_sunPosition).normalize()
  cycle.clockSunHeight = cycle.oceanSunDirection.y
  cycle.oceanMoonDirection.copy(_moonPosition).normalize()
}

function paintBackground({ from, to, blend }: KeyframeSample, background: unknown) {
  if (!(background instanceof THREE.Color)) return
  const { overcastAmount } = useWeatherStore.getState()
  background.lerpColors(from.background, to.background, blend)
  if (overcastAmount > 0) background.multiplyScalar(1 - overcastAmount * OVERCAST_BACKGROUND_DIM)
}

function paintLights({ from, to, blend }: KeyframeSample, { hemisphere, sun, moon }: SkyLights) {
  const { lightMultiplier, moonMultiplier } = useWeatherStore.getState()
  if (hemisphere) {
    hemisphere.color.lerpColors(from.hemisphereSky, to.hemisphereSky, blend)
    hemisphere.groundColor.lerpColors(from.hemisphereGround, to.hemisphereGround, blend)
    hemisphere.intensity =
      mix(from.hemisphereIntensity, to.hemisphereIntensity, blend) * lightMultiplier
  }
  if (sun) {
    sun.color.lerpColors(from.sunColor, to.sunColor, blend)
    sun.intensity = mix(from.sunIntensity, to.sunIntensity, blend) * lightMultiplier
    sun.position.copy(_sunPosition)
  }
  if (moon) {
    moon.color.lerpColors(from.moonColor, to.moonColor, blend)
    moon.intensity = mix(from.moonIntensity, to.moonIntensity, blend) * moonMultiplier
    moon.position.copy(_moonPosition)
  }
}

function washWithLightning(flash: number, { background, hemisphere, sun, moon }: SkyLights) {
  if (background instanceof THREE.Color) background.lerp(_white, flash * LIGHTNING_BACKGROUND_WASH)
  useCycleStore.getState().fogColor.lerp(_white, flash * LIGHTNING_FOG_WASH)
  if (hemisphere) hemisphere.intensity += flash * LIGHTNING_HEMISPHERE_BOOST
  if (sun) sun.intensity += flash * LIGHTNING_SUN_BOOST
  if (moon) moon.intensity += flash * LIGHTNING_MOON_BOOST
}

function applySkyEvents(lights: SkyLights) {
  const { darkness, flash } = useSkyBeamStore.getState()
  if (darkness > 0) darkenSky(darkness, lights)
  if (flash > 0) flashSky(flash * flashStrength(), lights)
  const lightningFlash = useWeatherStore.getState().lightningFlash * flashStrength()
  if (lightningFlash > 0) washWithLightning(lightningFlash, lights)
}

export function stepSkyLook(cycleTime: number, delta: number, lights: SkyLights) {
  const nextCycleTime = advanceCycleTime(cycleTime, delta)
  const sample = sampleKeyframes(nextCycleTime)
  paintCycleColours(sample, nextCycleTime)
  paintBackground(sample, lights.background)
  paintLights(sample, lights)
  applySkyEvents(lights)
  return nextCycleTime
}
