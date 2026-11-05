import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { disposeAll } from '@/utils/dispose'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { SLIPSTREAM_HIDE_BELOW } from './constants'
import { shipFadeUniforms } from './shipFade'
import type { ShipSailing } from './shipSailing'
import { buildSlipstreamGeometry, createSlipstreamMaterial } from './slipstreamModel'

interface SlipstreamProps {
  sailing: ShipSailing
}

export default function Slipstream({ sailing }: SlipstreamProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildSlipstreamGeometry(), [])
  const material = useMemo(() => createSlipstreamMaterial(), [])

  useEffect(() => () => disposeAll(geometry, material), [geometry, material])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.visible = sailing.sailFill > SLIPSTREAM_HIDE_BELOW
    const uniforms = uniformsOf(mesh)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uStrength.value = sailing.sailFill * shipFadeUniforms.uShipFade.value
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      visible={false}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.glow}
    />
  )
}
