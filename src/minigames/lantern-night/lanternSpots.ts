import {
  FORWARD_RISE,
  GROUND_FORWARD,
  HEIGHT_RISE,
  SCREEN_RIGHT,
  screenAcrossOf,
  screenRiseOf,
} from '@/app/experience/cameraFraming'
import { rand } from '@/utils/math'
import { BOUNDARY_RADIUS } from '@/world/environment/boundary/constants'
import { isOpenWater } from '@/world/islands/shared/islandZones'
import {
  LANTERN_AFLOAT_COUNT,
  LANTERN_BOUNDARY_GAP,
  LANTERN_CLUSTER_ATTEMPTS,
  LANTERN_CLUSTER_BEARING_SPREAD,
  LANTERN_CLUSTER_CENTRE_MAX,
  LANTERN_CLUSTER_CENTRE_MIN,
  LANTERN_CLUSTER_GAP_ACROSS,
  LANTERN_CLUSTER_GAP_UP,
  LANTERN_CLUSTER_SPOT_ATTEMPTS,
  LANTERN_CLUSTER_SPREAD_MAX,
  LANTERN_CLUSTER_SPREAD_MIN,
  LANTERN_CLUSTER_STRETCH_MAX,
  LANTERN_FINALE_ACROSS,
  LANTERN_FINALE_GAP_ACROSS,
  LANTERN_FINALE_GAP_UP,
  LANTERN_FINALE_HIGHEST,
  LANTERN_FINALE_LOWEST,
  LANTERN_FINALE_SHIP_GAP,
  LANTERN_FINALE_SHORE_GAP,
  LANTERN_FINALE_SPOT_ATTEMPTS,
  LANTERN_NEAREST_GAP_MAX,
  LANTERN_NEAREST_GAP_MIN,
  LANTERN_NEAREST_VIEW_SHARE,
  LANTERN_SHORE_GAP,
} from './constants'
import { heightOf, RISE_LAG_HEIGHT } from './lanternFlight'
import { flock } from './lanternFlock'

export interface LanternSpot {
  x: number
  z: number
}

export interface LanternView {
  halfWidth: number
  halfHeight: number
  boost: number
}

const isClearSpot = (x: number, z: number, shoreGap: number) =>
  isOpenWater(x, z, shoreGap) && Math.hypot(x, z) < BOUNDARY_RADIUS - LANTERN_BOUNDARY_GAP

function nearestGapToward(bearing: number, { halfWidth, halfHeight }: LanternView) {
  const sideways = Math.abs(screenAcrossOf(Math.sin(bearing), Math.cos(bearing)))
  const upward = Math.abs(screenRiseOf(Math.sin(bearing), Math.cos(bearing), 0))
  const toViewEdge = Math.min(halfWidth / sideways, halfHeight / upward)
  return Math.min(
    rand(LANTERN_NEAREST_GAP_MIN, LANTERN_NEAREST_GAP_MAX),
    toViewEdge * LANTERN_NEAREST_VIEW_SHARE
  )
}

function isCrowding(x: number, z: number, spots: LanternSpot[], boost: number) {
  const across = screenAcrossOf(x, z)
  const up = screenRiseOf(x, z, 0)
  return spots.some(
    (spot) =>
      Math.abs(screenAcrossOf(spot.x, spot.z) - across) < LANTERN_CLUSTER_GAP_ACROSS * boost &&
      Math.abs(screenRiseOf(spot.x, spot.z, 0) - up) < LANTERN_CLUSTER_GAP_UP * boost
  )
}

