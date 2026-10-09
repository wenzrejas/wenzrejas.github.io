import { useEffect, useLayoutEffect, useMemo, type Ref } from 'react'
import type * as THREE from 'three'
import { buildFlatQuad } from '@/utils/geometry'
import type { DistanceField } from './shoreField'
import { bindFieldTexture, createDistanceTexture } from './shorelineModel'

interface FieldQuadProps {
  ref: Ref<THREE.Mesh>
  field: DistanceField
  material: THREE.ShaderMaterial
  seaLevel: number
  renderOrder: number
}

export default function FieldQuad({ ref, field, material, seaLevel, renderOrder }: FieldQuadProps) {
  const texture = useMemo(() => createDistanceTexture(field), [field])
  const geometry = useMemo(() => buildFlatQuad(), [])

  useEffect(() => () => texture.dispose(), [texture])
  useEffect(() => () => geometry.dispose(), [geometry])
  useLayoutEffect(() => bindFieldTexture(material, texture), [material, texture])

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      position={[field.centerX, seaLevel, field.centerZ]}
      scale={[field.size, 1, field.size]}
      visible={false}
      renderOrder={renderOrder}
    />
  )
}
