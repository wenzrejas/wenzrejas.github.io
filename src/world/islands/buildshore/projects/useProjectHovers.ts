import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { createProjectHovers, stepProjectHovers } from './projectHovers'

export function useProjectHovers() {
  const hovers = useMemo(() => createProjectHovers(), [])

  useFrame((_, delta) => stepProjectHovers(hovers, Math.min(delta, MAX_FRAME_SECONDS)))

  return hovers
}
