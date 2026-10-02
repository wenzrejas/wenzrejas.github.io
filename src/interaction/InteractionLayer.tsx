import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { isCinematicPlaying } from '../store/cinematicStore'
import { interactions } from './interactionManager'

export default function InteractionLayer() {
  const get = useThree((state) => state.get)

  useEffect(() => interactions.install(get().gl.domElement), [get])

  useFrame(({ camera }) => {
    if (isCinematicPlaying()) interactions.hold()
    else interactions.update(camera)
  })

  return null
}
