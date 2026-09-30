import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { updateDrops, updateFoam, type ParticlePool } from './particlePool'

interface SprayProps {
  foam: ParticlePool
  drops: ParticlePool
  gravity: number
  surfaceAt?: (x: number, z: number) => number
  tint?: THREE.Color
  tintAt?: () => number
}

export default function Spray({ foam, drops, gravity, surfaceAt, tint, tintAt }: SprayProps) {
  const foamRef = useRef<THREE.InstancedMesh>(null)
  const dropsRef = useRef<THREE.InstancedMesh>(null)

  const foamGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), [])
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

  useFrame((_, delta) => {
    const foamMesh = foamRef.current
    const dropsMesh = dropsRef.current
    if (!foamMesh || !dropsMesh) return

    const dt = Math.min(delta, 0.05)
    material.color.copy(useCycleStore.getState().foamColor)
    if (tint && tintAt) material.color.lerp(tint, tintAt())
    updateFoam(foam, foamMesh, dt)
    updateDrops(drops, dropsMesh, dt, gravity, surfaceAt)
  })

  return (
    <>
      <instancedMesh
        ref={foamRef}
        args={[foamGeometry, material, foam.particles.length]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
      <instancedMesh
        ref={dropsRef}
        args={[dropGeometry, material, drops.particles.length]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
    </>
  )
}
