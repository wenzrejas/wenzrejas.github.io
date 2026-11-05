import * as THREE from 'three'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { rand } from '@/utils/math'
import { isSphereInView } from '@/utils/screen'
import type { ParticlePool } from '@/world/effects/particlePool'
import { SHORE_Y } from '@/world/shore/constants'
import { outwardAt, type ShoreField } from '@/world/shore/shoreField'
import { nightGlow } from '../shared/nightGlow'
import { placeOnIsland, scanShore, turnToIsland, type SiteFrame } from '../shared/shoreSites'
import {
  WHIRLPOOL_DROP_LIFE,
  WHIRLPOOL_FADE_START,
  WHIRLPOOL_GLOW_COLOR,
  WHIRLPOOL_RADIUS,
  WHIRLPOOL_SHORE_BLEND,
  WHIRLPOOL_SPLASH_CARRY,
  WHIRLPOOL_SPLASH_CARRY_JITTER,
  WHIRLPOOL_SPLASH_DROP_SIZE,
  WHIRLPOOL_SPLASH_DROP_SIZE_JITTER,
  WHIRLPOOL_SPLASH_DROPS,
  WHIRLPOOL_SPLASH_FOAM_BLOBS,
  WHIRLPOOL_SPLASH_FOAM_LEAD,
  WHIRLPOOL_SPLASH_FOAM_LIFE,
  WHIRLPOOL_SPLASH_FOAM_LIFE_JITTER,
  WHIRLPOOL_SPLASH_FOAM_SIZE,
  WHIRLPOOL_SPLASH_FOAM_SIZE_JITTER,
  WHIRLPOOL_SPLASH_FOAM_SPEED_JITTER,
  WHIRLPOOL_SPLASH_FOAM_SWEEP,
  WHIRLPOOL_SPLASH_FOAM_Y,
  WHIRLPOOL_SPLASH_MIN_IMPACT,
  WHIRLPOOL_SPLASH_RECOIL,
  WHIRLPOOL_SPLASH_RECOIL_JITTER,
  WHIRLPOOL_SPLASH_RISE,
  WHIRLPOOL_SPLASH_RISE_JITTER,
  WHIRLPOOL_SPLASH_SCATTER,
  WHIRLPOOL_SPLASH_SITE_BAND,
  WHIRLPOOL_SPLASH_STRENGTH_BASE,
  WHIRLPOOL_SPLASH_STRENGTH_JITTER,
  WHIRLPOOL_SPLASH_STRENGTH_PER_IMPACT,
  WHIRLPOOL_SPLASH_Y,
  WHIRLPOOL_SPRAY_DROP_SIZE,
  WHIRLPOOL_SPRAY_DROP_SIZE_JITTER,
  WHIRLPOOL_SPRAY_DROPS,
  WHIRLPOOL_SPRAY_FOAM_BLOBS,
  WHIRLPOOL_SPRAY_FOAM_DRIFT_JITTER,
  WHIRLPOOL_SPRAY_FOAM_LIFE_JITTER,
  WHIRLPOOL_SPRAY_FOAM_SCATTER,
  WHIRLPOOL_SPRAY_FOAM_SIZE_JITTER,
  WHIRLPOOL_SPRAY_INNER,
  WHIRLPOOL_SPRAY_NIGHT_TINT,
  WHIRLPOOL_SPRAY_OUTER,
  WHIRLPOOL_SPRAY_RISE,
  WHIRLPOOL_SPRAY_RISE_JITTER,
  WHIRLPOOL_SPRAY_SCATTER,
  WHIRLPOOL_SPRAY_SIDE_DRIFT,
  WHIRLPOOL_SPRAY_SITE_STEP,
  WHIRLPOOL_SPRAY_SPEED,
  WHIRLPOOL_SPRAY_SPEED_JITTER,
  WHIRLPOOL_SPRAY_VIEW_REACH,
  WHIRLPOOL_TWIST,
} from './constants'
import { funnelDip, whirlpoolDip } from './whirlpoolFunnel'
import { TIMEWELL_BASIN } from './shoreProfile'

interface SplashSite {
  x: number
  z: number
  awayX: number
  awayZ: number
  flowX: number
  flowZ: number
  impact: number
}

interface SpraySite {
  x: number
  y: number
  z: number
  flowX: number
  flowZ: number
}

const _away = new THREE.Vector2()

// ── Frame ─────────────────────────────────────────────────────────────────────

const eyeOf = (center: THREE.Vector3): [number, number] => [
  center.x + TIMEWELL_BASIN.x,
  center.z + TIMEWELL_BASIN.z,
]

