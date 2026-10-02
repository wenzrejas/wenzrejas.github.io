import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { frameShip } from './cameraFraming'

interface CameraRigProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function CameraRig({ shipRef }: CameraRigProps) {
  useFrame(({ camera, clock }) => {
    const ship = shipRef.current
    if (!ship) return
    frameShip(camera, ship.position.x, ship.position.z, clock.getElapsedTime())
  })
  return null
}
