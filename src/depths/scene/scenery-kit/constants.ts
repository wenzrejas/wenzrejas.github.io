export type Range = readonly [number, number]

export const SCENERY_KIT_URL = '/models/sunken-ruins/depths_scenery_kit_web_draco.glb'
export const SCENERY_SEED = 23
export const KIT_SCALE = 8.5
export const KIT_BRIGHTNESS = 1.1
export const SCENERY_LEVELS_ABOVE = 1

// ── Density (count multiplier, top level to deepest) ──────────────────────────
export const SCENERY_TOP_DENSITY = 0.1
export const SCENERY_BOTTOM_DENSITY = 1.4

// ── Haze (extra fog on the kit beyond the ruin plane; camera distance) ────────
export const KIT_HAZE_START = 140
export const KIT_HAZE_DENSITY = 0.005

// ── Kit pieces (node names in the kit) ────────────────────────────────────────
export const KIT_PIECES = {
  towerTall: 'Kit_Tower_Tall',
  towerMid: 'Kit_Tower_Mid',
  towerStub: 'Kit_Tower_Stub',
  columnBroken: 'Kit_Column_Broken',
  archWall: 'Kit_Arch_Wall',
  wallFragment: 'Kit_Wall_Fragment',
  blockA: 'Kit_Block_A',
  blockB: 'Kit_Block_B',
  blockC: 'Kit_Block_C',
  rubble: 'Kit_Rubble',
  rockShard: 'Kit_Rock_Shard',
  foregroundPillar: 'Kit_Foreground_Pillar',
  coralA: 'Kit_Coral_A',
  coralB: 'Kit_Coral_B',
}

export type KitPiece = keyof typeof KIT_PIECES

export interface PieceShare {
  piece: KitPiece
  share: number
}

// ── Far towers (per level and side; world units) ──────────────────────────────
export const FAR_TOWERS_PER_SIDE = 4
export const FAR_TOWER_PIECES: PieceShare[] = [
  { piece: 'towerTall', share: 0.45 },
  { piece: 'towerMid', share: 0.35 },
  { piece: 'towerStub', share: 0.2 },
]
export const FAR_TOWER_ACROSS: Range = [70, 300]
export const FAR_TOWER_DEPTH: Range = [-340, -180]
export const FAR_TOWER_SINK: Range = [-200, -60]
export const FAR_TOWER_SIZE: Range = [0.8, 1.25]
export const FAR_TOWER_TILT_DEGREES = 6

// ── Far walls (per level, alternating sides) ──────────────────────────────────
export const FAR_WALLS_PER_LEVEL = 1
export const FAR_WALL_PIECES: PieceShare[] = [
  { piece: 'archWall', share: 0.5 },
  { piece: 'wallFragment', share: 0.5 },
]
export const FAR_WALL_ACROSS: Range = [60, 260]
export const FAR_WALL_DEPTH: Range = [-340, -280]
export const FAR_WALL_SINK: Range = [-60, -20]
export const FAR_WALL_SIZE: Range = [0.9, 1.2]
export const FAR_WALL_TURN_DEGREES = 25

// ── Broken columns (per level and side) ───────────────────────────────────────
export const COLUMNS_PER_SIDE = 1
export const COLUMN_ACROSS: Range = [100, 180]
export const COLUMN_DEPTH: Range = [-150, -90]
export const COLUMN_SINK: Range = [-80, -20]
export const COLUMN_SIZE: Range = [0.9, 1.3]
export const COLUMN_TILT_DEGREES = 10

// ── Floating debris (per level) ───────────────────────────────────────────────
export const DEBRIS_PER_LEVEL = 8
export const DEBRIS_PIECES: PieceShare[] = [
  { piece: 'blockA', share: 0.25 },
  { piece: 'blockB', share: 0.25 },
  { piece: 'blockC', share: 0.25 },
  { piece: 'rockShard', share: 0.25 },
]
export const DEBRIS_ACROSS = 200
export const DEBRIS_RISE = 90
export const DEBRIS_DEPTH: Range = [-180, -60]
export const DEBRIS_SIZE: Range = [0.6, 1.3]
export const DEBRIS_SHIP_CLEARANCE = 24
export const DEBRIS_RUIN_CLEARANCE = 5.5
export const DEBRIS_PLACEMENT_TRIES = 12

// ── Debris drift (world units, radians per second) ────────────────────────────
export const DEBRIS_BOB: Range = [1, 3]
export const DEBRIS_BOB_RATE: Range = [0.3, 0.6]
export const DEBRIS_SPIN_RATE: Range = [0.04, 0.16]

// ── Foreground pillars (every other level from the first, away from the ruin) ─
export const FOREGROUND_FROM_LEVEL = 1
export const FOREGROUND_EVERY = 2
export const FOREGROUND_ACROSS: Range = [56, 62]
export const FOREGROUND_DEPTH: Range = [55, 65]
export const FOREGROUND_SIZE: Range = [0.95, 1.1]
export const FOREGROUND_TILT_DEGREES = 2
export const FOREGROUND_TOP_DROP = 12
export const FOREGROUND_PILLAR_HEIGHT = 12
export const FOREGROUND_SHADE = 0.4

// ── Seabed (rubble and coral resting on the relief) ───────────────────────────
export const SEABED_RUBBLE = 8
export const SEABED_CORALS = 14
export const SEABED_SPREAD_ACROSS = 190
export const SEABED_SPREAD_DEPTH: Range = [-190, 40]
export const SEABED_PIECE_SIZE: Range = [0.8, 1.3]
export const SEABED_SINK = 1.5
