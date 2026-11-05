import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { DAY_CYCLE_FRAME_PRIORITY, STARTING_CYCLE_TIME } from './constants'
import type { SkyLights } from './skyDarkening'
import { stepSkyLook } from './skyLook'

const _lights: SkyLights = { background: null, hemisphere: null, sun: null, moon: null }

export default function DayNightCycle() {
  const cycleTime = useRef(STARTING_CYCLE_TIME)
  const hemisphereRef = useRef<THREE.HemisphereLight>(null)
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const moonRef = useRef<THREE.DirectionalLight>(null)

  useFrame(({ scene }, delta) => {
    _lights.background = scene.background
    _lights.hemisphere = hemisphereRef.current
    _lights.sun = sunRef.current
    _lights.moon = moonRef.current
    cycleTime.current = stepSkyLook(cycleTime.current, delta, _lights)
  }, DAY_CYCLE_FRAME_PRIORITY)

  return (
    <>
      <hemisphereLight ref={hemisphereRef} />
      <directionalLight ref={sunRef} />
      <directionalLight ref={moonRef} />
    </>
  )
}
