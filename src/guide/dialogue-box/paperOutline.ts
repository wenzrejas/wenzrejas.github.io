import { PAPER_MIN_HEIGHT, PAPER_STRETCH_FROM } from './constants'

type OutlineStep = ['M' | 'L', number, number] | ['Q', number, number, number, number]

const SHADOW_OUTLINE: OutlineStep[] = [
  ['M', 44, 19],
  ['L', 645, 22],
  ['Q', 671, 25, 670, 50],
  ['L', 667, 325],
  ['Q', 666, 345, 638, 344],
  ['L', 43, 342],
  ['Q', 21, 342, 21, 318],
  ['L', 23, 142],
  ['L', 4, 125],
  ['L', 24, 116],
  ['L', 25, 44],
  ['Q', 23, 24, 44, 19],
]

const SHEET_OUTLINE: OutlineStep[] = [
  ['M', 40, 10],
  ['L', 238, 13],
  ['L', 434, 9],
  ['L', 637, 16],
  ['Q', 660, 16, 663, 42],
  ['L', 660, 151],
  ['L', 663, 257],
  ['L', 658, 313],
  ['Q', 657, 335, 631, 335],
  ['L', 430, 332],
  ['L', 235, 335],
  ['L', 42, 331],
  ['Q', 20, 330, 19, 308],
  ['L', 22, 201],
  ['L', 20, 138],
  ['L', 1, 120],
  ['L', 22, 109],
  ['L', 23, 41],
  ['Q', 22, 18, 40, 10],
]

const TAB_FOLD_WHEN_TAIL_LEFT = 'M40 11L35 30L23 34'
const TAB_FOLD_WHEN_TAIL_RIGHT = 'M644 18L642 34L661 42'

export const tabFoldOf = (isTailLeft: boolean) =>
  isTailLeft ? TAB_FOLD_WHEN_TAIL_LEFT : TAB_FOLD_WHEN_TAIL_RIGHT

export const paperStretch = (boxHeight: number, boxMinHeight: number) =>
  boxMinHeight > 0 ? PAPER_MIN_HEIGHT * Math.max(boxHeight / boxMinHeight - 1, 0) : 0

function traceOutline(outline: OutlineStep[], stretch: number) {
  const lowered = (y: number) => (y > PAPER_STRETCH_FROM ? y + stretch : y)
  const steps = outline.map(([command, ...coordinates]) => {
    const points = coordinates.map((value, index) => (index % 2 === 1 ? lowered(value) : value))
    return `${command}${points.join(' ')}`
  })
  return `${steps.join('')}Z`
}

export const paperOutlines = (stretch: number) => ({
  shadow: traceOutline(SHADOW_OUTLINE, stretch),
  sheet: traceOutline(SHEET_OUTLINE, stretch),
})
