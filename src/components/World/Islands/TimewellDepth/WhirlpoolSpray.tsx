import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWhirlpoolStore } from '../../../../store/whirlpoolStore'
import { isSphereInView } from '../../../../utils/screen'
import { whirlpoolDip } from '../../../../utils/whirlpoolFunnel'
import { ParticlePool } from '../../Effects/particlePool'
import Spray from '../../Effects/Spray'
import { SHORE_Y } from '../../Shore/constants'
import type { ShoreField } from '../../Shore/shoreField'
import type { IslandPlacement } from '../islandTransform'
import { nightGlow } from '../nightGlow'
import {
  WHIRLPOOL_GLOW_COLOR,
  WHIRLPOOL_SPLASH_DROP_POOL,
  WHIRLPOOL_SPLASH_FOAM_POOL,
  WHIRLPOOL_SPLASH_GRAVITY,
  WHIRLPOOL_SPLASH_INTERVAL_MAX,
  WHIRLPOOL_SPLASH_INTERVAL_MIN,
  WHIRLPOOL_SPRAY_DROP_POOL,
  WHIRLPOOL_SPRAY_FOAM_POOL,
  WHIRLPOOL_SPRAY_INTERVAL_MAX,
  WHIRLPOOL_SPRAY_INTERVAL_MIN,
  WHIRLPOOL_SPRAY_NIGHT_TINT,
  WHIRLPOOL_SPRAY_VIEW_REACH,
} from './constants'
import {
  burstsDue,
  emitRockSplash,
  emitSwirlSpray,
  findSplashSites,
  findSpraySites,
} from './sprayBursts'

interface WhirlpoolSprayProps {
  shoreline: ShoreField
  center: THREE.Vector3
  placement: IslandPlacement
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

const MAGIC_SPRAY = new THREE.Color(WHIRLPOOL_GLOW_COLOR)
const magicSprayAt = () => nightGlow() * WHIRLPOOL_SPRAY_NIGHT_TINT
const funnelSurfaceAt = (x: number, z: number) => SHORE_Y - whirlpoolDip(x, z)

const _sprayReach = new THREE.Sphere()

export default function WhirlpoolSpray({ shoreline, center, placement }: WhirlpoolSprayProps) {
  const [originX, , originZ] = placement.position
  const facing = placement.rotation[1]
  const { scale } = placement

  const frame = useMemo(
    () => ({ originX, originZ, facing, scale }),
    [originX, originZ, facing, scale]
  )
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
    const whirlpool = useWhirlpoolStore.getState()
    _sprayReach.center.set(whirlpool.x, 0, whirlpool.z)
    _sprayReach.radius = whirlpool.radius * WHIRLPOOL_SPRAY_VIEW_REACH
    if (!whirlpool.active || !isSphereInView(_sprayReach, camera)) return

    const dt = Math.min(delta, 0.05)
    if (rockSites.length > 0) {
      const bursts = burstsDue(
        splashClock.current,
        dt,
        WHIRLPOOL_SPLASH_INTERVAL_MIN,
        WHIRLPOOL_SPLASH_INTERVAL_MAX
      )
      for (let i = 0; i < bursts; i++) emitRockSplash(splashFoam, splashDrops, pick(rockSites))
    }
    if (swirlSites.length > 0) {
      const bursts = burstsDue(
        sprayClock.current,
        dt,
        WHIRLPOOL_SPRAY_INTERVAL_MIN,
        WHIRLPOOL_SPRAY_INTERVAL_MAX
      )
      for (let i = 0; i < bursts; i++) emitSwirlSpray(sprayFoam, sprayDrops, pick(swirlSites))
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
