import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useCoastStore } from '@/store/coastStore'
import type { IslandKey } from '../islands/shared/constants'
import { traceCoastline } from './coastline'
import { COASTLINE_ARCHIPELAGOS } from './constants'
import type { DistanceField } from './shoreField'

interface CoastlineChartProps {
  islandKey: IslandKey
  field: DistanceField
  islandScale: number
}

export default function CoastlineChart({ islandKey, field, islandScale }: CoastlineChartProps) {
  const modelSpaceRef = useRef<THREE.Group>(null)

  useEffect(() => {
    const modelSpace = modelSpaceRef.current
    if (!modelSpace) return

    modelSpace.updateWorldMatrix(true, false)
    const outlines = traceCoastline(
      field,
      islandScale,
      modelSpace.matrixWorld,
      COASTLINE_ARCHIPELAGOS.includes(islandKey)
    )
    if (!outlines) return

    const coastline = { islandKey, outlines }
    useCoastStore.setState((state) => ({ coastlines: [...state.coastlines, coastline] }))
    return () =>
      useCoastStore.setState((state) => ({
        coastlines: state.coastlines.filter((entry) => entry !== coastline),
      }))
  }, [islandKey, field, islandScale])

  return <group ref={modelSpaceRef} />
}
