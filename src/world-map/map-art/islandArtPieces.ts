// ── Atlas ───────────────────────────────────────────────────────────────────────
export const ISLAND_ATLAS_WIDTH = 2048
export const ISLAND_ATLAS_HEIGHT = 516

// ── Rock outcrops (atlas px) ────────────────────────────────────────────────────
export const ROCK_PIECES = {
  rockClusterCentre: { width: 126, height: 82, atlasX: 563, atlasY: 298 },
  rockClusterEast: { width: 105, height: 68, atlasX: 802, atlasY: 298 },
  rockClusterSouth: { width: 123, height: 85, atlasX: 436, atlasY: 298 },
  rockLoneEast: { width: 97, height: 59, atlasX: 1030, atlasY: 298 },
  rockLoneNorth: { width: 66, height: 47, atlasX: 1246, atlasY: 298 },
  rockLoneWest: { width: 105, height: 69, atlasX: 693, atlasY: 298 },
  rockPairNorth: { width: 111, height: 47, atlasX: 1131, atlasY: 298 },
  rockSmallSoutheast: { width: 84, height: 41, atlasX: 1316, atlasY: 298 },
  rockSmallWest: { width: 64, height: 38, atlasX: 1404, atlasY: 298 },
  rockTrioWest: { width: 115, height: 59, atlasX: 911, atlasY: 298 },
}

// ── Islands (atlas px, anchor = island centre within the piece) ─────────────────
export const ISLAND_PIECES = {
  islandCubes: { width: 461, height: 250, atlasX: 953, atlasY: 4, anchorX: 224, anchorY: 147 },
  islandLighthouse: { width: 433, height: 290, atlasX: 4, atlasY: 4, anchorX: 209, anchorY: 194 },
  islandPortal: { width: 501, height: 218, atlasX: 1418, atlasY: 4, anchorX: 238, anchorY: 114 },
  islandSpires: { width: 508, height: 261, atlasX: 441, atlasY: 4, anchorX: 249, anchorY: 142 },
  islandVillage: { width: 428, height: 213, atlasX: 4, atlasY: 298, anchorX: 197, anchorY: 131 },
}

export type RockKey = keyof typeof ROCK_PIECES
export type IslandArtKey = keyof typeof ISLAND_PIECES
