import * as THREE from 'three'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { rand } from '@/utils/math'
import { isSphereInView } from '@/utils/screen'
import type { ParticlePool } from '@/world/effects/particlePool'
import { SHORE_Y } from '@/world/shore/constants'
import type { ShoreField } from '@/world/shore/shoreField'
import { nightGlow } from '../shared/nightGlow'
import {
  WHIRLPOOL_FADE_START,
  WHIRLPOOL_GLOW_COLOR,
  WHIRLPOOL_RADIUS,
  WHIRLPOOL_SHORE_BLEND,
  WHIRLPOOL_SPLASH_CARRY,
  WHIRLPOOL_SPLASH_DROP_SIZE,
  WHIRLPOOL_SPLASH_DROPS,
  WHIRLPOOL_SPLASH_FOAM_BLOBS,
  WHIRLPOOL_SPLASH_FOAM_LIFE,
  WHIRLPOOL_SPLASH_FOAM_SIZE,
  WHIRLPOOL_SPLASH_FOAM_Y,
  WHIRLPOOL_SPLASH_MIN_IMPACT,
  WHIRLPOOL_SPLASH_RECOIL,
  WHIRLPOOL_SPLASH_RISE,
  WHIRLPOOL_SPLASH_SITE_BAND,
  WHIRLPOOL_SPLASH_Y,
  WHIRLPOOL_SPRAY_DROP_SIZE,
  WHIRLPOOL_SPRAY_DROPS,
  WHIRLPOOL_SPRAY_FOAM_BLOBS,
  WHIRLPOOL_SPRAY_INNER,
  WHIRLPOOL_SPRAY_NIGHT_TINT,
  WHIRLPOOL_SPRAY_OUTER,
  WHIRLPOOL_SPRAY_RISE,
  WHIRLPOOL_SPRAY_SITE_STEP,
  WHIRLPOOL_SPRAY_SPEED,
  WHIRLPOOL_SPRAY_VIEW_REACH,
  WHIRLPOOL_TWIST,
} from './constants'
import { funnelDip, whirlpoolDip } from './whirlpoolFunnel'
import { TIMEWELL_BASIN } from './shoreProfile'

export interface SiteFrame {
  originX: number
  originZ: number
  facing: number
  scale: number
}

export interface SplashSite {
  x: number
  z: number
  awayX: number
  awayZ: number
  flowX: number
  flowZ: number
  impact: number
}

export interface SpraySite {
  x: number
  y: number
  z: number
  flowX: number
  flowZ: number
}

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

function turnToIsland(frame: SiteFrame, x: number, z: number): [number, number] {
  const cos = Math.cos(frame.facing)
  const sin = Math.sin(frame.facing)
  return [x * cos + z * sin, z * cos - x * sin]
}

function placeOnIsland(frame: SiteFrame, x: number, z: number): [number, number] {
  const [turnedX, turnedZ] = turnToIsland(frame, x, z)
  return [frame.originX + turnedX * frame.scale, frame.originZ + turnedZ * frame.scale]
}

function scanShore(
  shoreline: ShoreField,
  step: number,
  visit: (x: number, z: number, cell: number) => void
): void {
  const { resolution, size, centerX, centerZ } = shoreline
  for (let row = 1; row < resolution - 1; row += step) {
    for (let column = 1; column < resolution - 1; column += step) {
      visit(
        centerX + ((column + 0.5) / resolution - 0.5) * size,
        centerZ + ((row + 0.5) / resolution - 0.5) * size,
        row * resolution + column
      )
    }
  }
}

// ── Sites ─────────────────────────────────────────────────────────────────────

