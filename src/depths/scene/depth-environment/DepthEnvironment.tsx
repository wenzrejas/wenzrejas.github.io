import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { WallClock } from '@/utils/time'
import type { Timeline } from '../timeline/timeline'
import {
  FRONT_LIGHT_COLOR,
  FRONT_LIGHT_INTENSITY,
  FRONT_LIGHT_POSITION,
  HEMISPHERE_GROUND_COLOR,
  HEMISPHERE_INTENSITY,
  HEMISPHERE_SKY_COLOR,
  RIM_LIGHT_COLOR,
  RIM_LIGHT_INTENSITY,
  RIM_LIGHT_POSITION,
  SURFACE_LIGHT_COLOR,
  SURFACE_LIGHT_INTENSITY,
  SURFACE_LIGHT_POSITION,
} from './constants'
import { buildDepthEnvironment, disposeDepthEnvironment } from './depthEnvironmentModel'
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

  useFrame(({ size }) => tintWater(environment, timeline, size.width / size.height, clock.elapsed))

  return (
    <>
      <hemisphereLight
        args={[HEMISPHERE_SKY_COLOR, HEMISPHERE_GROUND_COLOR, HEMISPHERE_INTENSITY]}
      />
      <directionalLight
        position={SURFACE_LIGHT_POSITION}
        color={SURFACE_LIGHT_COLOR}
        intensity={SURFACE_LIGHT_INTENSITY}
      />
      <directionalLight
        position={FRONT_LIGHT_POSITION}
        color={FRONT_LIGHT_COLOR}
        intensity={FRONT_LIGHT_INTENSITY}
      />
      <directionalLight
        position={RIM_LIGHT_POSITION}
        color={RIM_LIGHT_COLOR}
        intensity={RIM_LIGHT_INTENSITY}
      />
      <primitive object={environment.group} />
    </>
  )
}
