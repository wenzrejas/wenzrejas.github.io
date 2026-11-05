import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { mix } from '@/utils/math'
import { BRIGHTEST_MOON, KEYFRAMES, PHASES } from './dayNightKeyframes'

const NIGHT = KEYFRAMES.find(({ time }) => time === PHASES.night)!

const NIGHT_SUN_DIRECTION = new THREE.Vector3(...NIGHT.sunPosition).normalize()
const NIGHT_MOON_DIRECTION = new THREE.Vector3(...NIGHT.moonPosition).normalize()
const NIGHT_MOON_POSITION = new THREE.Vector3(...NIGHT.moonPosition)

export interface SkyLights {
  background: unknown
  hemisphere: THREE.HemisphereLight | null
  sun: THREE.DirectionalLight | null
  moon: THREE.DirectionalLight | null
}

export function darkenSky(darkness: number, { background, hemisphere, sun, moon }: SkyLights) {
  const cycle = useCycleStore.getState()
  cycle.nightFactor = mix(cycle.nightFactor, NIGHT.moonIntensity / BRIGHTEST_MOON, darkness)
  cycle.fresnel = mix(cycle.fresnel, NIGHT.fresnel, darkness)
  cycle.specular = mix(cycle.specular, NIGHT.specular, darkness)
  cycle.fogColor.lerp(NIGHT.fog, darkness)
  cycle.oceanDeep.lerp(NIGHT.oceanDeep, darkness)
  cycle.oceanMid.lerp(NIGHT.oceanMid, darkness)
  cycle.foamColor.lerp(NIGHT.foam, darkness)
  cycle.sparkleColor.lerp(NIGHT.sparkle, darkness)
  cycle.oceanSunDirection.lerp(NIGHT_SUN_DIRECTION, darkness).normalize()
  cycle.oceanMoonDirection.lerp(NIGHT_MOON_DIRECTION, darkness).normalize()

  if (background instanceof THREE.Color) background.lerp(NIGHT.background, darkness)

  if (hemisphere) {
    hemisphere.color.lerp(NIGHT.hemisphereSky, darkness)
    hemisphere.groundColor.lerp(NIGHT.hemisphereGround, darkness)
    hemisphere.intensity = mix(hemisphere.intensity, NIGHT.hemisphereIntensity, darkness)
  }
  if (sun) {
    sun.color.lerp(NIGHT.sunColor, darkness)
    sun.intensity = mix(sun.intensity, NIGHT.sunIntensity, darkness)
  }
  if (moon) {
    moon.color.lerp(NIGHT.moonColor, darkness)
    moon.intensity = mix(moon.intensity, NIGHT.moonIntensity, darkness)
    moon.position.lerp(NIGHT_MOON_POSITION, darkness)
  }
}
