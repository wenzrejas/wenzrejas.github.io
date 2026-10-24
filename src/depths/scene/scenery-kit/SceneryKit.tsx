import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { WallClock } from '@/utils/time'
import { SCENERY_KIT_URL } from './constants'
import { driftScenery } from './sceneryDrift'
import { buildSceneryKit, disposeSceneryKit } from './sceneryKitModel'
import { planScenery } from './sceneryLayout'

interface SceneryKitProps {
  clock: WallClock
}

export default function SceneryKit({ clock }: SceneryKitProps) {
  const { scene } = useGLTF(SCENERY_KIT_URL)
  const kit = useMemo(() => buildSceneryKit(scene, planScenery()), [scene])

  useEffect(() => () => disposeSceneryKit(kit), [kit])

  useFrame(() => driftScenery(kit, clock.elapsed))

  return <primitive object={kit.group} />
}