function swirlFlow(offsetX: number, offsetZ: number): [number, number] {
  const x = WHIRLPOOL_TWIST * offsetZ - offsetX
  const z = -WHIRLPOOL_TWIST * offsetX - offsetZ
  const length = Math.hypot(x, z) || 1
  return [x / length, z / length]
}

// ── Sites ─────────────────────────────────────────────────────────────────────

export function findSplashSites(
  shoreline: ShoreField,
  center: THREE.Vector3,
  frame: SiteFrame
): SplashSite[] {
  const { distances } = shoreline
  const band = WHIRLPOOL_SPLASH_SITE_BAND / frame.scale
  const reach = WHIRLPOOL_RADIUS * WHIRLPOOL_FADE_START
  const [eyeX, eyeZ] = eyeOf(center)
  const sites: SplashSite[] = []

  scanShore(shoreline, 1, (x, z, cell) => {
    if (distances[cell] < 0 || distances[cell] > band) return
    if (Math.hypot(x - eyeX, z - eyeZ) > reach) return

    const away = outwardAt(shoreline, cell, _away)
    if (away.lengthSq() === 0) return

    const [flowX, flowZ] = swirlFlow(x - eyeX, z - eyeZ)
    const impact = -(flowX * away.x + flowZ * away.y)
    if (impact < WHIRLPOOL_SPLASH_MIN_IMPACT) return

    const [siteX, siteZ] = placeOnIsland(frame, x, z)
    const [awayOnIslandX, awayOnIslandZ] = turnToIsland(frame, away.x, away.y)
    const [flowOnIslandX, flowOnIslandZ] = turnToIsland(frame, flowX, flowZ)
    sites.push({
      x: siteX,
      z: siteZ,
      awayX: awayOnIslandX,
      awayZ: awayOnIslandZ,
      flowX: flowOnIslandX,
      flowZ: flowOnIslandZ,
      impact,
    })
  })
  return sites
}

export function findSpraySites(
  shoreline: ShoreField,
  center: THREE.Vector3,
  frame: SiteFrame
): SpraySite[] {
  const { distances } = shoreline
  const clearance = WHIRLPOOL_SHORE_BLEND / frame.scale
  const [eyeX, eyeZ] = eyeOf(center)
  const sites: SpraySite[] = []

  scanShore(shoreline, WHIRLPOOL_SPRAY_SITE_STEP, (x, z, cell) => {
    if (distances[cell] < clearance) return
    const share = Math.hypot(x - eyeX, z - eyeZ) / WHIRLPOOL_RADIUS
    if (share < WHIRLPOOL_SPRAY_INNER || share > WHIRLPOOL_SPRAY_OUTER) return

    const [siteX, siteZ] = placeOnIsland(frame, x, z)
    const [flowX, flowZ] = turnToIsland(frame, ...swirlFlow(x - eyeX, z - eyeZ))
    sites.push({
      x: siteX,
      y: SHORE_Y - funnelDip(share) * WHIRLPOOL_RADIUS * frame.scale,
      z: siteZ,
      flowX,
      flowZ,
    })
  })
  return sites
}

// ── Bursts ────────────────────────────────────────────────────────────────────

export function emitRockSplash(foam: ParticlePool, drops: ParticlePool, site: SplashSite): void {
  const strength =
    (WHIRLPOOL_SPLASH_STRENGTH_BASE + WHIRLPOOL_SPLASH_STRENGTH_PER_IMPACT * site.impact) *
    rand(...WHIRLPOOL_SPLASH_STRENGTH_JITTER)

  for (let i = 0; i < WHIRLPOOL_SPLASH_DROPS; i++) {
    const recoil = WHIRLPOOL_SPLASH_RECOIL * rand(...WHIRLPOOL_SPLASH_RECOIL_JITTER) * strength
    const carry = WHIRLPOOL_SPLASH_CARRY * rand(...WHIRLPOOL_SPLASH_CARRY_JITTER)
    drops.spawn(
      site.x + rand(-WHIRLPOOL_SPLASH_SCATTER, WHIRLPOOL_SPLASH_SCATTER),
      WHIRLPOOL_SPLASH_Y,
      site.z + rand(-WHIRLPOOL_SPLASH_SCATTER, WHIRLPOOL_SPLASH_SCATTER),
      site.awayX * recoil + site.flowX * carry,
      WHIRLPOOL_SPLASH_RISE * rand(...WHIRLPOOL_SPLASH_RISE_JITTER) * strength,
      site.awayZ * recoil + site.flowZ * carry,
      WHIRLPOOL_SPLASH_DROP_SIZE * rand(...WHIRLPOOL_SPLASH_DROP_SIZE_JITTER),
      WHIRLPOOL_DROP_LIFE
    )
  }

  for (let i = 0; i < WHIRLPOOL_SPLASH_FOAM_BLOBS; i++) {
    const sweep = rand(-WHIRLPOOL_SPLASH_FOAM_SWEEP, WHIRLPOOL_SPLASH_FOAM_SWEEP)
    const speed = WHIRLPOOL_SPLASH_RECOIL * rand(...WHIRLPOOL_SPLASH_FOAM_SPEED_JITTER) * strength
    foam.spawn(
      site.x + site.awayX * WHIRLPOOL_SPLASH_FOAM_LEAD,
      WHIRLPOOL_SPLASH_FOAM_Y,
      site.z + site.awayZ * WHIRLPOOL_SPLASH_FOAM_LEAD,
      (site.awayX + site.flowX * sweep) * speed,
      0,
      (site.awayZ + site.flowZ * sweep) * speed,
      WHIRLPOOL_SPLASH_FOAM_SIZE * rand(...WHIRLPOOL_SPLASH_FOAM_SIZE_JITTER),
      WHIRLPOOL_SPLASH_FOAM_LIFE * rand(...WHIRLPOOL_SPLASH_FOAM_LIFE_JITTER)
    )
  }
}

