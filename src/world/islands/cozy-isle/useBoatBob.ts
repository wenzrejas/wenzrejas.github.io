import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useWeatherStore } from '@/store/weatherStore'
import {
  BOAT_BOB_AMPLITUDE,
  BOAT_BOB_SPEED,
  BOAT_PITCH_AMPLITUDE,
  BOAT_PITCH_RATE,
  BOAT_ROLL_AMPLITUDE,
  BOAT_ROLL_RATE,
} from './constants'

interface BoatRest {
  y: number
  tiltX: number
  tiltZ: number
}

function bobBoat(boat: THREE.Object3D, base: BoatRest, time: number, swell: number) {
  boat.position.y = base.y + Math.sin(time * BOAT_BOB_SPEED) * BOAT_BOB_AMPLITUDE * swell
  boat.rotation.z =
    base.tiltZ + Math.sin(time * BOAT_BOB_SPEED * BOAT_ROLL_RATE) * BOAT_ROLL_AMPLITUDE * swell
  boat.rotation.x =
    base.tiltX + Math.cos(time * BOAT_BOB_SPEED * BOAT_PITCH_RATE) * BOAT_PITCH_AMPLITUDE * swell
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
