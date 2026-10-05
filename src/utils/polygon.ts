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
