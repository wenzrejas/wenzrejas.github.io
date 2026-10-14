export interface FrameCentroid {
  x: number
  y: number
}

export function frameCentroids(
  { data, width }: ImageData,
  cellPixels: number,
  frameCount: number,
  columns: number
) {
  const centroids: (FrameCentroid | null)[] = []
  for (let frame = 0; frame < frameCount; frame++) {
    const left = (frame % columns) * cellPixels
    const top = Math.floor(frame / columns) * cellPixels
    let weight = 0
    let weightedX = 0
    let weightedY = 0
    for (let y = 0; y < cellPixels; y++) {
      for (let x = 0; x < cellPixels; x++) {
        const alpha = data[((top + y) * width + left + x) * 4 + 3]
        weight += alpha
        weightedX += x * alpha
        weightedY += y * alpha
      }
    }
    centroids.push(
      weight > 0 ? { x: weightedX / weight / cellPixels, y: weightedY / weight / cellPixels } : null
    )
  }
  return centroids
}
