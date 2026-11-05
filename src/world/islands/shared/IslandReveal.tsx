import { useEffect, useState, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { onShipPlaced } from '@/store/shipStore'
import { cancelReveal, createRevealWatch, stepRevealWatch } from './revealWatch'

interface IslandRevealProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function IslandReveal({ shipRef }: IslandRevealProps) {
  const [watch] = useState(createRevealWatch)

  useEffect(() => onShipPlaced(() => cancelReveal(watch)), [watch])

  useFrame(({ camera }, delta) => {
    const ship = shipRef.current
    if (ship) stepRevealWatch(watch, ship.position, camera, delta)
  })

  return null
}