function scatterCluster(
  shipX: number,
  shipZ: number,
  bearing: number,
  count: number,
  view: LanternView,
  needsNearest: boolean
): LanternSpot[] {
  const nearestGap = nearestGapToward(bearing, view)
  const nearest = {
    x: shipX + Math.sin(bearing) * nearestGap,
    z: shipZ + Math.cos(bearing) * nearestGap,
  }
  const isNearestClear = isClearSpot(nearest.x, nearest.z, LANTERN_SHORE_GAP)
  if (needsNearest && !isNearestClear) return []

  const spread =
    rand(LANTERN_CLUSTER_SPREAD_MIN, LANTERN_CLUSTER_SPREAD_MAX) *
    Math.sqrt(count / LANTERN_AFLOAT_COUNT)
  const stretch = rand(1, LANTERN_CLUSTER_STRETCH_MAX)
  const turn = Math.random() * Math.PI
  const centreReach =
    nearestGap + spread * rand(LANTERN_CLUSTER_CENTRE_MIN, LANTERN_CLUSTER_CENTRE_MAX)
  const centreX = shipX + Math.sin(bearing) * centreReach
  const centreZ = shipZ + Math.cos(bearing) * centreReach

  const spots = isNearestClear ? [nearest] : []
  for (let index = spots.length; index < count; index++) {
    for (let attempt = 0; attempt < LANTERN_CLUSTER_SPOT_ATTEMPTS; attempt++) {
      const angle = Math.random() * Math.PI * 2
      const reach = spread * Math.sqrt(Math.random())
      const long = Math.cos(angle) * reach * stretch
      const short = (Math.sin(angle) * reach) / stretch
      const x = centreX + Math.cos(turn) * long - Math.sin(turn) * short
      const z = centreZ + Math.sin(turn) * long + Math.cos(turn) * short
      if (
        Math.hypot(x - shipX, z - shipZ) >= nearestGap &&
        isClearSpot(x, z, LANTERN_SHORE_GAP) &&
        !isCrowding(x, z, spots, view.boost)
      ) {
        spots.push({ x, z })
        break
      }
    }
  }
  return spots
}

export function clusterSpots(
  shipX: number,
  shipZ: number,
  heading: number,
  count: number,
  view: LanternView
): LanternSpot[] {
  let best: LanternSpot[] = []
  for (let attempt = 0; attempt < LANTERN_CLUSTER_ATTEMPTS * 2; attempt++) {
    const isBoxedIn = attempt >= LANTERN_CLUSTER_ATTEMPTS
    const bearing = isBoxedIn
      ? Math.random() * Math.PI * 2
      : heading + rand(-LANTERN_CLUSTER_BEARING_SPREAD, LANTERN_CLUSTER_BEARING_SPREAD)
    const spots = scatterCluster(shipX, shipZ, bearing, count, view, !isBoxedIn)
    if (spots.length > best.length) best = spots
    if (best.length === count) break
  }
  return best
}

function wouldOverlapFlock(x: number, z: number, boost: number): boolean {
  const across = screenAcrossOf(x, z)
  const up = screenRiseOf(x, z, 0)
  const gapAcross = LANTERN_FINALE_GAP_ACROSS * boost
  const gapUp = LANTERN_FINALE_GAP_UP * boost
  const catchingUp = RISE_LAG_HEIGHT * HEIGHT_RISE
  return flock.some((lantern) => {
    const lanternX = lantern.x + lantern.driftX
    const lanternZ = lantern.z + lantern.driftZ
    if (Math.abs(screenAcrossOf(lanternX, lanternZ) - across) >= gapAcross) return false
    const above = screenRiseOf(lanternX, lanternZ, heightOf(lantern)) - up
    return above < gapUp && above + catchingUp > -gapUp
  })
}

export function finaleSpot(
  shipX: number,
  shipZ: number,
  { halfWidth, halfHeight, boost }: LanternView
): LanternSpot | null {
  for (let attempt = 0; attempt < LANTERN_FINALE_SPOT_ATTEMPTS; attempt++) {
    const across = rand(-LANTERN_FINALE_ACROSS, LANTERN_FINALE_ACROSS) * halfWidth
    const along = (rand(LANTERN_FINALE_LOWEST, LANTERN_FINALE_HIGHEST) * halfHeight) / FORWARD_RISE
    const x = shipX + SCREEN_RIGHT.x * across + GROUND_FORWARD.x * along
    const z = shipZ + SCREEN_RIGHT.z * across + GROUND_FORWARD.y * along
    if (
      isClearSpot(x, z, LANTERN_FINALE_SHORE_GAP) &&
      Math.hypot(x - shipX, z - shipZ) > LANTERN_FINALE_SHIP_GAP &&
      !wouldOverlapFlock(x, z, boost)
    ) {
      return { x, z }
    }
  }
  return null
}
