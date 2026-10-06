import type { MapPieceKey } from './mapPieces'

// ── Atlas ─────────────────────────────────────────────────────────────────────
export const MAP_ATLAS_URL = '/images/loading/map-atlas.webp'

// ── Layout ────────────────────────────────────────────────────────────────────
export const CHART_WIDTH_FILL = 0.96
export const CHART_STRETCH_LIMIT = 1.3
export const GLYPH_SHRINK = 0.85

// ── Muting (lets the centre group lead) ───────────────────────────────────────
export const IMAGERY_OPACITY = 0.88

// ── Mist masks (pre-baked; clear share = radius of the clear core) ────────────
export const MIST_REVEAL_MASKS = [
  { url: '/images/loading/mist-reveal-1.webp', clearShare: 0.3177 },
  { url: '/images/loading/mist-reveal-2.webp', clearShare: 0.3884 },
  { url: '/images/loading/mist-reveal-3.webp', clearShare: 0.3439 },
]

// ── Reveal windows (loading percent, from → clear) ────────────────────────────
export const MIST_REVEALS: Record<MapPieceKey, [number, number]> = {
  compass: [-22, 18],
  starCompassNorth: [6, 16],
  starCompassEast: [9, 19],
  starCompassWest: [28, 36],
  starCompassSouth: [31, 39],
  cloudNorth: [3, 19],
  cloudWest: [20, 34],
  cloudEast: [64, 76],
  waveNorth: [-25, 22],
  waveEast: [11, 25],
  waveWest: [-20, 26],
  waveFarEast: [23, 35],
  waveSouthwest: [27, 39],
  waveSouth: [-25, 24],
  windNorth: [-18, 30],
  windWest: [60, 72],
  windSoutheast: [70, 82],
  gullPair: [61, 71],
  gullTrailing: [66, 75],
  routeWest1: [38, 44],
  routeWest2: [41, 49],
  routeWest3: [46, 56],
  routeWest4: [53, 60],
  routeWest5: [57, 65],
  routeWest6: [62, 70],
  routeWest7: [67, 78],
  routeWest8: [76, 84],
  routeEast1: [43, 52],
  routeEast2: [50, 57],
  routeEast3: [55, 64],
  routeWestStop1: [43, 47],
  routeWestStop2: [48, 52],
  routeWestStop3: [55, 59],
  routeWestStop4: [59, 63],
  routeWestStop5: [64, 68],
  routeWestStop6: [69, 73],
  routeWestStop7: [77, 81],
  routeEastStop1: [51, 55],
  routeEastStop2: [56, 60],
  rockNortheast: [78, 90],
  rockSouthwest: [80, 92],
  rockSouth: [84, 93],
  rockSoutheast: [82, 94],
  starTop: [62, 70],
  starTopRight: [92, 99],
  starEastRoute: [66, 74],
  starWestEdge: [80, 88],
  starEastEdge: [84, 92],
  starSoutheastHigh: [93, 99],
  starSouthwestHigh: [94, 100],
  starSoutheastLow: [95, 100],
  starBottom: [96, 100],
}
