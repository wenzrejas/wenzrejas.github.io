import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useWeatherStore } from '../../../store/weatherStore'
import { useDebugStore } from '../../../store/debugStore'
import { sampleKeyframes } from './dayNightKeyframes'

export const CYCLE_DURATION = 480

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const _ca    = new THREE.Color()
const _cb    = new THREE.Color()
const _white = new THREE.Color(1, 1, 1)

function lerpCol(a: string, b: string, t: number, out: THREE.Color) {
  _ca.set(a)
  _cb.set(b)
  out.lerpColors(_ca, _cb, t)
}

export default function DayNightCycle() {
  const { scene } = useThree()
  const timeRef = useRef(0.28) // start at morning

  const hemiRef  = useRef<THREE.HemisphereLight>(null)
  const sunRef   = useRef<THREE.DirectionalLight>(null)
  const moonRef  = useRef<THREE.DirectionalLight>(null)

  // priority -1 ensures this runs before Ocean/Boundary useFrames (priority 0)
  useFrame((_, delta) => {
    const { dayCycle } = useDebugStore.getState()
    timeRef.current = (timeRef.current + delta * dayCycle.cycleSpeed / CYCLE_DURATION) % 1
    const { lo, hi, a } = sampleKeyframes(timeRef.current)

    const cycle  = useCycleStore.getState()
    const weather = useWeatherStore.getState()

    // nightFactor: normalised base moon intensity (independent of weather scaling)
    cycle.nightFactor = mix(lo.moonInt, hi.moonInt, a) / 1.2

    // Background / sky color (darkened by overcast weather)
    if (scene.background instanceof THREE.Color) {
      lerpCol(lo.bg, hi.bg, a, scene.background)
      if (weather.overcastAmount > 0) {
        scene.background.multiplyScalar(1 - weather.overcastAmount * 0.45)
      }
    }

    // Shared state for Ocean and Boundary — mutate THREE objects in place
    lerpCol(lo.fog, hi.fog, a, cycle.fogColor)
    if (weather.overcastAmount > 0) {
      cycle.fogColor.multiplyScalar(1 - weather.overcastAmount * 0.35)
    }
    lerpCol(lo.oceanDeep, hi.oceanDeep, a, cycle.oceanDeep)
    lerpCol(lo.oceanMid,  hi.oceanMid,  a, cycle.oceanMid)
    lerpCol(lo.foam,      hi.foam,      a, cycle.foamColor)

    // Sun direction for ocean specular (normalized interpolated sun position)
    cycle.oceanSunDir
      .set(
        mix(lo.sunPos[0], hi.sunPos[0], a),
        mix(lo.sunPos[1], hi.sunPos[1], a),
        mix(lo.sunPos[2], hi.sunPos[2], a)
      )
      .normalize()

    // Hemisphere light
    const hemi = hemiRef.current
    if (hemi) {
      lerpCol(lo.hemiSky,    hi.hemiSky,    a, hemi.color)
      lerpCol(lo.hemiGround, hi.hemiGround, a, hemi.groundColor)
      hemi.intensity = mix(lo.hemiInt, hi.hemiInt, a) * weather.lightMult
    }

    // Sun (directional)
    const sun = sunRef.current
    if (sun) {
      lerpCol(lo.sunColor, hi.sunColor, a, sun.color)
      sun.intensity = mix(lo.sunInt, hi.sunInt, a) * weather.lightMult
      sun.position.set(
        mix(lo.sunPos[0], hi.sunPos[0], a),
        mix(lo.sunPos[1], hi.sunPos[1], a),
        mix(lo.sunPos[2], hi.sunPos[2], a)
      )
    }

    // Moon (directional)
    const moon = moonRef.current
    if (moon) {
      lerpCol(lo.moonColor, hi.moonColor, a, moon.color)
      moon.intensity = mix(lo.moonInt, hi.moonInt, a) * weather.moonMult
      moon.position.set(
        mix(lo.moonPos[0], hi.moonPos[0], a),
        mix(lo.moonPos[1], hi.moonPos[1], a),
        mix(lo.moonPos[2], hi.moonPos[2], a)
      )
    }

    // Lightning flash — briefly blinds the sky and boosts lights
    const f = weather.lightningFlash
    if (f > 0) {
      if (scene.background instanceof THREE.Color) scene.background.lerp(_white, f * 0.75)
      cycle.fogColor.lerp(_white, f * 0.65)
      if (hemi) hemi.intensity += f * 18
      if (sun)  sun.intensity  += f * 25
      if (moon) moon.intensity += f * 12
    }
  }, -1)

  return (
    <>
      <hemisphereLight ref={hemiRef} color="#c8e0ff" groundColor="#1a3a5c" intensity={2.5} />
      <directionalLight ref={sunRef}  position={[10, 100, 10]} intensity={3.5} color="#ffe8b0" />
      <directionalLight ref={moonRef} position={[5, 80, 5]}    intensity={0}   color="#8899cc" />
    </>
  )
}
