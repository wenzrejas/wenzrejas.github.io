import { useFrame } from '@react-three/fiber'
import { useDepthsStore } from '@/store/depthsStore'
import { renderedScene } from '@/store/viewStore'
import { SCENE_RENDER_FRAME_PRIORITY } from './constants'

export default function SceneRenderer() {
  useFrame(({ gl, scene, camera }) => {
    const shown = renderedScene()
    if (shown === 'world') gl.render(scene, camera)
    if (shown !== 'depths') return
    const depths = useDepthsStore.getState()
    if (depths.scene && depths.camera) gl.render(depths.scene, depths.camera)
  }, SCENE_RENDER_FRAME_PRIORITY)

  return null
}
