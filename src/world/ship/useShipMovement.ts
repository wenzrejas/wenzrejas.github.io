import { useEffect, useMemo, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useKeyboardInput } from '@/hooks/useKeyboardInput'
import { onShipPlaced } from '@/store/shipStore'
import { createShipSailing, restartSailingAt, stepSailing } from './shipSailing'

export function useShipMovement(groupRef: RefObject<THREE.Group | null>) {
  const pressedKeys = useKeyboardInput()
  const sailing = useMemo(() => createShipSailing(), [])

  useEffect(
    () =>
      onShipPlaced((ship) => {
        const group = groupRef.current
        if (group) restartSailingAt(sailing, group, ship)
      }),
    [groupRef, sailing]
  )

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (group) stepSailing(sailing, group, pressedKeys.current, clock.getElapsedTime(), delta)
  })

  return sailing
}
