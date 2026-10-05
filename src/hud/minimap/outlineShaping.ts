import { polygonCentre } from '@/utils/polygon'
import { seededRandom } from '@/utils/random'
import {
  ELLIPSE_STRETCH,
  ELLIPSE_TILT,
  FACET_DEPTH,
  FACET_LENGTH,
  FACET_SHIFT,
  ROUND_SAMPLES,
} from './constants'

interface RadialShape {
  centreX: number
  centreZ: number
  reachAt: (angle: number) => number
}

const SAMPLE_ANGLES = Array.from(
  { length: ROUND_SAMPLES },
  (_, i) => (i / ROUND_SAMPLES) * Math.PI * 2
)

function reachAlong(loop: number[], centreX: number, centreZ: number, angle: number): number {
  const directionX = Math.cos(angle)
  const directionZ = Math.sin(angle)
  let reach = 0
  for (let i = 0; i < loop.length; i += 2) {
    const next = (i + 2) % loop.length
    const edgeX = loop[next] - loop[i]
    const edgeZ = loop[next + 1] - loop[i + 1]
    const offsetX = loop[i] - centreX
    const offsetZ = loop[i + 1] - centreZ
    const turn = directionX * edgeZ - directionZ * edgeX
    if (turn === 0) continue
    const along = (offsetX * edgeZ - offsetZ * edgeX) / turn
    const across = (offsetX * directionZ - offsetZ * directionX) / turn
    if (along > 0 && across >= 0 && across <= 1) reach = Math.max(reach, along)
  }
  return reach
}

function radialProfile(loop: number[]) {
  const [centreX, centreZ] = polygonCentre(loop)
  const reaches = SAMPLE_ANGLES.map((angle) => reachAlong(loop, centreX, centreZ, angle))
  return { centreX, centreZ, reaches }
}

const averageOf = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length

export function lobedShape(loop: number[], lobes: number): RadialShape {
  const { centreX, centreZ, reaches } = radialProfile(loop)
  const terms = Array.from({ length: lobes + 1 }, (_, lobe) => {
    const weight = (lobe === 0 ? 1 : 2) / ROUND_SAMPLES
    let cosine = 0
    let sine = 0
    SAMPLE_ANGLES.forEach((angle, i) => {
      cosine += reaches[i] * Math.cos(lobe * angle)
      sine += reaches[i] * Math.sin(lobe * angle)
    })
    return { lobe, cosine: cosine * weight, sine: sine * weight }
  })
  const reachAt = (angle: number) =>
    terms.reduce(
      (sum, { lobe, cosine, sine }) =>
        sum + cosine * Math.cos(lobe * angle) + sine * Math.sin(lobe * angle),
      0
    )
  return { centreX, centreZ, reachAt }
}

export function ellipseShape(loop: number[]): RadialShape {
  const { centreX, centreZ, reaches } = radialProfile(loop)
  const meanReach = averageOf(reaches)
  const reachAt = (angle: number) =>
    meanReach * (1 + ELLIPSE_STRETCH * Math.cos(2 * (angle - ELLIPSE_TILT)))
  return { centreX, centreZ, reachAt }
}

export function facetedOutline({ centreX, centreZ, reachAt }: RadialShape, seed: number): number[] {
  const random = seededRandom(seed)
  const perimeter = 2 * Math.PI * averageOf(SAMPLE_ANGLES.map(reachAt))
  const corners = Math.round(perimeter / FACET_LENGTH)
  return Array.from({ length: corners }, (_, i) => {
    const angle = ((i + (random() - 0.5) * FACET_SHIFT) / corners) * Math.PI * 2
    const reach = reachAt(angle) * (1 + (random() * 2 - 1) * FACET_DEPTH)
    return [centreX + Math.cos(angle) * reach, centreZ + Math.sin(angle) * reach]
  }).flat()
}
