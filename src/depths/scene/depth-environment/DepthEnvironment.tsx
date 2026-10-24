import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { WallClock } from '@/utils/time'
import { surfaceDaylight } from '../surface-daylight/surfaceDaylight'
import type { Timeline } from '../timeline/timeline'
import { buildDepthEnvironment, disposeDepthEnvironment } from './depthEnvironmentModel'
import { shineLights } from './depthLights'
import { drainWater, fillWater, tintWater } from './depthWater'

interface DepthEnvironmentProps {
  timeline: Timeline
  clock: WallClock
}

export default function DepthEnvironment({ timeline, clock }: DepthEnvironmentProps) {
  const scene = useThree((state) => state.scene)
  const environment = useMemo(() => buildDepthEnvironment(), [])

  useEffect(() => () => disposeDepthEnvironment(environment), [environment])

  useLayoutEffect(() => {
    fillWater(scene, environment)
    return () => drainWater(scene)
  }, [scene, environment])

  useFrame(({ size }) => {
    const daylight = surfaceDaylight()
    tintWater(environment, timeline, daylight, size.width / size.height, clock.elapsed)
    shineLights(environment.lights, daylight)
  })

  return <primitive object={environment.group} />
}
