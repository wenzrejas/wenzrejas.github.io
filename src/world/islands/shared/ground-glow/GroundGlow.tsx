import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import type { GlowSite, GroundGlowTuning } from './glowSites'
import {
  buildHaloGeometry,
  buildMoteGeometry,
  createHaloMaterial,
  createMoteMaterial,
} from './groundGlowModel'

interface GroundGlowProps {
  sites: GlowSite[]
  tuning: GroundGlowTuning
  islandScale: number
  level: (site: number) => number
}

export default function GroundGlow({ sites, tuning, islandScale, level }: GroundGlowProps) {
  const haloRef = useRef<THREE.Mesh>(null)
  const motesRef = useRef<THREE.Points>(null)

  const haloGeometry = useMemo(
    () => buildHaloGeometry(sites, tuning, islandScale),
    [sites, tuning, islandScale]
  )
  const moteGeometry = useMemo(
    () => buildMoteGeometry(sites, tuning, islandScale),
    [sites, tuning, islandScale]
  )
  const haloMaterial = useMemo(
    () => createHaloMaterial(tuning, sites.length),
    [tuning, sites.length]
  )
  const moteMaterial = useMemo(
    () => createMoteMaterial(tuning, sites.length),
    [tuning, sites.length]
  )

  useEffect(
    () => () => {
      for (const resource of [haloGeometry, moteGeometry, haloMaterial, moteMaterial]) {
        resource.dispose()
      }
    },
    [haloGeometry, moteGeometry, haloMaterial, moteMaterial]
  )

  useFrame(({ clock, camera, gl }) => {
    const halo = haloRef.current
    const motes = motesRef.current
    if (!halo || !motes) return

    const haloUniforms = uniformsOf(halo)
    const moteUniforms = uniformsOf(motes)

    let isLit = false
    for (let site = 0; site < sites.length; site++) {
      const glow = level(site)
      haloUniforms.uGlow.value[site] = glow
      moteUniforms.uGlow.value[site] = glow
      if (glow > 0) isLit = true
    }
    halo.visible = isLit
    motes.visible = isLit

    moteUniforms.uTime.value = clock.getElapsedTime()
    moteUniforms.uSize.value = tuning.moteSize * pixelsPerUnit(camera, gl)
    moteUniforms.uRise.value = tuning.moteRise / islandScale
  })

  return (
    <>
      <mesh
        ref={haloRef}
        geometry={haloGeometry}
        material={haloMaterial}
        renderOrder={RENDER_LAYER.glow}
      />
      <points
        ref={motesRef}
        geometry={moteGeometry}
        material={moteMaterial}
        renderOrder={RENDER_LAYER.glow}
      />
    </>
  )
}
