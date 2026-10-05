import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { isCinematicPlaying } from '../store/cinematicStore'
import { isPanelOpen } from '../store/panelStore'
import { isRevealPlaying } from '../store/revealStore'
import { isWorldInView } from '../store/viewStore'
import { interactions } from './interactionManager'

export default function InteractionLayer() {
  const get = useThree((state) => state.get)

  useEffect(() => interactions.install(get().gl.domElement), [get])

  useFrame(({ camera }) => {
    if (isCinematicPlaying() || isPanelOpen() || isRevealPlaying() || !isWorldInView())
      interactions.hold()
    else interactions.update(camera)
  })

  return null
}
