import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { watchContextLoss } from './contextLoss'

export default function ContextLossWatch() {
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => watchContextLoss(canvas), [canvas])

  return null
}
