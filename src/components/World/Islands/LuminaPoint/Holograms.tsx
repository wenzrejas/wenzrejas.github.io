import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import GroundGlow from '../GroundGlow/GroundGlow'
import { INLET_GLOW } from './constants'
import { inletGlow, lightHolograms } from './hologramGlow'
import {
  buildProjectionGeometry,
  createHologramUniforms,
  createProjectionMaterial,
  dressLogos,
} from './hologramModel'
import type { Monolith } from './monoliths'

interface HologramsProps {
  monoliths: Monolith[]
  islandScale: number
}

export default function Holograms({ monoliths, islandScale }: HologramsProps) {
  const shared = useMemo(() => createHologramUniforms(), [])
  const inlets = useMemo(() => monoliths.map(({ inlet }) => inlet), [monoliths])
  const logos = useMemo(() => monoliths.map(({ logo }) => logo), [monoliths])
  const projectionGeometries = useMemo(
    () => monoliths.map(({ projection }) => buildProjectionGeometry(projection)),
    [monoliths]
  )
  const projectionMaterial = useMemo(() => createProjectionMaterial(shared), [shared])

  useLayoutEffect(() => dressLogos(logos, shared), [logos, shared])

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
        sites={inlets}
        tuning={INLET_GLOW}
        islandScale={islandScale}
        level={(site) => inletGlow(monoliths[site])}
      />
      {projectionGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={projectionMaterial} renderOrder={5} />
      ))}
    </>
  )
}
