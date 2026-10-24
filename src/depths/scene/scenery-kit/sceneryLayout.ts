import * as THREE from 'three'
import { FULL_TURN, mix } from '@/utils/math'
import { pickByShare, randomBetween, seededRandom, type Random } from '@/utils/random'
import { ARRIVAL_LEVEL } from '../constants'
import { seabedHeightAt } from '../depth-environment/seabedRelief'
import { RUIN_PLACEMENTS } from '../sunken-ruins/constants'
import { ruinSpot } from '../sunken-ruins/ruinLayout'
import { DEEPEST_LEVEL, levelDepth, levelSpot } from '../timeline/timeline'
import {
  COLUMN_ACROSS,
  COLUMN_DEPTH,
  COLUMN_SINK,
  COLUMN_SIZE,
  COLUMN_TILT_DEGREES,
  COLUMNS_PER_SIDE,
  DEBRIS_ACROSS,
  DEBRIS_BOB,
  DEBRIS_BOB_RATE,
  DEBRIS_DEPTH,
  DEBRIS_PER_LEVEL,
  DEBRIS_PIECES,
  DEBRIS_PLACEMENT_TRIES,
  DEBRIS_RISE,
  DEBRIS_RUIN_CLEARANCE,
  DEBRIS_SHIP_CLEARANCE,
  DEBRIS_SIZE,
  DEBRIS_SPIN_RATE,
  FAR_TOWER_ACROSS,
  FAR_TOWER_DEPTH,
  FAR_TOWER_PIECES,
  FAR_TOWER_SINK,
  FAR_TOWER_SIZE,
  FAR_TOWER_TILT_DEGREES,
  FAR_TOWERS_PER_SIDE,
  FAR_WALL_ACROSS,
  FAR_WALL_DEPTH,
  FAR_WALL_PIECES,
  FAR_WALL_SINK,
  FAR_WALL_SIZE,
  FAR_WALL_TURN_DEGREES,
  FAR_WALLS_PER_LEVEL,
  FOREGROUND_ACROSS,
  FOREGROUND_DEPTH,
  FOREGROUND_EVERY,
  FOREGROUND_FROM_LEVEL,
  FOREGROUND_PILLAR_HEIGHT,
  FOREGROUND_SIZE,
  FOREGROUND_TILT_DEGREES,
  FOREGROUND_TOP_DROP,
  KIT_SCALE,
  SCENERY_BOTTOM_DENSITY,
  SCENERY_LEVELS_ABOVE,
  SCENERY_SEED,
  SCENERY_TOP_DENSITY,
  SEABED_CORALS,
  SEABED_PIECE_SIZE,
  SEABED_RUBBLE,
  SEABED_SINK,
  SEABED_SPREAD_ACROSS,
  SEABED_SPREAD_DEPTH,
  type KitPiece,
  type PieceShare,
  type Range,
} from './constants'

export interface KitDrift {
  bob: number
  bobRate: number
  spinAxis: THREE.Vector3
  spinRate: number
  phase: number
}

export interface KitPlacement {
  piece: KitPiece
  position: THREE.Vector3
  turn: THREE.Quaternion
  size: number
  drift: KitDrift | null
}

interface Planner {
  random: Random
  within: (range: Range) => number
  pick: (pieces: PieceShare[]) => KitPiece
  placements: KitPlacement[]
}

const { degToRad } = THREE.MathUtils

const FIRST_SCENERY_LEVEL = ARRIVAL_LEVEL - SCENERY_LEVELS_ABOVE

const _ruinSpot = new THREE.Vector3()

const RUIN_ZONES = RUIN_PLACEMENTS.map((placement, level) => ({
  centre: ruinSpot(placement, level, new THREE.Vector3()),
  radius: DEBRIS_RUIN_CLEARANCE * placement.scale,
}))

function createPlanner(random: Random): Planner {
  const between = randomBetween(random)
  return {
    random,
    within: ([min, max]) => between(min, max),
    pick: (pieces) => pickByShare(pieces, random()).piece,
    placements: [],
  }
}

function leaning(planner: Planner, tiltDegrees: number, turn = planner.random() * FULL_TURN) {
  const tilt = degToRad(tiltDegrees)
  const lean = () => planner.within([-tilt, tilt])
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(lean(), turn, lean()))
}

const tumbled = ({ random }: Planner) =>
  new THREE.Quaternion().setFromEuler(
    new THREE.Euler(random() * FULL_TURN, random() * FULL_TURN, random() * FULL_TURN)
  )

function place(
  planner: Planner,
  piece: KitPiece,
  position: THREE.Vector3,
  turn: THREE.Quaternion,
  size: number,
  drift: KitDrift | null = null
) {
  planner.placements.push({ piece, position, turn, size: KIT_SCALE * size, drift })
}

function placeFarTower(planner: Planner, side: number, y: number) {
  const { within } = planner
  const position = new THREE.Vector3(
    side * within(FAR_TOWER_ACROSS),
    y + within(FAR_TOWER_SINK),
    within(FAR_TOWER_DEPTH)
  )
  const turn = leaning(planner, FAR_TOWER_TILT_DEGREES)
  place(planner, planner.pick(FAR_TOWER_PIECES), position, turn, within(FAR_TOWER_SIZE))
}

