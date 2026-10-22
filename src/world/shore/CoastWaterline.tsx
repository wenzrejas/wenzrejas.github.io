import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useCoastStore } from '@/store/coastStore'
import type { DistanceField } from './shoreField'

export default function CoastWaterline({ field }: { field: DistanceField }) {
  const modelSpaceRef = useRef<THREE.Group>(null)

  useEffect(() => {
    const modelSpace = modelSpaceRef.current
    if (!modelSpace) return

    modelSpace.updateWorldMatrix(true, false)
    const waterline = { field, modelToWorld: modelSpace.matrixWorld.clone() }
    useCoastStore.setState((state) => ({ waterlines: [...state.waterlines, waterline] }))
    return () =>
      useCoastStore.setState((state) => ({
        waterlines: state.waterlines.filter((entry) => entry !== waterline),
      }))
  }, [field])

  return <group ref={modelSpaceRef} />
}
