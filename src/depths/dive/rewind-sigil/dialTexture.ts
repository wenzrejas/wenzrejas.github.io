import * as THREE from 'three'
import { DEPTHS_COPY } from '@/data/depthsCopy'
import {
  DIAL_CORE_RING,
  DIAL_HOUR_TICK,
  DIAL_INNER_OUTER_RING,
  DIAL_MINUTE_TICK,
  DIAL_NUMERAL_RADIUS,
  DIAL_NUMERAL_SIZE,
  DIAL_OUTER_LINE,
  DIAL_OUTER_RING,
  DIAL_PIXELS,
  DIAL_THIN_LINE,
  DIAL_TICK_INNER,
  DIAL_TICK_OUTER,
  DIAL_TICK_WIDTH,
  DIAL_TICKS,
  DIAL_TICKS_PER_HOUR,
} from './constants'

const DIAL_FONT = `600 ${DIAL_PIXELS * DIAL_NUMERAL_SIZE}px Cinzel, serif`

let drawnDial: Promise<HTMLCanvasElement> | null = null

function drawDial(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) return
  const size = canvas.width
  const centre = size / 2
  context.strokeStyle = '#ffffff'
  context.fillStyle = '#ffffff'

  const ring = (radius: number, width: number) => {
    context.lineWidth = size * width
    context.beginPath()
    context.arc(centre, centre, size * radius, 0, Math.PI * 2)
    context.stroke()
  }
  ring(DIAL_OUTER_RING, DIAL_OUTER_LINE)
  ring(DIAL_INNER_OUTER_RING, DIAL_THIN_LINE)
  ring(DIAL_TICK_OUTER, DIAL_THIN_LINE)
  ring(DIAL_TICK_INNER, DIAL_THIN_LINE)
  ring(DIAL_CORE_RING, DIAL_THIN_LINE)

  const atAngle = (turnShare: number, draw: () => void) => {
    context.save()
    context.translate(centre, centre)
    context.rotate(turnShare * Math.PI * 2)
    draw()
    context.restore()
  }
  for (let tick = 0; tick < DIAL_TICKS; tick++) {
    const length = tick % DIAL_TICKS_PER_HOUR === 0 ? DIAL_HOUR_TICK : DIAL_MINUTE_TICK
    atAngle(tick / DIAL_TICKS, () =>
      context.fillRect(
        (-size * DIAL_TICK_WIDTH) / 2,
        -size * DIAL_TICK_OUTER,
        size * DIAL_TICK_WIDTH,
        size * length
      )
    )
  }

  context.font = DIAL_FONT
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const { dialNumerals } = DEPTHS_COPY
  dialNumerals.forEach((numeral, hour) =>
    atAngle(hour / dialNumerals.length, () =>
      context.fillText(numeral, 0, -size * DIAL_NUMERAL_RADIUS)
    )
  )
}

function createDialCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = DIAL_PIXELS
  canvas.height = DIAL_PIXELS
  drawDial(canvas)
  return canvas
}

const dialCanvas = () =>
  (drawnDial ??= document.fonts.load(DIAL_FONT).then(createDialCanvas, createDialCanvas))

export function buildDialTexture() {
  const texture = new THREE.Texture()
  void dialCanvas().then((canvas) => {
    texture.image = canvas
    texture.needsUpdate = true
  })
  return texture
}
