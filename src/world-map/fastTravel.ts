import * as THREE from 'three'
import { CAMERA_OFFSET } from '@/app/experience/constants'
import { useCoastStore } from '@/store/coastStore'
import { useDebugStore } from '@/store/debugStore'
import { closePanel } from '@/store/panelStore'
import { placeShip } from '@/store/shipStore'
import { closeWorldMap, isInDepths, leaveDepths } from '@/store/viewStore'
import { signedLoopDistance } from '@/utils/polygon'
import { BOUNDARY_RADIUS } from '@/world/environment/boundary/constants'
import type { IslandKey } from '@/world/islands/shared/constants'
import { ISLAND_SPECS } from '@/world/islands/shared/islandSpecs'
import {
  createIslandTransform,
  islandExtent,
  islandTransform,
  toWorld,
} from '@/world/islands/shared/islandTransform'
import { whirlpoolCurrent } from '@/world/ship/whirlpoolDrift'
import {
  ARRIVAL_BOUNDARY_GAP,
  ARRIVAL_SEARCH_REACH,
  ARRIVAL_SEARCH_STEP,
  ARRIVAL_SHORE_GAP,
  ARRIVAL_SIDE_TURNS,
} from './constants'

interface Arrival {
  x: number
  z: number
  heading: number
}

const SCREEN_FRONT = new THREE.Vector2(CAMERA_OFFSET[0], CAMERA_OFFSET[2]).normalize()
const ORIGIN = new THREE.Vector2()

const _transform = createIslandTransform()
const _current = new THREE.Vector2()
const _spot = new THREE.Vector2()

function isOutsideWhirlpool(x: number, z: number): boolean {
  whirlpoolCurrent(x, z, _current)
  return _current.x === 0 && _current.y === 0
}

function mooredArrival(island: IslandKey): Arrival | null {
  const mooring = ISLAND_SPECS[island].mooring
  if (!mooring) return null
  const transform = islandTransform(island, useDebugStore.getState().islands[island], _transform)
  const spot = toWorld(transform, mooring.x, mooring.z, _spot)
  return {
    x: spot.x,
    z: spot.y,
    heading: THREE.MathUtils.degToRad(mooring.headingDegrees) + transform.facing,
  }
}

function frontArrival(island: IslandKey): Arrival {
  const tuning = useDebugStore.getState().islands[island]
  const centre = islandTransform(island, tuning, _transform)
  const extent = islandExtent(island, tuning)
  const coastline = useCoastStore.getState().coastlines.find((entry) => entry.islandKey === island)
  const shoreGap = (x: number, z: number) =>
    coastline
      ? Math.min(...coastline.outlines.map((outline) => signedLoopDistance(outline, x, z)))
      : Math.hypot(x - centre.x, z - centre.z) - extent
  const arrivalAt = (side: THREE.Vector2, reach: number): Arrival => ({
    x: centre.x + side.x * reach,
    z: centre.z + side.y * reach,
    heading: Math.atan2(side.y, -side.x),
  })

  for (const turn of ARRIVAL_SIDE_TURNS) {
    const side = SCREEN_FRONT.clone().rotateAround(ORIGIN, turn)
    for (let reach = 0; reach <= ARRIVAL_SEARCH_REACH; reach += ARRIVAL_SEARCH_STEP) {
      const arrival = arrivalAt(side, reach)
      if (Math.hypot(arrival.x, arrival.z) > BOUNDARY_RADIUS - ARRIVAL_BOUNDARY_GAP) break
      if (shoreGap(arrival.x, arrival.z) < ARRIVAL_SHORE_GAP) continue
      if (isOutsideWhirlpool(arrival.x, arrival.z)) return arrival
    }
  }
  return arrivalAt(SCREEN_FRONT, extent + ARRIVAL_SHORE_GAP)
}

export function sailTo(island: IslandKey) {
  const arrival = mooredArrival(island) ?? frontArrival(island)
  closePanel()
  if (isInDepths()) leaveDepths()
  placeShip(arrival.x, arrival.z, arrival.heading)
  closeWorldMap()
}
