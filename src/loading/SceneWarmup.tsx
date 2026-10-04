import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { finishLoadingTask } from '@/store/loadingStore'
import { warmShaders } from './shaderWarmup'

export default function SceneWarmup() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    warmShaders(gl, scene, camera).finally(() => finishLoadingTask('scene'))
  }, [gl, scene, camera])

  return null
}
