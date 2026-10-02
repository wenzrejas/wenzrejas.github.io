import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { uniformsOf } from '@/utils/meshes'
import { FALLBACK_FRAME_SECONDS, MAX_FRAME_SECONDS } from '@/utils/time'
import {
  carryRibbon,
  createWakeRibbon,
  fadeRibbon,
  ribbonSpan,
  sampleShip,
  writeRibbon,
} from './wakeRibbon'
import { buildWakeRibbonGeometry, createWakeRibbonMaterial } from './wakeRibbonModel'

interface WakeTrailProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function WakeTrail({ shipRef }: WakeTrailProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ribbon = useRef(createWakeRibbon())
  const geometry = useMemo(() => buildWakeRibbonGeometry(), [])
  const material = useMemo(() => createWakeRibbonMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock }, delta) => {
    const ship = shipRef.current
    const mesh = meshRef.current
    if (!ship || !mesh) return

    const dt =
      isFinite(delta) && delta > 0 ? Math.min(delta, MAX_FRAME_SECONDS) : FALLBACK_FRAME_SECONDS
    const wake = useDebugStore.getState().wake
    const uniforms = uniformsOf(mesh)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uColor.value.copy(useCycleStore.getState().foamColor)
    uniforms.uInvActiveMax.value = ribbonSpan(ribbon.current)

    carryRibbon(ribbon.current, dt)
    const hasMoved = sampleShip(
      ribbon.current,
      ship.position.x,
      ship.position.z,
      wake.minSampleDist
    )
    fadeRibbon(ribbon.current, mesh.geometry, hasMoved, dt)
    uniforms.uFadeProgress.value = ribbon.current.fade
    writeRibbon(ribbon.current, mesh.geometry, wake)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={3}
    />
  )
}
