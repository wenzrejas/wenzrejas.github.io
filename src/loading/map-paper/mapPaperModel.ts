import {
  paintBroadMottling,
  paintFibers,
  paintRelief,
  paintSpecks,
  type PaperArea,
} from '@/panels/shared/parchment/paperTexture'
import { seededRandom } from '@/utils/random'
import { MAP_PAPER_SEED, MAP_RELIEF_STRENGTH, MAP_TONE_STOPS } from './constants'

function paintTone(context: CanvasRenderingContext2D, area: PaperArea) {
  const centerX = area.width / 2
  const centerY = area.height / 2
  const tone = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    Math.hypot(centerX, centerY)
  )
  for (const [offset, color] of MAP_TONE_STOPS) tone.addColorStop(offset, color)
  context.fillStyle = tone
  context.fillRect(area.left, area.top, area.width, area.height)
}

export function paintMapPaper(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  pixelRatio: number
) {
  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)
  const context = canvas.getContext('2d')
  if (!context) return

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  const area: PaperArea = { left: 0, top: 0, width, height }
  const random = seededRandom(MAP_PAPER_SEED)
  paintTone(context, area)
  paintBroadMottling(context, area, random)
  paintRelief(context, area, pixelRatio, MAP_RELIEF_STRENGTH, 0)
  paintFibers(context, area, random)
  paintSpecks(context, area, random)
}
