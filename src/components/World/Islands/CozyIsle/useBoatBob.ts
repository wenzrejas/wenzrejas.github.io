import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useWeatherStore } from '../../../../store/weatherStore'

const BOB_AMP = 0.04
const BOB_SPEED = 1.5
const ROLL_AMP = 0.035
const PITCH_AMP = 0.02
const ROLL_RATE = 0.8
const PITCH_RATE = 0.55

export function useBoatBob(boat: THREE.Object3D | null) {
  const rest = useRef<{ y: number; rx: number; rz: number } | null>(null)

  useFrame(({ clock }) => {
    if (!boat) return
    if (!rest.current) {
      rest.current = { y: boat.position.y, rx: boat.rotation.x, rz: boat.rotation.z }
    }

    const time = clock.getElapsedTime()
    const swell = useWeatherStore.getState().waveAmpMult
    const base = rest.current

    boat.position.y = base.y + Math.sin(time * BOB_SPEED) * BOB_AMP * swell
    boat.rotation.z = base.rz + Math.sin(time * BOB_SPEED * ROLL_RATE) * ROLL_AMP * swell
    boat.rotation.x = base.rx + Math.cos(time * BOB_SPEED * PITCH_RATE) * PITCH_AMP * swell
  })
}
