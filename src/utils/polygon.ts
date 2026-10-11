function shoelaceSums(loop: number[]) {
  let doubledArea = 0
  let sumX = 0
  let sumZ = 0
  for (let i = 0; i < loop.length; i += 2) {
    const next = (i + 2) % loop.length
    const cross = loop[i] * loop[next + 1] - loop[next] * loop[i + 1]
    doubledArea += cross
    sumX += (loop[i] + loop[next]) * cross
    sumZ += (loop[i + 1] + loop[next + 1]) * cross
  }
  return { doubledArea, sumX, sumZ }
}

export const polygonArea = (loop: number[]) => Math.abs(shoelaceSums(loop).doubledArea / 2)

export function polygonCentre(loop: number[]): [number, number] {
  const { doubledArea, sumX, sumZ } = shoelaceSums(loop)
  return [sumX / (3 * doubledArea), sumZ / (3 * doubledArea)]
}

export function signedLoopDistance(loop: number[], x: number, z: number): number {
  let nearest = Infinity
  let isInside = false
  for (let i = 0; i < loop.length; i += 2) {
    const next = (i + 2) % loop.length
    const fromX = loop[i]
    const fromZ = loop[i + 1]
    const edgeX = loop[next] - fromX
    const edgeZ = loop[next + 1] - fromZ
    const edgeLengthSquared = edgeX * edgeX + edgeZ * edgeZ
    const along =
      edgeLengthSquared > 0
        ? Math.min(1, Math.max(0, ((x - fromX) * edgeX + (z - fromZ) * edgeZ) / edgeLengthSquared))
        : 0
    nearest = Math.min(nearest, Math.hypot(x - fromX - edgeX * along, z - fromZ - edgeZ * along))
    const crossesRow = fromZ > z !== loop[next + 1] > z
    if (crossesRow && x < fromX + ((z - fromZ) / edgeZ) * edgeX) isInside = !isInside
  }
  return isInside ? -nearest : nearest
}
