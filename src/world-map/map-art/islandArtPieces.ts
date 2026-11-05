// ── Atlas ─────────────────────────────────────────────────────────────────────
export const ISLAND_ATLAS_WIDTH = 2048
export const ISLAND_ATLAS_HEIGHT = 888

// ── Rock outcrops ─────────────────────────────────────────────────────────────
export const ROCK_PIECES = {
  rockClusterCentre: {
    width: 93,
    height: 53,
    atlasX: 1947,
    atlasY: 67,
    anchorX: 45,
    anchorY: 21.5,
  },
  rockClusterEast: {
    width: 81,
    height: 51,
    atlasX: 1947,
    atlasY: 364,
    anchorX: 41.5,
    anchorY: 19.5,
  },
  rockClusterSouth: { width: 83, height: 54, atlasX: 1947, atlasY: 248, anchorX: 42, anchorY: 22 },
  rockLoneEast: { width: 80, height: 60, atlasX: 1947, atlasY: 124, anchorX: 40, anchorY: 22.5 },
  rockLoneNorth: { width: 61, height: 43, atlasX: 1676, atlasY: 382, anchorX: 30.5, anchorY: 18 },
  rockLoneWest: { width: 77, height: 54, atlasX: 1947, atlasY: 306, anchorX: 40, anchorY: 20.5 },
  rockPairNorth: { width: 84, height: 56, atlasX: 1947, atlasY: 188, anchorX: 41, anchorY: 22.5 },
  rockSmallSoutheast: {
    width: 62,
    height: 36,
    atlasX: 1301,
    atlasY: 847,
    anchorX: 32.5,
    anchorY: 12.5,
  },
  rockSmallWest: { width: 58, height: 38, atlasX: 1741, atlasY: 382, anchorX: 26.5, anchorY: 13.5 },
  rockTrioWest: { width: 93, height: 59, atlasX: 1947, atlasY: 4, anchorX: 46.5, anchorY: 23 },
}

// ── Islands ───────────────────────────────────────────────────────────────────
export const ISLAND_PIECES = {
  islandCafe: { width: 640, height: 441, atlasX: 655, atlasY: 4, anchorX: 329, anchorY: 310 },
  islandLighthouse: {
    width: 371,
    height: 461,
    atlasX: 1301,
    atlasY: 382,
    anchorX: 186,
    anchorY: 384,
  },
  islandRuins: { width: 642, height: 374, atlasX: 1301, atlasY: 4, anchorX: 320, anchorY: 210 },
  islandStatues: { width: 642, height: 432, atlasX: 655, atlasY: 449, anchorX: 316, anchorY: 228 },
  islandWaterfalls: { width: 647, height: 467, atlasX: 4, atlasY: 4, anchorX: 323, anchorY: 298 },
}

export type RockKey = keyof typeof ROCK_PIECES
export type IslandArtKey = keyof typeof ISLAND_PIECES
