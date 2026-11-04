import {
  FORWARD_RISE,
  GROUND_FORWARD,
  screenAcrossOf,
  screenRiseOf,
} from '@/app/experience/cameraFraming'
import { isGraphicsSharp } from '@/store/settingsStore'
import { isSheetLayout } from '@/utils/layout'
import { rand } from '@/utils/math'
import { BOUNDARY_RADIUS } from '@/world/environment/boundary/constants'
import { isOpenWater } from '@/world/islands/shared/islandZones'
import { isBlockedByIsland } from '@/world/wildlife/algae/patches'
import { bloom, type Jelly, type JellyPatch } from './bloomState'
import {
  JELLY_AREA_EACH,
  JELLY_BATCH_SECONDS,
  JELLY_BATCH_SIZE,
  JELLY_BATCH_SPREAD_SECONDS,
  JELLY_CLEAR_OF_SHIP,
  JELLY_COUNT,
  JELLY_COUNT_SMOOTH,
  JELLY_DEEPEST,
  JELLY_LARGEST_RADIUS,
  JELLY_PATCH_APART,
  JELLY_PATCH_BESIDE_SHIP_MAX,
  JELLY_PATCH_BESIDE_SHIP_MIN,
  JELLY_PATCH_BESIDE_SHIP_SHARE,
  JELLY_PATCH_BESIDE_SHIP_SPREAD,
  JELLY_PATCH_BEYOND_VIEW,
  JELLY_PATCH_EDGE_REACH,
  JELLY_PATCH_EDGE_SPACING,
  JELLY_PATCH_LUMPS,
  JELLY_PATCH_RADIUS_MAX,
  JELLY_PATCH_RADIUS_MIN,
  JELLY_PATCH_SMALLEST,
  JELLY_PATCH_SPOT_ATTEMPTS,
  JELLY_PLACED_PER_FRAME,
  JELLY_SHALLOWEST,
  JELLY_SHORE_GAP,
  JELLY_SMALLEST_RADIUS,
  JELLY_SPOT_ATTEMPTS,
} from './constants'

const lumpsAt = (patch: JellyPatch, angle: number) =>
  JELLY_PATCH_LUMPS.reduce(
    (shape, { waves, size }, index) =>
      shape + Math.sin(angle * waves + patch.lumpTurns[index]) * size,
    1
  )

function roomAround(x: number, z: number, jelly: Jelly, patch: JellyPatch, roomToBeat: number) {
  const across = screenAcrossOf(x, z)
  const up = screenRiseOf(x, z, -jelly.depth)
  let room = Infinity
  for (let index = 0; index < patch.jellies.length && room > roomToBeat; index++) {
    const other = patch.jellies[index]
    if (other === jelly) continue
    const gapAcross = screenAcrossOf(other.x, other.z) - across
    const gapUp = screenRiseOf(other.x, other.z, -other.depth) - up
    room = Math.min(room, gapAcross * gapAcross + gapUp * gapUp)
  }
  return room
}

export function settleInPatch(jelly: Jelly, patch: JellyPatch, shipX: number, shipZ: number) {
  let mostRoom = -1
  let bestX = patch.x
  let bestZ = patch.z
  for (let attempt = 0; attempt < JELLY_SPOT_ATTEMPTS; attempt++) {
    const angle = Math.random() * Math.PI * 2
    const edgeShare = Math.sqrt(Math.random())
    const reach = patch.radius * lumpsAt(patch, angle) * edgeShare
    const x = patch.x + Math.sin(angle) * reach
    const z = patch.z + Math.cos(angle) * reach
    if (Math.hypot(x - shipX, z - shipZ) <= JELLY_CLEAR_OF_SHIP) continue
    if (!isOpenWater(x, z, JELLY_SHORE_GAP)) continue
    const spacing = 1 + (JELLY_PATCH_EDGE_SPACING - 1) * edgeShare * edgeShare
    const spread = spacing * spacing
    const room = roomAround(x, z, jelly, patch, mostRoom * spread) / spread
    if (room > mostRoom) {
      mostRoom = room
      bestX = x
      bestZ = z
    }
  }
  jelly.x = bestX
  jelly.z = bestZ
}

