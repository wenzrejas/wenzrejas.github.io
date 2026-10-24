import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { WallClock } from '@/utils/time'
import type { Timeline } from '../timeline/timeline'
import { advanceWhalePass, createWhalePass, poseWhale } from './whalePass'
import { buildWhaleSilhouette, disposeWhaleSilhouette } from './whaleSilhouetteModel'

interface WhaleSilhouetteProps {
  timeline: Timeline
  camera: THREE.PerspectiveCamera
  clock: WallClock
}

export default function WhaleSilhouette({ timeline, camera, clock }: WhaleSilhouetteProps) {
  const whale = useMemo(() => buildWhaleSilhouette(), [])
  const pass = useMemo(() => createWhalePass(), [])

  useEffect(() => () => disposeWhaleSilhouette(whale), [whale])

  useFrame(() => {
    advanceWhalePass(pass, clock.delta, timeline.viewedLevel, camera)
    poseWhale(whale.body, whale.swimTime, pass, camera, clock.elapsed)
  })

  return <primitive object={whale.body} />
}
