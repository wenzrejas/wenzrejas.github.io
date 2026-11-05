import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useWeatherStore } from '@/store/weatherStore'

const BOB_AMPLITUDE = 0.04
const BOB_SPEED = 1.5
const ROLL_AMPLITUDE = 0.035
const PITCH_AMPLITUDE = 0.02
const ROLL_RATE = 0.8
const PITCH_RATE = 0.55

interface BoatRest {
  y: number
  tiltX: number
  tiltZ: number
}

function bobBoat(boat: THREE.Object3D, base: BoatRest, time: number, swell: number) {
  boat.position.y = base.y + Math.sin(time * BOB_SPEED) * BOB_AMPLITUDE * swell
  boat.rotation.z = base.tiltZ + Math.sin(time * BOB_SPEED * ROLL_RATE) * ROLL_AMPLITUDE * swell
  boat.rotation.x = base.tiltX + Math.cos(time * BOB_SPEED * PITCH_RATE) * PITCH_AMPLITUDE * swell
}

export function useBoatBob(boat: THREE.Object3D | null) {
  const rest = useRef<BoatRest | null>(null)

  useFrame(({ clock }) => {
    if (!boat) return
    if (!rest.current) {
      rest.current = { y: boat.position.y, tiltX: boat.rotation.x, tiltZ: boat.rotation.z }
    }

    bobBoat(
      boat,
      rest.current,
      clock.getElapsedTime(),
      useWeatherStore.getState().waveAmplitudeMultiplier
    )
  })
}
