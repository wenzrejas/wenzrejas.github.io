import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SHIP_MODEL_URL } from './constants'
import { applyBrightness } from '../islands/shared/islandModel'
import { buildShipModel } from './shipModel'

export function useShipModel(brightness: number) {
  const { scene } = useGLTF(SHIP_MODEL_URL)
  const ship = useMemo(() => buildShipModel(scene), [scene])

  useLayoutEffect(() => applyBrightness(ship.tints, brightness), [ship, brightness])

  return { scene, ...ship }
}

useGLTF.preload(SHIP_MODEL_URL)
