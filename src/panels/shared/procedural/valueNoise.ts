import type { Random } from '@/utils/random'

export interface NoiseOctave {
  cellWidth: number
  cellHeight: number
  weight: number
}

export interface NoiseGrid {
  values: Float32Array
  width: number
  height: number
}

const fade = (t: number) => t * t * (3 - 2 * t)

function latticeSpans(size: number, cells: number, shift: number) {
  const before = new Int32Array(size)
  const after = new Int32Array(size)
  const blend = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    const position = (i / size) * cells + shift
    const cell = Math.floor(position)
    before[i] = cell % cells
    after[i] = (cell + 1) % cells
    blend[i] = fade(position - cell)
  }
  return { before, after, blend }
}

export function noiseGrid(width: number, height: number): NoiseGrid {
  return { values: new Float32Array(width * height).fill(0.5), width, height }
}

function addNoiseOctave(
  grid: NoiseGrid,
  columns: number,
  rows: number,
  weight: number,
  random: Random
) {
  const { values, width, height } = grid
  const lattice = Float32Array.from({ length: columns * rows }, () => random() - 0.5)
  const across = latticeSpans(width, columns, random())
  const down = latticeSpans(height, rows, random())

  for (let y = 0; y < height; y++) {
    const above = down.before[y] * columns
    const below = down.after[y] * columns
    const blendY = down.blend[y]
    for (let x = 0; x < width; x++) {
      const left = across.before[x]
      const right = across.after[x]
      const blendX = across.blend[x]
      const top = lattice[above + left] + (lattice[above + right] - lattice[above + left]) * blendX
      const bottom =
        lattice[below + left] + (lattice[below + right] - lattice[below + left]) * blendX
      values[y * width + x] += (top + (bottom - top) * blendY) * weight
    }
  }
}

export function addNoiseOctaves(
  grid: NoiseGrid,
  octaves: NoiseOctave[],
  random: Random,
  spanWidth = grid.width,
  spanHeight = grid.height
) {
  for (const { cellWidth, cellHeight, weight } of octaves) {
    const columns = Math.max(1, Math.round(spanWidth / cellWidth))
    const rows = Math.max(1, Math.round(spanHeight / cellHeight))
    addNoiseOctave(grid, columns, rows, weight, random)
  }
}
