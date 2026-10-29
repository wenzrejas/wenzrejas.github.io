import type { CSSProperties } from 'react'
import * as THREE from 'three'
import { toEastNorth } from '@/hud/north'
import { COMPASS_PIECE, MAP_ATLAS_URL, MIST_REVEAL_MASKS } from '@/loading/map-imagery/constants'
import { mistMaskVariables, mistRevealStyle } from '@/loading/map-imagery/mapImageryModel'
import {
  ATLAS_HEIGHT,
  ATLAS_WIDTH,
  MAP_PIECES,
  type MapPieceKey,
} from '@/loading/map-imagery/mapPieces'
import { atlasSpriteStyle } from '@/utils/atlas'
import { WORLD_LOCATIONS, type IslandKey } from '@/world/islands/shared/constants'
import { ISLAND_KEYS } from '@/world/islands/shared/islandSpecs'
import {
  CHART_HEIGHT,
  CHART_PX_PER_WORLD_UNIT,
  CHART_STRETCH_LIMIT,
  CHART_WIDTH,
  COMPASS_SCALE,
  DECORATION_SCALE,
  DECORATION_SPOTS,
  ISLAND_ART,
  ISLAND_ART_SCALE,
  ISLAND_ATLAS_URL,
  LINE_DECORATIONS,
  ROCK_SCALE,
  ROCK_SPOTS,
  SET_SAIL_GAP,
  SET_SAIL_ROOM,
  WORLD_ORIGIN_ON_CHART,
} from './constants'
import {
  ISLAND_ATLAS_HEIGHT,
  ISLAND_ATLAS_WIDTH,
  ISLAND_PIECES,
  ROCK_PIECES,
} from './islandArtPieces'

interface AtlasSheet {
  url: string
  width: number
  height: number
}

interface AtlasPiece {
  width: number
  height: number
  atlasX: number
  atlasY: number
}

interface ChartPoint {
  x: number
  y: number
}

export interface SetSailSpot {
  left: number
  top: number
  side: 'above' | 'below'
}

type DecorationKind = 'compass' | 'line' | 'glyph'

const DECORATION_SHEET: AtlasSheet = {
  url: MAP_ATLAS_URL,
  width: ATLAS_WIDTH,
  height: ATLAS_HEIGHT,
}
const ISLAND_SHEET: AtlasSheet = {
  url: ISLAND_ATLAS_URL,
  width: ISLAND_ATLAS_WIDTH,
  height: ISLAND_ATLAS_HEIGHT,
}

const _eastNorth = new THREE.Vector2()

export const MAP_ART_STYLE = mistMaskVariables() as CSSProperties

const atlasStyle = (sheet: AtlasSheet, piece: AtlasPiece, scale: number) => ({
  backgroundImage: `url(${sheet.url})`,
  ...atlasSpriteStyle(sheet.width, sheet.height, piece, scale, scale),
})

const decorationKind = (key: MapPieceKey): DecorationKind =>
  key === COMPASS_PIECE ? 'compass' : LINE_DECORATIONS.includes(key) ? 'line' : 'glyph'

function islandChartSpot(island: IslandKey): ChartPoint {
  const [x, , z] = WORLD_LOCATIONS[island].position
  const { x: east, y: north } = toEastNorth(x, z, _eastNorth)
  return {
    x: WORLD_ORIGIN_ON_CHART.x + east * CHART_PX_PER_WORLD_UNIT,
    y: WORLD_ORIGIN_ON_CHART.y - north * CHART_PX_PER_WORLD_UNIT,
  }
}

export function placeMapArt(width: number, height: number) {
  const stretchY = height / CHART_HEIGHT
  const stretchX = Math.min(width / CHART_WIDTH, stretchY * CHART_STRETCH_LIMIT)
  const glyphScale = Math.min(stretchX, stretchY)
  const screenX = (chartX: number) => width / 2 + (chartX - CHART_WIDTH / 2) * stretchX
  const screenY = (chartY: number) => height / 2 + (chartY - CHART_HEIGHT / 2) * stretchY
  const placeAround = (
    sheet: AtlasSheet,
    piece: AtlasPiece,
    spot: ChartPoint,
    pivot: ChartPoint,
    scale: number
  ) => ({
    ...atlasStyle(sheet, piece, scale),
    left: screenX(spot.x) - pivot.x * scale,
    top: screenY(spot.y) - pivot.y * scale,
  })
  const centreOf = (piece: AtlasPiece) => ({ x: piece.width / 2, y: piece.height / 2 })

  const decorations = MAP_PIECES.flatMap((piece, index) => {
    const spot = DECORATION_SPOTS[piece.key]
    if (!spot) return []
    const kind = decorationKind(piece.key)
    const decorationScale = glyphScale * (kind === 'compass' ? COMPASS_SCALE : DECORATION_SCALE)
    const mist =
      kind === 'line'
        ? mistRevealStyle(
            piece.width * decorationScale,
            piece.height * decorationScale,
            (piece.originX - piece.left) * decorationScale,
            (piece.originY - piece.top) * decorationScale,
            index % MIST_REVEAL_MASKS.length
          )
        : null
    return {
      key: piece.key,
      kind,
      style: {
        ...placeAround(DECORATION_SHEET, piece, spot, centreOf(piece), decorationScale),
        ...mist,
      } as CSSProperties,
    }
  })

  const rockScale = glyphScale * ROCK_SCALE
  const rocks = ROCK_SPOTS.map((spot, index) => ({
    key: `${spot.rock}-${index}`,
    style: placeAround(
      ISLAND_SHEET,
      ROCK_PIECES[spot.rock],
      spot,
      centreOf(ROCK_PIECES[spot.rock]),
      rockScale
    ),
  }))

  const islandScale = glyphScale * ISLAND_ART_SCALE
  const islands = ISLAND_KEYS.map((island) => {
    const piece = ISLAND_PIECES[ISLAND_ART[island]]
    const anchor = { x: piece.anchorX, y: piece.anchorY }
    const placed = placeAround(ISLAND_SHEET, piece, islandChartSpot(island), anchor, islandScale)
    const centreX = placed.left + placed.width / 2
    const setSailSpot: SetSailSpot =
      placed.top >= SET_SAIL_ROOM
        ? { left: centreX, top: placed.top - SET_SAIL_GAP, side: 'above' }
        : { left: centreX, top: placed.top + placed.height + SET_SAIL_GAP, side: 'below' }
    return {
      island,
      setSailSpot,
      style: {
        ...placed,
        transformOrigin: `${anchor.x * islandScale}px ${anchor.y * islandScale}px`,
      },
    }
  })

  return { decorations, rocks, islands }
}

export function thumbnailStyle(
  island: IslandKey,
  boxWidth: number,
  boxHeight: number
): CSSProperties {
  const piece = ISLAND_PIECES[ISLAND_ART[island]]
  const scale = Math.min(boxWidth / piece.width, boxHeight / piece.height)
  const insetX = (boxWidth - piece.width * scale) / 2
  const insetY = (boxHeight - piece.height * scale) / 2
  return {
    ...atlasStyle(ISLAND_SHEET, piece, scale),
    margin: `${insetY}px ${insetX}px`,
  }
}
