import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { isPanelOpen } from '@/store/panelStore'
import { createPanelFraming, easePanelFraming, frameShip } from './cameraFraming'

interface CameraRigProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function CameraRig({ shipRef }: CameraRigProps) {
  const panelFraming = useRef(createPanelFraming())

  useFrame(({ camera, clock }, delta) => {
    const ship = shipRef.current
    if (!ship) return
    easePanelFraming(panelFraming.current, isPanelOpen(), delta)
    frameShip(
      camera,
      ship.position.x,
      ship.position.z,
      clock.getElapsedTime(),
      panelFraming.current.blend
    )
  })
  return null
}
