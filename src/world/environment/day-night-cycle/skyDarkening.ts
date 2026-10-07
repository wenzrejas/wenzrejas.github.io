import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { mix } from '@/utils/math'
import { BRIGHTEST_MOON, KFS, PHASES } from './dayNightKeyframes'

const NIGHT = KFS.find(({ t }) => t === PHASES.night)!

const DARK = {
  background: new THREE.Color(NIGHT.bg),
  fog: new THREE.Color(NIGHT.fog),
  hemiSky: new THREE.Color(NIGHT.hemiSky),
  hemiGround: new THREE.Color(NIGHT.hemiGround),
  sunColor: new THREE.Color(NIGHT.sunColor),
  moonColor: new THREE.Color(NIGHT.moonColor),
  oceanDeep: new THREE.Color(NIGHT.oceanDeep),
  oceanMid: new THREE.Color(NIGHT.oceanMid),
  foam: new THREE.Color(NIGHT.foam),
  sunDirection: new THREE.Vector3(...NIGHT.sunPos).normalize(),
  moonDirection: new THREE.Vector3(...NIGHT.moonPos).normalize(),
  moonPosition: new THREE.Vector3(...NIGHT.moonPos),
}

export interface SkyLights {
  background: unknown
  hemi: THREE.HemisphereLight | null
  sun: THREE.DirectionalLight | null
  moon: THREE.DirectionalLight | null
}

export function darkenSky(darkness: number, { background, hemi, sun, moon }: SkyLights) {
  const cycle = useCycleStore.getState()
  cycle.nightFactor = mix(cycle.nightFactor, NIGHT.moonInt / BRIGHTEST_MOON, darkness)
  cycle.fresnel = mix(cycle.fresnel, NIGHT.fresnel, darkness)
  cycle.specular = mix(cycle.specular, NIGHT.specular, darkness)
  cycle.fogColor.lerp(DARK.fog, darkness)
  cycle.oceanDeep.lerp(DARK.oceanDeep, darkness)
  cycle.oceanMid.lerp(DARK.oceanMid, darkness)
  cycle.foamColor.lerp(DARK.foam, darkness)
  cycle.oceanSunDir.lerp(DARK.sunDirection, darkness).normalize()
  cycle.oceanMoonDir.lerp(DARK.moonDirection, darkness).normalize()

  if (background instanceof THREE.Color) background.lerp(DARK.background, darkness)

  if (hemi) {
    hemi.color.lerp(DARK.hemiSky, darkness)
    hemi.groundColor.lerp(DARK.hemiGround, darkness)
    hemi.intensity = mix(hemi.intensity, NIGHT.hemiInt, darkness)
  }
  if (sun) {
    sun.color.lerp(DARK.sunColor, darkness)
    sun.intensity = mix(sun.intensity, NIGHT.sunInt, darkness)
  }
  if (moon) {
    moon.color.lerp(DARK.moonColor, darkness)
    moon.intensity = mix(moon.intensity, NIGHT.moonInt, darkness)
    moon.position.lerp(DARK.moonPosition, darkness)
  }
}
