import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import GroundGlow from '../GroundGlow/GroundGlow'
import { SHRINE_GROUND_GLOW } from './constants'
import { sanctuaryGlow } from './sanctuaryGlow'
import { buildGemHaloGeometry, createGemHaloMaterial } from './gemHaloModel'
import type { Shrines } from './shrines'

interface ShrineGlowProps {
  shrines: Shrines
  islandScale: number
}

export default function ShrineGlow({ shrines, islandScale }: ShrineGlowProps) {
  const gemHaloRef = useRef<THREE.Points>(null)

  const gemHaloGeometry = useMemo(() => buildGemHaloGeometry(shrines.gems), [shrines])
  const gemHaloMaterial = useMemo(() => createGemHaloMaterial(), [])

  useEffect(
    () => () => {
      gemHaloGeometry.dispose()
      gemHaloMaterial.dispose()
    },
    [gemHaloGeometry, gemHaloMaterial]
  )

  useFrame(({ camera, gl }) => {
    const gemHalo = gemHaloRef.current
    if (!gemHalo) return

    const pixelsPerUnit = (camera as THREE.OrthographicCamera).zoom * gl.getPixelRatio()
    const { uniforms } = gemHalo.material as THREE.ShaderMaterial
    uniforms.uGlow.value = sanctuaryGlow()
    uniforms.uPixelsPerUnit.value = pixelsPerUnit * islandScale
  })

  return (
    <>
      <GroundGlow
        sites={shrines.bases}
        tuning={SHRINE_GROUND_GLOW}
        islandScale={islandScale}
        level={sanctuaryGlow}
      />
      <points
        ref={gemHaloRef}
        geometry={gemHaloGeometry}
        material={gemHaloMaterial}
        renderOrder={5}
      />
    </>
  )
}
