import type { CSSProperties } from 'react'
import { atlasSpriteStyle } from '@/utils/atlas'
import {
  CHART_STRETCH_LIMIT,
  CHART_WIDTH_FILL,
  COMPASS_PIECE,
  COMPASS_SHRINK,
  GLYPH_SHRINK,
  IMAGERY_OPACITY,
  MAP_ATLAS_URL,
  MIST_REVEAL_MASKS,
  MIST_REVEALS,
} from './constants'
import { ATLAS_HEIGHT, ATLAS_WIDTH, CHART_HEIGHT, CHART_WIDTH, MAP_PIECES } from './mapPieces'

let atlas: HTMLImageElement | null = null

export function atlasImage() {
  if (!atlas) {
    atlas = new Image()
    atlas.src = MAP_ATLAS_URL
    atlas.decode().catch(() => undefined)
  }
  return atlas
}

export const mistMaskVariables = () =>
  Object.fromEntries(MIST_REVEAL_MASKS.map(({ url }, i) => [`--mist-${i}`, `url(${url})`]))

export const imageryStyle = () =>
  ({
    opacity: IMAGERY_OPACITY,
    '--atlas': `url(${MAP_ATLAS_URL})`,
    ...mistMaskVariables(),
  }) as CSSProperties

function placePieces(width: number, height: number) {
  const stretchY = height / CHART_HEIGHT
  const stretchX = Math.min(
    (width / CHART_WIDTH) * CHART_WIDTH_FILL,
    stretchY * CHART_STRETCH_LIMIT
  )
  const fitScale = Math.min(stretchX, stretchY)
  return MAP_PIECES.map((piece) => {
    const glyphScale = fitScale * (piece.key === COMPASS_PIECE ? COMPASS_SHRINK : GLYPH_SHRINK)
    const scaleX = piece.isRoute ? stretchX : glyphScale
    const scaleY = piece.isRoute ? stretchY : glyphScale
    const centerX = width / 2 + (piece.left + piece.width / 2 - CHART_WIDTH / 2) * stretchX
    const centerY = height / 2 + (piece.top + piece.height / 2 - CHART_HEIGHT / 2) * stretchY
    return {
      piece,
      scaleX,
      scaleY,
      left: centerX - (piece.width * scaleX) / 2,
      top: centerY - (piece.height * scaleY) / 2,
    }
  })
}

export function paintMapPieces(context: CanvasRenderingContext2D, width: number, height: number) {
  const image = atlasImage()
  if (!image.complete) return
  context.save()
  context.globalAlpha = IMAGERY_OPACITY
  for (const { piece, left, top, scaleX, scaleY } of placePieces(width, height)) {
    context.drawImage(
      image,
      piece.atlasX,
      piece.atlasY,
      piece.width,
      piece.height,
      left,
      top,
      piece.width * scaleX,
      piece.height * scaleY
    )
  }
  context.restore()
}

function farthestCorner(width: number, height: number, originX: number, originY: number) {
  return Math.max(
    Math.hypot(originX, originY),
    Math.hypot(width - originX, originY),
    Math.hypot(originX, height - originY),
    Math.hypot(width - originX, height - originY)
  )
}

export function mistRevealStyle(
  boxWidth: number,
  boxHeight: number,
  originX: number,
  originY: number,
  variant: number
) {
  const reach =
    (2 * farthestCorner(boxWidth, boxHeight, originX, originY)) /
    MIST_REVEAL_MASKS[variant].clearShare
  return {
    '--mist': `var(--mist-${variant})`,
    '--origin-x': `${originX.toFixed(1)}px`,
    '--origin-y': `${originY.toFixed(1)}px`,
    '--reach': `${reach.toFixed(1)}px`,
  }
}

export const pieceStyles = (width: number, height: number) =>
  placePieces(width, height).map(({ piece, left, top, scaleX, scaleY }, index) => {
    const sprite = atlasSpriteStyle(ATLAS_WIDTH, ATLAS_HEIGHT, piece, scaleX, scaleY)
    const originX = (piece.originX - piece.left) * scaleX
    const originY = (piece.originY - piece.top) * scaleY
    const [from, clear] = MIST_REVEALS[piece.key]
    return {
      key: piece.key,
      style: {
        left,
        top,
        ...sprite,
        '--from': from,
        '--span': clear - from,
        ...mistRevealStyle(
          sprite.width,
          sprite.height,
          originX,
          originY,
          index % MIST_REVEAL_MASKS.length
        ),
      } as CSSProperties,
    }
  })
