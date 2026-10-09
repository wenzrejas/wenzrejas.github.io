import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useLoadingStore } from '@/store/loadingStore'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { DISSOLVE_SECONDS } from './constants'
import { clearingFront } from './dissolveField'
import {
  bindDissolveTextures,
  createDissolveTextures,
  createMistDissolveMaterial,
  disposeDissolveTextures,
  preparedMistDissolve,
  type DissolveTextures,
} from './mistDissolveModel'

export default function MistDissolve() {
  const gl = useThree((state) => state.gl)
  const meshRef = useRef<THREE.Mesh>(null)
  const texturesRef = useRef<DissolveTextures | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const material = useMemo(() => createMistDissolveMaterial(), [])

  useEffect(
    () => () => {
      material.dispose()
      if (texturesRef.current) disposeDissolveTextures(texturesRef.current)
    },
    [material]
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    const plan = preparedMistDissolve()
    if (!mesh || !plan) return
    const uniforms = uniformsOf(mesh)
    if (texturesRef.current?.plan !== plan) {
      if (texturesRef.current) disposeDissolveTextures(texturesRef.current)
      const textures = createDissolveTextures(plan)
      bindDissolveTextures(uniforms, textures)
      gl.initTexture(textures.snapshot)
      gl.initTexture(textures.field)
      texturesRef.current = textures
    }
    const elapsed = clock.getElapsedTime()
    if (useLoadingStore.getState().hasSetSail) startedAtRef.current ??= elapsed
    const progress =
      startedAtRef.current === null ? 0 : (elapsed - startedAtRef.current) / DISSOLVE_SECONDS
    mesh.visible = progress < 1
    uniforms.uFront.value = clearingFront(plan.field, THREE.MathUtils.smoothstep(progress, 0, 1))
  })

  return (
    <mesh
      ref={meshRef}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.loaderMist}
      visible={false}
    >
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
