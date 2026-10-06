import type { CSSProperties } from 'react'
import {
  CHART_STRETCH_LIMIT,
  CHART_WIDTH_FILL,
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

export const imageryStyle = () =>
  ({
    opacity: IMAGERY_OPACITY,
    '--atlas': `url(${MAP_ATLAS_URL})`,
    ...Object.fromEntries(MIST_REVEAL_MASKS.map(({ url }, i) => [`--mist-${i}`, `url(${url})`])),
  }) as CSSProperties

function placePieces(width: number, height: number) {
  const stretchY = height / CHART_HEIGHT
  const stretchX = Math.min(
    (width / CHART_WIDTH) * CHART_WIDTH_FILL,
    stretchY * CHART_STRETCH_LIMIT
  )
  const glyphScale = Math.min(stretchX, stretchY) * GLYPH_SHRINK
  return MAP_PIECES.map((piece) => {
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

export const pieceStyles = (width: number, height: number) =>
  placePieces(width, height).map(({ piece, left, top, scaleX, scaleY }, index) => {
    const variant = index % MIST_REVEAL_MASKS.length
    const boxWidth = piece.width * scaleX
    const boxHeight = piece.height * scaleY
    const originX = (piece.originX - piece.left) * scaleX
    const originY = (piece.originY - piece.top) * scaleY
    const reach =
      (2 * farthestCorner(boxWidth, boxHeight, originX, originY)) /
      MIST_REVEAL_MASKS[variant].clearShare
    const [from, clear] = MIST_REVEALS[piece.key]
    return {
      key: piece.key,
      style: {
        left,
        top,
        width: boxWidth,
        height: boxHeight,
        backgroundSize: `${ATLAS_WIDTH * scaleX}px ${ATLAS_HEIGHT * scaleY}px`,
        backgroundPosition: `${-piece.atlasX * scaleX}px ${-piece.atlasY * scaleY}px`,
        '--mist': `var(--mist-${variant})`,
        '--from': from,
        '--span': clear - from,
        '--origin-x': `${originX.toFixed(1)}px`,
        '--origin-y': `${originY.toFixed(1)}px`,
        '--reach': `${reach.toFixed(1)}px`,
      } as CSSProperties,
    }
  })
