const OUTLINE_SEARCH_STEPS = 16

export function hullDistance(across: number, along: number): number {
  const absoluteAlong = Math.abs(along)
  const bowWidthScale = Math.max(1 - Math.max(0, along) * 0.5, 0.02)
  const bowDistance = Math.cbrt((across / bowWidthScale) ** 3 + (absoluteAlong * 1.2) ** 3)
  const sternBeam = Math.max(1 - Math.pow(Math.max(0, -along), 3) * 0.3, 0.05)
  const sternDistance = Math.max(across / sternBeam, absoluteAlong)
  const bowBlend = Math.max(0, Math.min(1, along * 2))
  return bowDistance * bowBlend + sternDistance * (1 - bowBlend)
}

export function outlineHalfWidth(along: number): number {
  let inside = 0
  let outside = 2
  for (let step = 0; step < OUTLINE_SEARCH_STEPS; step++) {
    const middle = (inside + outside) / 2
    if (hullDistance(middle, along) < 1) inside = middle
    else outside = middle
  }
  return (inside + outside) / 2
}
