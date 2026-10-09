import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { dayNightGlow } from '@/world/islands/shared/nightGlow'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import { riseLevel } from '../awakening'
import { AWAKEN_DAY_SHARE, WHIRLPOOL_EYE_X, WHIRLPOOL_EYE_Z, WHIRLPOOL_RADIUS } from '../constants'
import { FRAGMENT_COUNT } from './constants'
import {
  buildCrystalGeometry,
  buildFragmentHaloGeometry,
  createCrystalMaterial,
  createFragmentHaloMaterial,
} from './memoryEchoModel'
import { arrangeFragments, floatFragment, fragmentPlacement, writeHalos } from './memoryFragments'

interface MemoryEchoesProps {
  awakening: HoverTimeline
  islandScale: number
}

export default function MemoryEchoes({ awakening, islandScale }: MemoryEchoesProps) {
  const crystalsRef = useRef<THREE.InstancedMesh>(null)
  const halosRef = useRef<THREE.Points>(null)

  const fragments = useMemo(() => arrangeFragments(), [])
  const geometry = useMemo(() => buildCrystalGeometry(), [])
  const material = useMemo(() => createCrystalMaterial(), [])
  const haloGeometry = useMemo(() => buildFragmentHaloGeometry(), [])
  const haloMaterial = useMemo(() => createFragmentHaloMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      haloGeometry.dispose()
      haloMaterial.dispose()
    },
    [geometry, material, haloGeometry, haloMaterial]
  )

  useFrame(({ clock, camera, gl }) => {
    const crystals = crystalsRef.current
    const halos = halosRef.current
    if (!crystals || !halos) return
    const isShown = awakening.presence > 0
    crystals.visible = isShown
    halos.visible = isShown
    if (!isShown) return

    const time = clock.getElapsedTime()
    const rise = riseLevel(awakening)
    fragments.forEach((fragment, i) => {
      floatFragment(fragment, rise, time)
      crystals.setMatrixAt(i, fragmentPlacement(fragment))
    })
    crystals.instanceMatrix.needsUpdate = true
    writeHalos(fragments, haloGeometry)

    const uniforms = uniformsOf(halos)
    uniforms.uGlow.value = dayNightGlow(AWAKEN_DAY_SHARE)
    uniforms.uRise.value = rise
    uniforms.uPixelsPerUnit.value = pixelsPerUnit(camera, gl) * WHIRLPOOL_RADIUS * islandScale
  })

  return (
    <group position={[WHIRLPOOL_EYE_X, 0, WHIRLPOOL_EYE_Z]}>
      <instancedMesh
        ref={crystalsRef}
        args={[geometry, material, FRAGMENT_COUNT]}
        frustumCulled={false}
        visible={false}
      />
      <points
        ref={halosRef}
        geometry={haloGeometry}
        material={haloMaterial}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.glow}
        visible={false}
      />
    </group>
  )
}
