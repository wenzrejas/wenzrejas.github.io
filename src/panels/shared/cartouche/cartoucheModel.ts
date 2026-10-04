import {
  CARTOUCHE_BAND,
  CARTOUCHE_CORNER_RADIUS,
  CARTOUCHE_LINE_INSET,
  CARTOUCHE_SHEEN_INSET,
} from './constants'

export interface CartoucheShadow {
  drop: number
  blur: number
  opacity: number
}

export interface CartoucheDrawing {
  outline: string
  sheen: string
  face: string
  line: string
  curlTransforms: string[]
}

export const CORNER_CURL =
  'M0 0 C-1.6 -1.8 -4.4 -1.6 -4.8 0.6 C-5.1 2.4 -3.4 3.4 -2.2 2.4 C-1.4 1.7 -1.9 0.6 -2.8 0.8'

const point = (x: number, y: number) => `${x.toFixed(2)} ${y.toFixed(2)}`

function notchedOutline(width: number, height: number, inset: number) {
  const reach = CARTOUCHE_CORNER_RADIUS + inset
  const run = Math.sqrt(reach * reach - inset * inset)
  const arc = (x: number, y: number) => `A${reach} ${reach} 0 0 0 ${point(x, y)}`
  return [
    `M${point(run, inset)}`,
    `L${point(width - run, inset)}`,
    arc(width - inset, run),
    `L${point(width - inset, height - run)}`,
    arc(width - run, height - inset),
    `L${point(run, height - inset)}`,
    arc(inset, height - run),
    `L${point(inset, run)}`,
    arc(run, inset),
    'Z',
  ].join('')
}

function cornerCurls(width: number, height: number) {
  const reach = (CARTOUCHE_CORNER_RADIUS + CARTOUCHE_BAND + CARTOUCHE_LINE_INSET) / Math.SQRT2
  const corners: [number, number, number, number][] = [
    [reach, reach, 1, 1],
    [width - reach, reach, -1, 1],
    [width - reach, height - reach, -1, -1],
    [reach, height - reach, 1, -1],
  ]
  return corners.map(
    ([x, y, flipX, flipY]) => `translate(${point(x, y)}) scale(${-flipX} ${-flipY}) rotate(45)`
  )
}

export function drawCartouche(width: number, height: number): CartoucheDrawing {
  return {
    outline: notchedOutline(width, height, 0),
    sheen: notchedOutline(width, height, CARTOUCHE_SHEEN_INSET),
    face: notchedOutline(width, height, CARTOUCHE_BAND),
    line: notchedOutline(width, height, CARTOUCHE_BAND + CARTOUCHE_LINE_INSET),
    curlTransforms: cornerCurls(width, height),
  }
}
