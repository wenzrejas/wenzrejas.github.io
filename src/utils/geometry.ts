import * as THREE from 'three'

export const buildFlatQuad = () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)

export function stitchRibbon(indices: number[], firstVertex: number, pairCount: number): void {
  for (let pair = 0; pair < pairCount - 1; pair++) {
    const vertex = firstVertex + pair * 2
    indices.push(vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2)
  }
}

export function connectedParts(geometry: THREE.BufferGeometry): Int32Array {
  const positions = geometry.getAttribute('position')
  const index = geometry.index!.array
  const part = new Int32Array(positions.count)
  const firstAtSpot = new Map<string, number>()
  for (let i = 0; i < positions.count; i++) {
    const spot = `${positions.getX(i)},${positions.getY(i)},${positions.getZ(i)}`
    part[i] = firstAtSpot.get(spot) ?? i
    if (part[i] === i) firstAtSpot.set(spot, i)
  }

  const partOf = (vertex: number) => {
    while (part[vertex] !== vertex) vertex = part[vertex] = part[part[vertex]]
    return vertex
  }
  for (let i = 0; i < index.length; i += 3) {
    part[partOf(index[i])] = partOf(index[i + 1])
    part[partOf(index[i + 1])] = partOf(index[i + 2])
  }
  for (let i = 0; i < positions.count; i++) part[i] = partOf(i)
  return part
}