export function findSplashSites(
  shoreline: ShoreField,
  center: THREE.Vector3,
  frame: SiteFrame
): SplashSite[] {
  const { distances, resolution } = shoreline
  const band = WHIRLPOOL_SPLASH_SITE_BAND / frame.scale
  const reach = WHIRLPOOL_RADIUS * WHIRLPOOL_FADE_START
  const [eyeX, eyeZ] = eyeOf(center)
  const sites: SplashSite[] = []

  scanShore(shoreline, 1, (x, z, cell) => {
    if (distances[cell] < 0 || distances[cell] > band) return
    if (Math.hypot(x - eyeX, z - eyeZ) > reach) return

    const slopeX = distances[cell + 1] - distances[cell - 1]
    const slopeZ = distances[cell + resolution] - distances[cell - resolution]
    const steepness = Math.hypot(slopeX, slopeZ)
    if (steepness === 0) return

    const awayX = slopeX / steepness
    const awayZ = slopeZ / steepness
    const [flowX, flowZ] = swirlFlow(x - eyeX, z - eyeZ)
    const impact = -(flowX * awayX + flowZ * awayZ)
    if (impact < WHIRLPOOL_SPLASH_MIN_IMPACT) return

    const [siteX, siteZ] = placeOnIsland(frame, x, z)
    const [awayOnIslandX, awayOnIslandZ] = turnToIsland(frame, awayX, awayZ)
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

export function burstsDue(clock: { wait: number }, dt: number, min: number, max: number): number {
  clock.wait -= dt
  let bursts = 0
  while (clock.wait <= 0) {
    clock.wait += rand(min, max)
    bursts++
  }
  return bursts
}

export function emitRockSplash(foam: ParticlePool, drops: ParticlePool, site: SplashSite): void {
  const strength = (0.6 + 0.4 * site.impact) * rand(0.8, 1.2)

  for (let i = 0; i < WHIRLPOOL_SPLASH_DROPS; i++) {
    const recoil = WHIRLPOOL_SPLASH_RECOIL * rand(0.3, 1.3) * strength
    const carry = WHIRLPOOL_SPLASH_CARRY * rand(-0.4, 1)
    drops.spawn(
      site.x + rand(-1, 1),
      WHIRLPOOL_SPLASH_Y,
      site.z + rand(-1, 1),
      site.awayX * recoil + site.flowX * carry,
      WHIRLPOOL_SPLASH_RISE * rand(0.6, 1.2) * strength,
      site.awayZ * recoil + site.flowZ * carry,
      WHIRLPOOL_SPLASH_DROP_SIZE * rand(0.6, 1.3),
      3
    )
  }

  for (let i = 0; i < WHIRLPOOL_SPLASH_FOAM_BLOBS; i++) {
    const sweep = rand(-0.7, 0.7)
    const speed = WHIRLPOOL_SPLASH_RECOIL * rand(0.5, 1.1) * strength
    foam.spawn(
      site.x + site.awayX * 0.8,
      WHIRLPOOL_SPLASH_FOAM_Y,
      site.z + site.awayZ * 0.8,
      (site.awayX + site.flowX * sweep) * speed,
      0,
      (site.awayZ + site.flowZ * sweep) * speed,
      WHIRLPOOL_SPLASH_FOAM_SIZE * rand(0.8, 1.4),
      WHIRLPOOL_SPLASH_FOAM_LIFE * rand(0.8, 1.2)
    )
  }
}

export function emitSwirlSpray(foam: ParticlePool, drops: ParticlePool, site: SpraySite): void {
  for (let i = 0; i < WHIRLPOOL_SPRAY_DROPS; i++) {
    const speed = WHIRLPOOL_SPRAY_SPEED * rand(0.6, 1.2)
    drops.spawn(
      site.x + rand(-0.6, 0.6),
      site.y + WHIRLPOOL_SPLASH_Y,
      site.z + rand(-0.6, 0.6),
      site.flowX * speed + rand(-1.5, 1.5),
      WHIRLPOOL_SPRAY_RISE * rand(0.6, 1.2),
      site.flowZ * speed + rand(-1.5, 1.5),
      WHIRLPOOL_SPRAY_DROP_SIZE * rand(0.6, 1.3),
      3
    )
  }

  for (let i = 0; i < WHIRLPOOL_SPRAY_FOAM_BLOBS; i++) {
    const drift = WHIRLPOOL_SPRAY_SPEED * rand(0.2, 0.5)
    foam.spawn(
      site.x + rand(-0.8, 0.8),
      site.y + WHIRLPOOL_SPLASH_FOAM_Y,
      site.z + rand(-0.8, 0.8),
      site.flowX * drift,
      0,
      site.flowZ * drift,
      WHIRLPOOL_SPLASH_FOAM_SIZE * rand(0.6, 1.1),
      WHIRLPOOL_SPLASH_FOAM_LIFE * rand(0.6, 1)
    )
  }
}

// ── Spray look ────────────────────────────────────────────────────────────────

const _sprayReach = new THREE.Sphere()

export const MAGIC_SPRAY = new THREE.Color(WHIRLPOOL_GLOW_COLOR)
export const magicSprayAt = () => nightGlow() * WHIRLPOOL_SPRAY_NIGHT_TINT
export const funnelSurfaceAt = (x: number, z: number) => SHORE_Y - whirlpoolDip(x, z)
export const pickSite = <T>(sites: T[]) => sites[Math.floor(Math.random() * sites.length)]

export function isSprayInView(camera: THREE.Camera): boolean {
  const whirlpool = useWhirlpoolStore.getState()
  _sprayReach.center.set(whirlpool.x, 0, whirlpool.z)
  _sprayReach.radius = whirlpool.radius * WHIRLPOOL_SPRAY_VIEW_REACH
  return whirlpool.active && isSphereInView(_sprayReach, camera)
}
