import { addNoiseOctaves, noiseGrid } from '@/panels/shared/procedural/valueNoise'
import { mix } from '@/utils/math'
import { seededRandom } from '@/utils/random'
import {
  DISSOLVE_BILLOW,
  DISSOLVE_CELL_PIXELS,
  DISSOLVE_OCTAVES,
  DISSOLVE_SEED,
  DISSOLVE_SOFTNESS,
} from './constants'

export interface DissolveField {
  values: Float32Array
  sortedValues: Float32Array
  columns: number
  rows: number
}

export function createDissolveField(
  width: number,
  height: number,
  originX: number,
  originY: number
): DissolveField {
  const columns = Math.ceil(width / DISSOLVE_CELL_PIXELS) + 1
  const rows = Math.ceil(height / DISSOLVE_CELL_PIXELS) + 1
  const billows = noiseGrid(columns, rows)
  addNoiseOctaves(
    billows,
    DISSOLVE_OCTAVES,
    seededRandom(DISSOLVE_SEED),
    columns * DISSOLVE_CELL_PIXELS,
    rows * DISSOLVE_CELL_PIXELS
  )

  const reach = Math.hypot(Math.max(originX, width - originX), Math.max(originY, height - originY))
  const values = new Float32Array(columns * rows)
  for (let row = 0; row < rows; row++) {
    const down = row * DISSOLVE_CELL_PIXELS - originY
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column
      const across = column * DISSOLVE_CELL_PIXELS - originX
      const distance = Math.sqrt(across * across + down * down) / reach
      values[index] = distance + (billows.values[index] - 0.5) * DISSOLVE_BILLOW
    }
  }
  return { values, sortedValues: values.slice().sort(), columns, rows }
}

export function clearingFront({ sortedValues }: DissolveField, clearedShare: number) {
  const quantile = sortedValues[Math.round(clearedShare * (sortedValues.length - 1))]
  return quantile + mix(-DISSOLVE_SOFTNESS, DISSOLVE_SOFTNESS, clearedShare)
}

export function fieldBytes({ values, sortedValues }: DissolveField) {
  const lowest = sortedValues[0]
  const span = sortedValues[sortedValues.length - 1] - lowest
  const bytes = new Uint8Array(values.length)
  values.forEach((value, index) => (bytes[index] = Math.round(((value - lowest) / span) * 255)))
  return { bytes, lowest, span }
}
