import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { isCinematicPlaying } from '../../store/cinematicStore'
import { HIT_AREAS_VISIBLE, INTERACTION_LAYER } from './constants'
import { interactions } from './interactionManager'

export default function InteractionLayer() {
  const get = useThree((state) => state.get)

  useEffect(() => interactions.install(get().gl.domElement), [get])

  useEffect(() => {
    if (!HIT_AREAS_VISIBLE) return
    const { camera } = get()
    camera.layers.enable(INTERACTION_LAYER)
    return () => camera.layers.disable(INTERACTION_LAYER)
  }, [get])

  useFrame(({ camera }) => {
    if (isCinematicPlaying()) interactions.hold()
    else interactions.update(camera)
  })

  return null
}
