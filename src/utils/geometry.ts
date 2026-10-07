import * as THREE from 'three'

export const buildFlatQuad = () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)

export function stitchRibbon(indices: number[], firstVertex: number, pairCount: number): void {
  for (let pair = 0; pair < pairCount - 1; pair++) {
    const vertex = firstVertex + pair * 2
    indices.push(vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2)
  }
}
