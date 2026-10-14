import { DIALOGUES } from '@/data/guideCopy'
import {
  CENTROID_SAMPLE_SHARE,
  FRAME_PIXELS,
  MASCOT_SHEETS,
  SHEET_COLUMNS,
  type MascotAnimation,
} from './constants'
import { frameCentroids, type FrameCentroid } from './frameCentroids'
import type { MascotPlayback } from './mascotPlayback'

const images = new Map<MascotAnimation, HTMLImageElement>()
const centroids = new Map<MascotAnimation, (FrameCentroid | null)[]>()

function sheetImage(animation: MascotAnimation) {
  let image = images.get(animation)
  if (!image) {
    image = new Image()
    image.src = MASCOT_SHEETS[animation].url
    images.set(animation, image)
  }
  return image
}

const isLoaded = (image: HTMLImageElement) => image.complete && image.naturalWidth > 0

function measureCentroids(animation: MascotAnimation, image: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.naturalWidth * CENTROID_SAMPLE_SHARE)
  canvas.height = Math.round(image.naturalHeight * CENTROID_SAMPLE_SHARE)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return []
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return frameCentroids(
    context.getImageData(0, 0, canvas.width, canvas.height),
    Math.round(FRAME_PIXELS * CENTROID_SAMPLE_SHARE),
    MASCOT_SHEETS[animation].frameCount,
    SHEET_COLUMNS
  )
}

function sheetCentroids(animation: MascotAnimation, image: HTMLImageElement) {
  let points = centroids.get(animation)
  if (!points) {
    points = measureCentroids(animation, image)
    centroids.set(animation, points)
  }
  return points
}

const dialogueMoods = Object.values(DIALOGUES).flatMap((pages) => pages.map(({ mood }) => mood))
const playedAnimations = new Set<MascotAnimation>(['appear', 'idle', 'exit', ...dialogueMoods])

export const preloadMascotSheets = () =>
  Promise.allSettled(
    [...playedAnimations].map(async (animation) => {
      const image = sheetImage(animation)
      await image.decode()
      sheetCentroids(animation, image)
    })
  )

function drawCell(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frame: number,
  offsetX: number,
  offsetY: number
) {
  const { width, height } = context.canvas
  context.drawImage(
    image,
    (frame % SHEET_COLUMNS) * FRAME_PIXELS,
    Math.floor(frame / SHEET_COLUMNS) * FRAME_PIXELS,
    FRAME_PIXELS,
    FRAME_PIXELS,
    offsetX,
    offsetY,
    width,
    height
  )
}

export function drawMascotFrame(
  context: CanvasRenderingContext2D,
  { animation, frame, nextFrame, blend }: MascotPlayback
) {
  const { width, height } = context.canvas
  context.clearRect(0, 0, width, height)
  if (!animation) return
  const image = sheetImage(animation)
  if (!isLoaded(image)) return

  const points = sheetCentroids(animation, image)
  const from = points[frame]
  const to = points[nextFrame]
  const driftX = from && to ? (to.x - from.x) * width : 0
  const driftY = from && to ? (to.y - from.y) * height : 0

  context.globalAlpha = 1 - blend
  drawCell(context, image, frame, driftX * blend, driftY * blend)
  if (blend > 0) {
    context.globalCompositeOperation = 'lighter'
    context.globalAlpha = blend
    drawCell(context, image, nextFrame, -driftX * (1 - blend), -driftY * (1 - blend))
    context.globalCompositeOperation = 'source-over'
  }
  context.globalAlpha = 1
}
