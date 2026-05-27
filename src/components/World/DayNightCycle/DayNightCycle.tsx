import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useWeatherStore } from '../../../store/weatherStore'
import { useDebugStore } from '../../../store/debugStore'
import { sampleKeyframes } from './dayNightKeyframes'
import { mix, lerpColor, lerpVec3 } from '../../../utils/math'

export const CYCLE_DURATION = 480

// Scratch vectors — avoids per-frame allocation in the hot path
const _sunPos = new THREE.Vector3()
const _moonPos = new THREE.Vector3()
const _white = new THREE.Color(1, 1, 1)

export default function DayNightCycle() {
  const { scene } = useThree()
  const timeRef = useRef(0.28) // start at morning

  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const moonRef = useRef<THREE.DirectionalLight>(null)

  // priority -1 ensures this runs after WeatherSystem (-2) and before Ocean/Boundary (0)
  useFrame((_, delta) => {
    const { dayCycle } = useDebugStore.getState()
    timeRef.current = (timeRef.current + (delta * dayCycle.cycleSpeed) / CYCLE_DURATION) % 1

    const { lo, hi, a } = sampleKeyframes(timeRef.current)
    const cycle = useCycleStore.getState()
    const weather = useWeatherStore.getState()

    // ── Cycle-store colors (read by Ocean, Boundary, Ship each frame) ─────
    cycle.nightFactor = mix(lo.moonInt, hi.moonInt, a) / 1.2
    lerpColor(lo.fog, hi.fog, a, cycle.fogColor)
    lerpColor(lo.oceanDeep, hi.oceanDeep, a, cycle.oceanDeep)
    lerpColor(lo.oceanMid, hi.oceanMid, a, cycle.oceanMid)
    lerpColor(lo.foam, hi.foam, a, cycle.foamColor)

    if (weather.overcastAmount > 0) {
      cycle.fogColor.multiplyScalar(1 - weather.overcastAmount * 0.35)
    }

    // Compute sun/moon positions once — reused for both cycle store and lights
    lerpVec3(lo.sunPos, hi.sunPos, a, _sunPos)
    lerpVec3(lo.moonPos, hi.moonPos, a, _moonPos)

    cycle.oceanSunDir.copy(_sunPos).normalize()
    cycle.oceanMoonDir.copy(_moonPos).normalize()

    // ── Scene background ──────────────────────────────────────────────────
    if (scene.background instanceof THREE.Color) {
      lerpColor(lo.bg, hi.bg, a, scene.background)
      if (weather.overcastAmount > 0) {
        scene.background.multiplyScalar(1 - weather.overcastAmount * 0.45)
      }
    }

    // ── Lights ────────────────────────────────────────────────────────────
    const hemi = hemiRef.current
    if (hemi) {
      lerpColor(lo.hemiSky, hi.hemiSky, a, hemi.color)
      lerpColor(lo.hemiGround, hi.hemiGround, a, hemi.groundColor)
      hemi.intensity = mix(lo.hemiInt, hi.hemiInt, a) * weather.lightMult
    }

    const sun = sunRef.current
    if (sun) {
      lerpColor(lo.sunColor, hi.sunColor, a, sun.color)
      sun.intensity = mix(lo.sunInt, hi.sunInt, a) * weather.lightMult
      sun.position.copy(_sunPos)
    }

    const moon = moonRef.current
    if (moon) {
      lerpColor(lo.moonColor, hi.moonColor, a, moon.color)
      moon.intensity = mix(lo.moonInt, hi.moonInt, a) * weather.moonMult
      moon.position.copy(_moonPos)
    }

    // ── Lightning flash ───────────────────────────────────────────────────
    const f = weather.lightningFlash
    if (f > 0) {
      if (scene.background instanceof THREE.Color) scene.background.lerp(_white, f * 0.75)
      cycle.fogColor.lerp(_white, f * 0.65)
      if (hemi) hemi.intensity += f * 18
      if (sun) sun.intensity += f * 25
      if (moon) moon.intensity += f * 12
    }
  }, -1)

  return (
    <>
      <hemisphereLight ref={hemiRef} color="#c8e0ff" groundColor="#1a3a5c" intensity={2.5} />
      <directionalLight ref={sunRef} position={[10, 100, 10]} intensity={3.5} color="#ffe8b0" />
      <directionalLight ref={moonRef} position={[5, 80, 5]} intensity={0} color="#8899cc" />
    </>
  )
}