const newJelly = (index: number): Jelly => ({
  x: 0,
  z: 0,
  radius: rand(JELLY_SMALLEST_RADIUS, JELLY_LARGEST_RADIUS),
  depth: rand(JELLY_SHALLOWEST, JELLY_DEEPEST),
  seed: Math.random(),
  wakeAt:
    Math.floor(index / JELLY_BATCH_SIZE) * JELLY_BATCH_SECONDS +
    Math.random() * JELLY_BATCH_SPREAD_SECONDS,
  rise: 0,
  brush: 'none',
  clearSeconds: 0,
  returnSeconds: 0,
})

export function placeNextFew(shipX: number, shipZ: number) {
  const patch = bloom.patches.find(({ jellies, size }) => jellies.length < size)
  if (!patch) return
  const upTo = Math.min(patch.jellies.length + JELLY_PLACED_PER_FRAME, patch.size)
  while (patch.jellies.length < upTo) {
    const jelly = newJelly(patch.jellies.length)
    settleInPatch(jelly, patch, shipX, shipZ)
    patch.jellies.push(jelly)
  }
}

function spacesLeft() {
  const used = bloom.patches.reduce((sum, { size }) => sum + size, 0)
  return (isGraphicsSharp() ? JELLY_COUNT : JELLY_COUNT_SMOOTH) - used
}

const isOverAnotherPatch = (x: number, z: number, radius: number) =>
  bloom.patches.some(
    (other) =>
      Math.hypot(x - other.x, z - other.z) <
      (radius + other.radius) * JELLY_PATCH_EDGE_REACH + JELLY_PATCH_APART
  )

const isClearForPatch = (x: number, z: number, radius: number) =>
  Math.hypot(x, z) + radius * JELLY_PATCH_EDGE_REACH < BOUNDARY_RADIUS &&
  !isBlockedByIsland(x, z, radius) &&
  !isOverAnotherPatch(x, z, radius)

function addPatch(
  shipX: number,
  shipZ: number,
  boost: number,
  bearingFor: () => number,
  distanceFor: (radius: number) => number
) {
  for (let attempt = 0; attempt < JELLY_PATCH_SPOT_ATTEMPTS; attempt++) {
    const radius = rand(JELLY_PATCH_RADIUS_MIN, JELLY_PATCH_RADIUS_MAX)
    const angle = bearingFor()
    const distance = distanceFor(radius)
    const x = shipX + Math.sin(angle) * distance
    const z = shipZ + Math.cos(angle) * distance
    if (!isClearForPatch(x, z, radius)) continue
    const fitting = (Math.PI * radius * radius * FORWARD_RISE) / (JELLY_AREA_EACH * boost * boost)
    const size = Math.min(Math.floor(fitting), spacesLeft())
    if (size < JELLY_PATCH_SMALLEST) return
    bloom.patches.push({
      x,
      z,
      radius,
      lumpTurns: JELLY_PATCH_LUMPS.map(() => Math.random() * Math.PI * 2),
      size,
      lastWake:
        Math.floor((size - 1) / JELLY_BATCH_SIZE) * JELLY_BATCH_SECONDS +
        JELLY_BATCH_SPREAD_SECONDS,
      age: 0,
      isInView: false,
      jellies: [],
    })
    return
  }
}

const SCREEN_UP_BEARING = Math.atan2(GROUND_FORWARD.x, GROUND_FORWARD.y)

const aboveOrBelowOnScreen = () =>
  SCREEN_UP_BEARING +
  (isSheetLayout() || Math.random() < 0.5 ? 0 : Math.PI) +
  rand(-JELLY_PATCH_BESIDE_SHIP_SPREAD, JELLY_PATCH_BESIDE_SHIP_SPREAD)

const anyBearing = () => Math.random() * Math.PI * 2

export const addPatchBesideShip = (shipX: number, shipZ: number, boost: number) =>
  addPatch(
    shipX,
    shipZ,
    boost,
    aboveOrBelowOnScreen,
    (radius) =>
      radius * JELLY_PATCH_BESIDE_SHIP_SHARE +
      rand(JELLY_PATCH_BESIDE_SHIP_MIN, JELLY_PATCH_BESIDE_SHIP_MAX)
  )

export const addPatchAround = (shipX: number, shipZ: number, reach: number, boost: number) =>
  addPatch(shipX, shipZ, boost, anyBearing, (radius) =>
    rand(0, reach + radius * JELLY_PATCH_EDGE_REACH + JELLY_PATCH_BEYOND_VIEW)
  )
