// ── Atlas ───────────────────────────────────────────────────────────────────────
export const ISLAND_ATLAS_WIDTH = 2048
export const ISLAND_ATLAS_HEIGHT = 772

// ── Rock outcrops (atlas px) ────────────────────────────────────────────────────
export const ROCK_PIECES = {
  rockClusterCentre: { width: 54, height: 43, atlasX: 607, atlasY: 435 },
  rockClusterEast: { width: 45, height: 39, atlasX: 728, atlasY: 435 },
  rockClusterSouth: { width: 46, height: 44, atlasX: 829, atlasY: 435 },
  rockLoneEast: { width: 48, height: 45, atlasX: 777, atlasY: 435 },
  rockLoneNorth: { width: 35, height: 36, atlasX: 968, atlasY: 435 },
  rockLoneWest: { width: 44, height: 41, atlasX: 879, atlasY: 435 },
  rockPairNorth: { width: 50, height: 45, atlasX: 553, atlasY: 435 },
  rockSmallSoutheast: { width: 37, height: 25, atlasX: 927, atlasY: 435 },
  rockSmallWest: { width: 37, height: 27, atlasX: 1007, atlasY: 435 },
  rockTrioWest: { width: 59, height: 46, atlasX: 665, atlasY: 435 },
}

// ── Islands (atlas px, anchor = island centre within the piece) ─────────────────
export const ISLAND_PIECES = {
  islandCafe: { width: 534, height: 403, atlasX: 4, atlasY: 4, anchorX: 276, anchorY: 310 },
  islandLighthouse: { width: 283, height: 427, atlasX: 542, atlasY: 4, anchorX: 142, anchorY: 384 },
  islandRuins: { width: 545, height: 330, atlasX: 4, atlasY: 435, anchorX: 270, anchorY: 210 },
  islandStatues: { width: 546, height: 390, atlasX: 1377, atlasY: 4, anchorX: 269, anchorY: 228 },
  islandWaterfalls: {
    width: 544,
    height: 425,
    atlasX: 829,
    atlasY: 4,
    anchorX: 272,
    anchorY: 298,
  },
}

export type RockKey = keyof typeof ROCK_PIECES
export type IslandArtKey = keyof typeof ISLAND_PIECES
