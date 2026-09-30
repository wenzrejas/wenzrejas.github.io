import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import GroundGlow from '../GroundGlow/GroundGlow'
import { INLET_GLOW } from './constants'
import { lightHolograms, projectorGlow } from './hologramGlow'
import {
  buildProjectionGeometry,
  createHologramUniforms,
  createProjectionMaterial,
  dressLogos,
} from './hologramModel'
import type { Monoliths } from './monoliths'

interface HologramsProps {
  monoliths: Monoliths
  islandScale: number
}

export default function Holograms({ monoliths, islandScale }: HologramsProps) {
  const shared = useMemo(() => createHologramUniforms(), [])
  const projectionGeometries = useMemo(
    () => monoliths.projections.map(buildProjectionGeometry),
    [monoliths]
  )
  const projectionMaterial = useMemo(() => createProjectionMaterial(shared), [shared])

  useLayoutEffect(() => dressLogos(monoliths.logos, shared), [monoliths, shared])

  useEffect(
    () => () => {
      for (const geometry of projectionGeometries) geometry.dispose()
      projectionMaterial.dispose()
    },
    [projectionGeometries, projectionMaterial]
  )

  useFrame(({ clock }) => lightHolograms(shared, clock.getElapsedTime()))

  return (
    <>
      <GroundGlow
        sites={monoliths.inlets}
        tuning={INLET_GLOW}
        islandScale={islandScale}
        level={projectorGlow}
      />
      {projectionGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={projectionMaterial} renderOrder={5} />
      ))}
    </>
  )
}
