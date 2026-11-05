import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { finishLoadingTask } from '@/store/loadingStore'
import { SCENE_UPLOAD_FRAME_PRIORITY } from './constants'
import { uploadOnce, uploadQueueOf } from './sceneUpload'
import { warmShaders } from './shaderWarmup'

export default function SceneWarmup() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const uploadsRef = useRef<THREE.Object3D[] | null>(null)

  useEffect(() => {
    warmShaders(gl, scene, camera).finally(() => {
      uploadsRef.current = uploadQueueOf(scene)
    })
  }, [gl, scene, camera])

  useFrame(({ gl, scene, camera }) => {
    const uploads = uploadsRef.current
    if (!uploads) return
    const root = uploads.pop()
    if (root) {
      uploadOnce(gl, scene, camera, root)
      return
    }
    uploadsRef.current = null
    finishLoadingTask('scene')
  }, SCENE_UPLOAD_FRAME_PRIORITY)

  return null
}
