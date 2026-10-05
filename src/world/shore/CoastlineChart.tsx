import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useCoastStore } from '@/store/coastStore'
import type { IslandKey } from '../islands/shared/constants'
import { traceCoastline } from './coastline'
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
    const outline = traceCoastline(field, islandScale, modelSpace.matrixWorld)
    if (!outline) return

    const coastline = { islandKey, outline }
    useCoastStore.setState((state) => ({ coastlines: [...state.coastlines, coastline] }))
    return () =>
      useCoastStore.setState((state) => ({
        coastlines: state.coastlines.filter((entry) => entry !== coastline),
      }))
  }, [islandKey, field, islandScale])

  return <group ref={modelSpaceRef} />
}
