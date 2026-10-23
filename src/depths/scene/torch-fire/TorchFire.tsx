import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { WallClock } from '@/utils/time'
import { buildTorchFlames, douseTorches, flickerTorches, lightTorches } from './torchFlames'
import { findTorchSites } from './torchSites'

interface TorchFireProps {
  ruins: THREE.Object3D[]
  clock: WallClock
}

export default function TorchFire({ ruins, clock }: TorchFireProps) {
  const sites = useMemo(() => findTorchSites(ruins), [ruins])
  const flames = useMemo(() => buildTorchFlames(sites), [sites])

  useEffect(() => {
    lightTorches(sites, flames)
    return () => douseTorches(flames)
  }, [sites, flames])

  useFrame(() => flickerTorches(sites, flames, clock.elapsed))

  return null
}
