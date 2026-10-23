import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { WallClock } from '@/utils/time'
import { buildFishSchools, disposeFishSchools } from './fishSchoolsModel'
import { swimFish } from './fishSwim'

interface FishSchoolsProps {
  clock: WallClock
}

export default function FishSchools({ clock }: FishSchoolsProps) {
  const swimTime = useMemo(() => ({ value: 0 }), [])
  const schools = useMemo(() => buildFishSchools(swimTime), [swimTime])

  useEffect(() => () => disposeFishSchools(schools), [schools])

  useFrame(() => swimFish(swimTime, clock.elapsed))

  return <primitive object={schools} />
}
