import { useFrame } from '@react-three/fiber'
import { isWorldInView } from '@/store/viewStore'
import { WORLD_RENDER_FRAME_PRIORITY } from './constants'

export default function WorldRenderer() {
  useFrame(({ gl, scene, camera }) => {
    if (isWorldInView()) gl.render(scene, camera)
  }, WORLD_RENDER_FRAME_PRIORITY)

  return null
}