function placeFarWall(planner: Planner, side: number, y: number) {
  const { within } = planner
  const position = new THREE.Vector3(
    side * within(FAR_WALL_ACROSS),
    y + within(FAR_WALL_SINK),
    within(FAR_WALL_DEPTH)
  )
  const facing = degToRad(FAR_WALL_TURN_DEGREES)
  const turn = leaning(planner, 0, within([-facing, facing]))
  place(planner, planner.pick(FAR_WALL_PIECES), position, turn, within(FAR_WALL_SIZE))
}

function placeColumn(planner: Planner, side: number, y: number) {
  const { within } = planner
  const position = new THREE.Vector3(
    side * within(COLUMN_ACROSS),
    y + within(COLUMN_SINK),
    within(COLUMN_DEPTH)
  )
  place(
    planner,
    'columnBroken',
    position,
    leaning(planner, COLUMN_TILT_DEGREES),
    within(COLUMN_SIZE)
  )
}

const isClearOfCentrepieces = (x: number, y: number) =>
  Math.abs(x) >= DEBRIS_SHIP_CLEARANCE &&
  RUIN_ZONES.every(({ centre, radius }) => Math.hypot(x - centre.x, y - centre.y) >= radius)

function placeDebris(planner: Planner, y: number) {
  const { within, random } = planner
  for (let tries = 0; tries < DEBRIS_PLACEMENT_TRIES; tries++) {
    const x = within([-DEBRIS_ACROSS, DEBRIS_ACROSS])
    const height = y + within([-DEBRIS_RISE, DEBRIS_RISE])
    if (!isClearOfCentrepieces(x, height)) continue
    const drift: KitDrift = {
      bob: within(DEBRIS_BOB),
      bobRate: within(DEBRIS_BOB_RATE),
      spinAxis: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
      spinRate: within(DEBRIS_SPIN_RATE),
      phase: random() * FULL_TURN,
    }
    const position = new THREE.Vector3(x, height, within(DEBRIS_DEPTH))
    const size = within(DEBRIS_SIZE)
    place(planner, planner.pick(DEBRIS_PIECES), position, tumbled(planner), size, drift)
    return
  }
}

const sideAwayFromRuin = (level: number) => (levelSpot(level, _ruinSpot).x > 0 ? -1 : 1)

function placeForegroundPillar(planner: Planner, level: number) {
  const { within } = planner
  const size = within(FOREGROUND_SIZE)
  const top = levelDepth(level) - FOREGROUND_TOP_DROP
  const position = new THREE.Vector3(
    sideAwayFromRuin(level) * within(FOREGROUND_ACROSS),
    top - FOREGROUND_PILLAR_HEIGHT * KIT_SCALE * size,
    within(FOREGROUND_DEPTH)
  )
  place(planner, 'foregroundPillar', position, leaning(planner, FOREGROUND_TILT_DEGREES), size)
}

function placeOnSeabed(planner: Planner, piece: KitPiece) {
  const { within } = planner
  const x = within([-SEABED_SPREAD_ACROSS, SEABED_SPREAD_ACROSS])
  const z = within(SEABED_SPREAD_DEPTH)
  const position = new THREE.Vector3(x, seabedHeightAt(x, z) - SEABED_SINK, z)
  place(planner, piece, position, leaning(planner, 0), within(SEABED_PIECE_SIZE))
}

const densityAt = (level: number) =>
  mix(
    SCENERY_TOP_DENSITY,
    SCENERY_BOTTOM_DENSITY,
    (level - FIRST_SCENERY_LEVEL) / (DEEPEST_LEVEL - FIRST_SCENERY_LEVEL)
  )

const countAt = (perLevel: number, level: number) => Math.round(perLevel * densityAt(level))

const alternatingSide = (step: number) => (Math.abs(step) % 2 === 0 ? -1 : 1)

function repeat(times: number, placeOne: (step: number) => void) {
  for (let step = 0; step < times; step++) placeOne(step)
}

function placeLevel(planner: Planner, level: number) {
  const y = levelDepth(level)
  for (const side of [-1, 1]) {
    repeat(countAt(FAR_TOWERS_PER_SIDE, level), () => placeFarTower(planner, side, y))
    repeat(countAt(COLUMNS_PER_SIDE, level), () => placeColumn(planner, side, y))
  }
  repeat(countAt(FAR_WALLS_PER_LEVEL, level), (step) =>
    placeFarWall(planner, alternatingSide(level + step), y)
  )
  repeat(countAt(DEBRIS_PER_LEVEL, level), () => placeDebris(planner, y))
  const pillarStep = (level - FOREGROUND_FROM_LEVEL) / FOREGROUND_EVERY
  if (pillarStep >= 0 && Number.isInteger(pillarStep)) placeForegroundPillar(planner, level)
}

export function planScenery(): KitPlacement[] {
  const planner = createPlanner(seededRandom(SCENERY_SEED))
  for (let level = FIRST_SCENERY_LEVEL; level <= DEEPEST_LEVEL; level++) placeLevel(planner, level)
  repeat(SEABED_RUBBLE, () => placeOnSeabed(planner, 'rubble'))
  repeat(SEABED_CORALS, (step) => placeOnSeabed(planner, step % 2 === 0 ? 'coralA' : 'coralB'))
  return planner.placements
}
