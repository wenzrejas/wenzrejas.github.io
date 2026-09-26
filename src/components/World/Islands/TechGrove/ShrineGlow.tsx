import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MOTE_RISE, MOTE_SIZE } from './constants'
import { sanctuaryGlow } from './sanctuaryGlow'
import {
  buildBaseHaloGeometry,
  buildGemHaloGeometry,
  buildMoteGeometry,
  createBaseHaloMaterial,
  createGemHaloMaterial,
  createMoteMaterial,
} from './shrineGlowModel'
import type { Shrines } from './shrines'

interface ShrineGlowProps {
  shrines: Shrines
  islandScale: number
}

const uniformsOf = (object: THREE.Mesh | THREE.Points) =>
  (object.material as THREE.ShaderMaterial).uniforms

export default function ShrineGlow({ shrines, islandScale }: ShrineGlowProps) {
  const baseHaloRef = useRef<THREE.Mesh>(null)
  const motesRef = useRef<THREE.Points>(null)
  const gemHaloRef = useRef<THREE.Points>(null)

  const baseHaloGeometry = useMemo(
    () => buildBaseHaloGeometry(shrines.bases, islandScale),
    [shrines, islandScale]
  )
  const moteGeometry = useMemo(() => buildMoteGeometry(shrines.bases), [shrines])
  const gemHaloGeometry = useMemo(() => buildGemHaloGeometry(shrines.gems), [shrines])
  const baseHaloMaterial = useMemo(() => createBaseHaloMaterial(), [])
  const moteMaterial = useMemo(() => createMoteMaterial(), [])
  const gemHaloMaterial = useMemo(() => createGemHaloMaterial(), [])

  useEffect(
    () => () => {
      for (const resource of [
        baseHaloGeometry,
        moteGeometry,
        gemHaloGeometry,
        baseHaloMaterial,
        moteMaterial,
        gemHaloMaterial,
      ]) {
        resource.dispose()
      }
    },
    [
      baseHaloGeometry,
      moteGeometry,
      gemHaloGeometry,
      baseHaloMaterial,
      moteMaterial,
      gemHaloMaterial,
    ]
  )

  useFrame(({ clock, camera, gl }) => {
    const baseHalo = baseHaloRef.current
    const motes = motesRef.current
    const gemHalo = gemHaloRef.current
    if (!baseHalo || !motes || !gemHalo) return

    const glow = sanctuaryGlow()
    const pixelsPerUnit = (camera as THREE.OrthographicCamera).zoom * gl.getPixelRatio()

    uniformsOf(baseHalo).uGlow.value = glow

    const moteUniforms = uniformsOf(motes)
    moteUniforms.uGlow.value = glow
    moteUniforms.uTime.value = clock.getElapsedTime()
    moteUniforms.uSize.value = MOTE_SIZE * pixelsPerUnit
    moteUniforms.uRise.value = MOTE_RISE / islandScale

    const gemHaloUniforms = uniformsOf(gemHalo)
    gemHaloUniforms.uGlow.value = glow
    gemHaloUniforms.uPixelsPerUnit.value = pixelsPerUnit * islandScale
  })

  return (
    <>
      <mesh
        ref={baseHaloRef}
        geometry={baseHaloGeometry}
        material={baseHaloMaterial}
        renderOrder={5}
      />
      <points
        ref={motesRef}
        geometry={moteGeometry}
        material={moteMaterial}
        frustumCulled={false}
        renderOrder={5}
      />
      <points
        ref={gemHaloRef}
        geometry={gemHaloGeometry}
        material={gemHaloMaterial}
        frustumCulled={false}
        renderOrder={5}
      />
    </>
  )
}
