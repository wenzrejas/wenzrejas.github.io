import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
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
  level: () => number
}

const uniformsOf = (object: THREE.Mesh | THREE.Points) =>
  (object.material as THREE.ShaderMaterial).uniforms

export default function GroundGlow({ sites, tuning, islandScale, level }: GroundGlowProps) {
  const haloRef = useRef<THREE.Mesh>(null)
  const motesRef = useRef<THREE.Points>(null)

  const haloGeometry = useMemo(
    () => buildHaloGeometry(sites, tuning, islandScale),
    [sites, tuning, islandScale]
  )
  const moteGeometry = useMemo(() => buildMoteGeometry(sites, tuning), [sites, tuning])
  const haloMaterial = useMemo(() => createHaloMaterial(tuning), [tuning])
  const moteMaterial = useMemo(() => createMoteMaterial(tuning), [tuning])

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

    const glow = level()
    const zoom = (camera as THREE.OrthographicCamera).zoom

    uniformsOf(halo).uGlow.value = glow

    const moteUniforms = uniformsOf(motes)
    moteUniforms.uGlow.value = glow
    moteUniforms.uTime.value = clock.getElapsedTime()
    moteUniforms.uSize.value = tuning.moteSize * zoom * gl.getPixelRatio()
    moteUniforms.uRise.value = tuning.moteRise / islandScale
  })

  return (
    <>
      <mesh ref={haloRef} geometry={haloGeometry} material={haloMaterial} renderOrder={5} />
      <points
        ref={motesRef}
        geometry={moteGeometry}
        material={moteMaterial}
        frustumCulled={false}
        renderOrder={5}
      />
    </>
  )
}
