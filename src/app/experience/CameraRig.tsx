import { useEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { isFocusedPanelOpen } from '@/store/panelStore'
import { onShipPlaced } from '@/store/shipStore'
import { createPanelFraming, easePanelFraming, frameShip } from './cameraFraming'

interface CameraRigProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function CameraRig({ shipRef }: CameraRigProps) {
  const panelFraming = useRef(createPanelFraming())

  useEffect(
    () =>
      onShipPlaced(() => {
        panelFraming.current.blend = 0
      }),
    []
  )

  useFrame(({ camera, clock }, delta) => {
    const ship = shipRef.current
    if (!ship) return
    easePanelFraming(panelFraming.current, isFocusedPanelOpen(), delta)
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
