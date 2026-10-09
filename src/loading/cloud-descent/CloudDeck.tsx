import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { useLoadingStore } from '@/store/loadingStore'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { bakeCloudLayers } from './cloudBake'
import { createCloudBakeRig, createCloudDeckMaterial, disposeCloudBakeRig } from './cloudDeckModel'
import { PASS_TO_ZOOM } from './constants'
import { updateCloudLayerZooms } from './descent'

export default function CloudDeck() {
  const gl = useThree((state) => state.gl)
  const meshRef = useRef<THREE.Mesh>(null)
  const appearedAtRef = useRef<number | null>(null)
  const bakedSizeRef = useRef({ width: 0, height: 0 })
  const rig = useMemo(() => createCloudBakeRig(), [])
  const material = useMemo(() => createCloudDeckMaterial(rig.target.texture), [rig])

  useEffect(() => {
    gl.compileAsync(rig.scene, rig.camera).catch(() => undefined)
  }, [gl, rig])

  useEffect(
    () => () => {
      material.dispose()
      disposeCloudBakeRig(rig)
    },
    [material, rig]
  )

  useFrame(({ clock, size }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const { pendingTasks, hasSetSail } = useLoadingStore.getState()
    const baked = bakedSizeRef.current
    if (pendingTasks.length === 0 && (baked.width !== size.width || baked.height !== size.height)) {
      bakeCloudLayers(gl, rig, size.width, size.height)
      bakedSizeRef.current = { width: size.width, height: size.height }
    }
    const uniforms = uniformsOf(mesh)
    const zooms = updateCloudLayerZooms(uniforms.uLayerZooms.value)
    mesh.visible = hasSetSail && zooms.some((zoom) => zoom < PASS_TO_ZOOM)
    if (!mesh.visible) return
    const elapsed = clock.getElapsedTime()
    appearedAtRef.current ??= elapsed
    uniforms.uTime.value = elapsed - appearedAtRef.current
    uniforms.uAspect.value = size.width / size.height
  })

  return (
    <mesh
      ref={meshRef}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.loaderClouds}
      visible={false}
    >
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
