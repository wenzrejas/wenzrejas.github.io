import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildFlatQuad } from '@/utils/geometry'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { useCycleStore } from '@/store/cycleStore'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { updateDrops, updateFoam, type ParticlePool } from './particlePool'

interface SprayProps {
  foam: ParticlePool
  drops: ParticlePool
  gravity: number
  surfaceAt?: (x: number, z: number) => number
  tint?: THREE.Color
  tintAt?: () => number
  glowTint?: THREE.Color
}

export default function Spray({
  foam,
  drops,
  gravity,
  surfaceAt,
  tint,
  tintAt,
  glowTint,
}: SprayProps) {
  const foamRef = useRef<THREE.InstancedMesh>(null)
  const dropsRef = useRef<THREE.InstancedMesh>(null)

  const foamGeometry = useMemo(() => buildFlatQuad(), [])
  const dropGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, depthWrite: false }),
    []
  )

  useEffect(
    () => () => {
      for (const resource of [foamGeometry, dropGeometry, material]) resource.dispose()
    },
    [foamGeometry, dropGeometry, material]
  )

  const paint = useMemo(
    () => glowTint && { base: useCycleStore.getState().foamColor, glow: glowTint },
    [glowTint]
  )

  useLayoutEffect(() => {
    if (!glowTint) return
    foamRef.current?.setColorAt(0, glowTint)
    dropsRef.current?.setColorAt(0, glowTint)
  }, [glowTint])

  useFrame((_, delta) => {
    const foamMesh = foamRef.current
    const dropsMesh = dropsRef.current
    if (!foamMesh || !dropsMesh) return

    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    if (!paint) {
      material.color.copy(useCycleStore.getState().foamColor)
      if (tint && tintAt) material.color.lerp(tint, tintAt())
    }
    updateFoam(foam, foamMesh, dt, paint)
    updateDrops(drops, dropsMesh, dt, gravity, surfaceAt, paint)
  })

  return (
    <>
      <instancedMesh
        ref={foamRef}
        args={[foamGeometry, material, foam.particles.length]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effects}
      />
      <instancedMesh
        ref={dropsRef}
        args={[dropGeometry, material, drops.particles.length]}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effects}
      />
    </>
  )
}
