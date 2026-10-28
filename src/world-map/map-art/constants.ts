import type { MapPieceKey } from '@/loading/map-imagery/mapPieces'
import type { IslandKey } from '@/world/islands/shared/constants'
import type { IslandArtKey, RockKey } from './islandArtPieces'

interface ChartSpot {
  x: number
  y: number
}

// ── Atlas ─────────────────────────────────────────────────────────────────────
export const ISLAND_ATLAS_URL = '/images/world-map/island-atlas.webp'

// ── Chart (the reference's map area, chart px) ────────────────────────────────
export const CHART_WIDTH = 1136
export const CHART_HEIGHT = 1024
export const CHART_STRETCH_LIMIT = 1.3

// ── Islands (true world positions, north up) ──────────────────────────────────
export const WORLD_ORIGIN_ON_CHART = { x: 591, y: 470 }
export const CHART_PX_PER_WORLD_UNIT = 0.45
export const ISLAND_ART_SCALE = 0.45

export const ISLAND_ART: Record<IslandKey, IslandArtKey> = {
  timewell: 'islandRuins',
  cozy: 'islandCafe',
  lumina: 'islandLighthouse',
  buildshore: 'islandWaterfalls',
  tech: 'islandStatues',
}

// ── Set Sail tooltip (screen px) ──────────────────────────────────────────────
export const SET_SAIL_GAP = 6
export const SET_SAIL_ROOM = 96

// ── Rock outcrops (chart centre) ──────────────────────────────────────────────
export const ROCK_SCALE = 0.65

export const ROCK_SPOTS: Record<RockKey, ChartSpot> = {
  rockPairNorth: { x: 400, y: 295 },
  rockClusterCentre: { x: 560, y: 470 },
  rockTrioWest: { x: 325, y: 720 },
  rockClusterEast: { x: 1010, y: 545 },
  rockLoneEast: { x: 1095, y: 800 },
  rockClusterSouth: { x: 665, y: 670 },
  rockLoneWest: { x: 125, y: 740 },
  rockSmallSoutheast: { x: 790, y: 835 },
  rockLoneNorth: { x: 705, y: 225 },
  rockSmallWest: { x: 455, y: 525 },
}

// ── Decorations (the loading screen's art, chart centre) ──────────────────────
export const DECORATION_SCALE = 0.65
export const COMPASS_SCALE = 0.66

export const DECORATION_SPOTS: Partial<Record<MapPieceKey, ChartSpot>> = {
  compass: { x: 128, y: 140 },
  starCompassSouth: { x: 36, y: 268 },
  starTop: { x: 700, y: 120 },
  starTopRight: { x: 1100, y: 200 },
  starWestEdge: { x: 40, y: 430 },
  starEastEdge: { x: 1092, y: 618 },
  starSouthwestHigh: { x: 40, y: 800 },
  starBottom: { x: 1068, y: 968 },
  starEastRoute: { x: 790, y: 588 },
  windNorth: { x: 955, y: 78 },
  windWest: { x: 58, y: 905 },
  windSoutheast: { x: 905, y: 905 },
  cloudWest: { x: 150, y: 318 },
  cloudNorth: { x: 290, y: 420 },
  cloudEast: { x: 1048, y: 455 },
  gullPair: { x: 568, y: 330 },
  gullTrailing: { x: 640, y: 358 },
  waveNorth: { x: 470, y: 378 },
  waveEast: { x: 830, y: 405 },
  waveWest: { x: 395, y: 470 },
  waveFarEast: { x: 38, y: 690 },
  waveSouthwest: { x: 235, y: 798 },
  waveSouth: { x: 760, y: 975 },
}

export const LINE_DECORATIONS: MapPieceKey[] = [
  'windNorth',
  'windWest',
  'windSoutheast',
  'waveNorth',
  'waveEast',
  'waveWest',
  'waveFarEast',
  'waveSouthwest',
  'waveSouth',
]
