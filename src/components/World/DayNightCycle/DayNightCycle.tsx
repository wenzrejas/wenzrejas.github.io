import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useWeatherStore } from '../../../store/weatherStore'
import { useDebugStore } from '../../../store/debugStore'
import { sampleKeyframes } from './dayNightKeyframes'
import { mix, lerpColor, lerpVec3 } from '../../../utils/math'

export const CYCLE_DURATION = 480

// ── Sun shadow ────────────────────────────────────────────────────────────────
const SUN_DISTANCE = 400
const SHADOW_EXTENT = 460
const SHADOW_MIN_SUN = 0.05
const SHADOW_MAP_SIZE = 1024
const SHADOW_BLUR = 5
const SHADOW_BLUR_SAMPLES = 8
const SHADOW_UPDATE_EVERY = 3

const _sunPos = new THREE.Vector3()
const _moonPos = new THREE.Vector3()
const _lightDir = new THREE.Vector3()
const _right = new THREE.Vector3()
const _up = new THREE.Vector3()
const _anchor = new THREE.Vector3()
const _white = new THREE.Color(1, 1, 1)

interface DayNightCycleProps {
  shipRef: React.RefObject<THREE.Group | null>
}

export default function DayNightCycle({ shipRef }: DayNightCycleProps) {
  const { scene } = useThree()
  const timeRef = useRef(0.28)

  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const moonRef = useRef<THREE.DirectionalLight>(null)
  const sunTargetRef = useRef<THREE.Object3D>(null)
  const shadowFrame = useRef(0)

  useEffect(() => {
    const sun = sunRef.current
    if (!sun || !sunTargetRef.current) return
    sun.target = sunTargetRef.current
    sun.shadow.autoUpdate = false
  }, [])

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
    const sunTarget = sunTargetRef.current
    if (sun && sunTarget) {
      lerpColor(lo.sunColor, hi.sunColor, a, sun.color)
      sun.intensity = mix(lo.sunInt, hi.sunInt, a) * weather.lightMult

      const ship = shipRef.current
      _anchor.set(ship ? ship.position.x : 0, 0, ship ? ship.position.z : 0)
      _lightDir.copy(_sunPos).normalize()

      _right.set(0, 1, 0).cross(_lightDir)
      if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0)
      _right.normalize()
      _up.copy(_lightDir).cross(_right).normalize()

      const texel = (SHADOW_EXTENT * 2) / SHADOW_MAP_SIZE
      const alongRight = Math.round(_anchor.dot(_right) / texel) * texel
      const alongUp = Math.round(_anchor.dot(_up) / texel) * texel
      const alongDir = _anchor.dot(_lightDir)
      _anchor
        .copy(_right)
        .multiplyScalar(alongRight)
        .addScaledVector(_up, alongUp)
        .addScaledVector(_lightDir, alongDir)

      sunTarget.position.copy(_anchor)
      sun.position.copy(_anchor).addScaledVector(_lightDir, SUN_DISTANCE)
      sun.castShadow = sun.intensity > SHADOW_MIN_SUN

      shadowFrame.current = (shadowFrame.current + 1) % SHADOW_UPDATE_EVERY
      sun.shadow.needsUpdate = shadowFrame.current === 0
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
      if (hemi) hemi.intensity += f * 8
      if (sun) sun.intensity += f * 11
      if (moon) moon.intensity += f * 5
    }
  }, -1)

  return (
    <>
      <hemisphereLight ref={hemiRef} color="#c8e0ff" groundColor="#1a3a5c" intensity={1.1} />
      <directionalLight
        ref={sunRef}
        position={[10, 100, 10]}
        intensity={1.5}
        color="#ffe8b0"
        castShadow
        shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={SUN_DISTANCE * 2}
        shadow-radius={SHADOW_BLUR}
        shadow-blurSamples={SHADOW_BLUR_SAMPLES}
        shadow-normalBias={0.6}
        shadow-bias={0}
      />
      <object3D ref={sunTargetRef} />
      <directionalLight ref={moonRef} position={[5, 80, 5]} intensity={0} color="#8899cc" />
    </>
  )
}
