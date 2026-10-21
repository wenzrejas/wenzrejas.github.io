import * as THREE from 'three'
import { seededRandom } from '@/utils/random'
import {
  CELL_TEXTURE_CELLS,
  CELL_TEXTURE_RANGE,
  CELL_TEXTURE_SEED,
  CELL_TEXTURE_SIZE,
} from './constants'

function cellPoints(): Float32Array {
  const random = seededRandom(CELL_TEXTURE_SEED)
  return Float32Array.from({ length: CELL_TEXTURE_CELLS * CELL_TEXTURE_CELLS * 2 }, random)
}

function nearestCellDistance(points: Float32Array, x: number, y: number): number {
  const cellX = Math.floor(x)
  const cellY = Math.floor(y)
  let nearestSquared = Infinity
  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      const column = (cellX + offsetX + CELL_TEXTURE_CELLS) % CELL_TEXTURE_CELLS
      const row = (cellY + offsetY + CELL_TEXTURE_CELLS) % CELL_TEXTURE_CELLS
      const point = (row * CELL_TEXTURE_CELLS + column) * 2
      const gapX = cellX + offsetX + points[point] - x
      const gapY = cellY + offsetY + points[point + 1] - y
      nearestSquared = Math.min(nearestSquared, gapX * gapX + gapY * gapY)
    }
  }
  return Math.sqrt(nearestSquared)
}

export function buildCellTexture(): THREE.DataTexture {
  const points = cellPoints()
  const texels = new Uint8Array(CELL_TEXTURE_SIZE * CELL_TEXTURE_SIZE)
  const cellsPerTexel = CELL_TEXTURE_CELLS / CELL_TEXTURE_SIZE
  for (let row = 0; row < CELL_TEXTURE_SIZE; row++) {
    for (let column = 0; column < CELL_TEXTURE_SIZE; column++) {
      const distance = nearestCellDistance(
        points,
        (column + 0.5) * cellsPerTexel,
        (row + 0.5) * cellsPerTexel
      )
      texels[row * CELL_TEXTURE_SIZE + column] = Math.round(
        Math.min(distance / CELL_TEXTURE_RANGE, 1) * 255
      )
    }
  }

  const texture = new THREE.DataTexture(
    texels,
    CELL_TEXTURE_SIZE,
    CELL_TEXTURE_SIZE,
    THREE.RedFormat,
    THREE.UnsignedByteType
  )
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}
