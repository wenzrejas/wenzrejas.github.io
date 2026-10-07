import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { ParticlePool } from '@/world/effects/particlePool'
import Spray from '@/world/effects/Spray'
import type { ShoreField } from '@/world/shore/shoreField'
import type { IslandPlacement } from '../shared/islandTransform'
import { burstsDue, pickSite, useSiteFrame } from '../shared/shoreSites'
import {
  WHIRLPOOL_SPLASH_DROP_POOL,
  WHIRLPOOL_SPLASH_FOAM_POOL,
  WHIRLPOOL_SPLASH_GRAVITY,
  WHIRLPOOL_SPLASH_INTERVAL_MAX,
  WHIRLPOOL_SPLASH_INTERVAL_MIN,
  WHIRLPOOL_SPRAY_DROP_POOL,
  WHIRLPOOL_SPRAY_FOAM_POOL,
  WHIRLPOOL_SPRAY_INTERVAL_MAX,
  WHIRLPOOL_SPRAY_INTERVAL_MIN,
} from './constants'
import {
  MAGIC_SPRAY,
  emitRockSplash,
  emitSwirlSpray,
  findSplashSites,
  findSpraySites,
  funnelSurfaceAt,
  isSprayInView,
  magicSprayAt,
} from './sprayBursts'

interface WhirlpoolSprayProps {
  shoreline: ShoreField
  center: THREE.Vector3
  placement: IslandPlacement
}

export default function WhirlpoolSpray({ shoreline, center, placement }: WhirlpoolSprayProps) {
  const frame = useSiteFrame(placement)
  const rockSites = useMemo(
    () => findSplashSites(shoreline, center, frame),
    [shoreline, center, frame]
  )
  const swirlSites = useMemo(
    () => findSpraySites(shoreline, center, frame),
    [shoreline, center, frame]
  )

  const splashFoam = useMemo(() => new ParticlePool(WHIRLPOOL_SPLASH_FOAM_POOL), [])
  const splashDrops = useMemo(() => new ParticlePool(WHIRLPOOL_SPLASH_DROP_POOL), [])
  const sprayFoam = useMemo(() => new ParticlePool(WHIRLPOOL_SPRAY_FOAM_POOL), [])
  const sprayDrops = useMemo(() => new ParticlePool(WHIRLPOOL_SPRAY_DROP_POOL), [])
  const splashClock = useRef({ wait: 0 })
  const sprayClock = useRef({ wait: 0 })

  useFrame(({ camera }, delta) => {
    if (!isSprayInView(camera)) return

    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    if (rockSites.length > 0) {
      const bursts = burstsDue(
        splashClock.current,
        dt,
        WHIRLPOOL_SPLASH_INTERVAL_MIN,
        WHIRLPOOL_SPLASH_INTERVAL_MAX
      )
      for (let i = 0; i < bursts; i++) emitRockSplash(splashFoam, splashDrops, pickSite(rockSites))
    }
    if (swirlSites.length > 0) {
      const bursts = burstsDue(
        sprayClock.current,
        dt,
        WHIRLPOOL_SPRAY_INTERVAL_MIN,
        WHIRLPOOL_SPRAY_INTERVAL_MAX
      )
      for (let i = 0; i < bursts; i++) emitSwirlSpray(sprayFoam, sprayDrops, pickSite(swirlSites))
    }
  })

  return (
    <>
      <Spray
        foam={splashFoam}
        drops={splashDrops}
        gravity={WHIRLPOOL_SPLASH_GRAVITY}
        tint={MAGIC_SPRAY}
        tintAt={magicSprayAt}
      />
      <Spray
        foam={sprayFoam}
        drops={sprayDrops}
        gravity={WHIRLPOOL_SPLASH_GRAVITY}
        surfaceAt={funnelSurfaceAt}
        tint={MAGIC_SPRAY}
        tintAt={magicSprayAt}
      />
    </>
  )
}
