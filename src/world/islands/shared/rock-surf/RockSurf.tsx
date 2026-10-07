import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isSphereInView } from '@/utils/screen'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import Spray from '@/world/effects/Spray'
import { ParticlePool } from '@/world/effects/particlePool'
import { OCEAN_Y } from '@/world/environment/ocean/constants'
import type { ShoreField } from '@/world/shore/shoreField'
import type { IslandConfig } from '../constants'
import type { IslandPlacement } from '../islandTransform'
import { burstsDue, pickSite, useSiteFrame } from '../shoreSites'
import { SURF_DROP_POOL, SURF_FOAM_POOL, SURF_GRAVITY, SURF_VIEW_REACH } from './constants'
import { emitSurfSplash, findSurfSites, type SurfTuning } from './surfSplash'

interface RockSurfProps {
  model: THREE.Object3D
  terrainNodes: readonly string[]
  shoreline: ShoreField
  placement: IslandPlacement
  offsetY: number
  config: IslandConfig
  tuning: SurfTuning
}

export default function RockSurf({
  model,
  terrainNodes,
  shoreline,
  placement,
  offsetY,
  config,
  tuning,
}: RockSurfProps) {
  const frame = useSiteFrame(placement)
  const waterY = (OCEAN_Y - offsetY) / frame.scale
  const sites = useMemo(
    () => findSurfSites(shoreline, model, terrainNodes, waterY, frame),
    [shoreline, model, terrainNodes, waterY, frame]
  )
  const view = useMemo(
    () =>
      new THREE.Sphere(
        new THREE.Vector3(config.position[0], 0, config.position[2]),
        config.radius * SURF_VIEW_REACH
      ),
    [config]
  )

  const foam = useMemo(() => new ParticlePool(SURF_FOAM_POOL), [])
  const drops = useMemo(() => new ParticlePool(SURF_DROP_POOL), [])
  const clock = useRef({ wait: 0 })

  useFrame(({ camera }, delta) => {
    if (sites.length === 0 || !isSphereInView(view, camera)) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const bursts = burstsDue(clock.current, dt, tuning.intervalMin, tuning.intervalMax)
    for (let i = 0; i < bursts; i++) emitSurfSplash(foam, drops, pickSite(sites), tuning)
  })

  return <Spray foam={foam} drops={drops} gravity={SURF_GRAVITY} />
}