export function emitSwirlSpray(foam: ParticlePool, drops: ParticlePool, site: SpraySite): void {
  for (let i = 0; i < WHIRLPOOL_SPRAY_DROPS; i++) {
    const speed = WHIRLPOOL_SPRAY_SPEED * rand(...WHIRLPOOL_SPRAY_SPEED_JITTER)
    drops.spawn(
      site.x + rand(-WHIRLPOOL_SPRAY_SCATTER, WHIRLPOOL_SPRAY_SCATTER),
      site.y + WHIRLPOOL_SPLASH_Y,
      site.z + rand(-WHIRLPOOL_SPRAY_SCATTER, WHIRLPOOL_SPRAY_SCATTER),
      site.flowX * speed + rand(-WHIRLPOOL_SPRAY_SIDE_DRIFT, WHIRLPOOL_SPRAY_SIDE_DRIFT),
      WHIRLPOOL_SPRAY_RISE * rand(...WHIRLPOOL_SPRAY_RISE_JITTER),
      site.flowZ * speed + rand(-WHIRLPOOL_SPRAY_SIDE_DRIFT, WHIRLPOOL_SPRAY_SIDE_DRIFT),
      WHIRLPOOL_SPRAY_DROP_SIZE * rand(...WHIRLPOOL_SPRAY_DROP_SIZE_JITTER),
      WHIRLPOOL_DROP_LIFE
    )
  }

  for (let i = 0; i < WHIRLPOOL_SPRAY_FOAM_BLOBS; i++) {
    const drift = WHIRLPOOL_SPRAY_SPEED * rand(...WHIRLPOOL_SPRAY_FOAM_DRIFT_JITTER)
    foam.spawn(
      site.x + rand(-WHIRLPOOL_SPRAY_FOAM_SCATTER, WHIRLPOOL_SPRAY_FOAM_SCATTER),
      site.y + WHIRLPOOL_SPLASH_FOAM_Y,
      site.z + rand(-WHIRLPOOL_SPRAY_FOAM_SCATTER, WHIRLPOOL_SPRAY_FOAM_SCATTER),
      site.flowX * drift,
      0,
      site.flowZ * drift,
      WHIRLPOOL_SPLASH_FOAM_SIZE * rand(...WHIRLPOOL_SPRAY_FOAM_SIZE_JITTER),
      WHIRLPOOL_SPLASH_FOAM_LIFE * rand(...WHIRLPOOL_SPRAY_FOAM_LIFE_JITTER)
    )
  }
}

// ── Spray look ────────────────────────────────────────────────────────────────

const _sprayReach = new THREE.Sphere()

export const MAGIC_SPRAY = new THREE.Color(WHIRLPOOL_GLOW_COLOR)
export const magicSprayAt = () => nightGlow() * WHIRLPOOL_SPRAY_NIGHT_TINT
export const funnelSurfaceAt = (x: number, z: number) => SHORE_Y - whirlpoolDip(x, z)

export function isSprayInView(camera: THREE.Camera): boolean {
  const whirlpool = useWhirlpoolStore.getState()
  _sprayReach.center.set(whirlpool.x, 0, whirlpool.z)
  _sprayReach.radius = whirlpool.radius * WHIRLPOOL_SPRAY_VIEW_REACH
  return whirlpool.active && isSphereInView(_sprayReach, camera)
}
