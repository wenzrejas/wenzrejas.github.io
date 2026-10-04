import * as THREE from 'three'
import { PANEL_COPY } from '@/data/panelCopy'
import {
  COMPASS_RADIUS,
  COMPASS_TILT_DEGREES,
  INNER_RING,
  LETTER_REACH,
  MAJOR_POINT_WIDTH,
  MINOR_POINT_LENGTH,
  MINOR_POINT_WIDTH,
  OUTER_RING,
  RAY_END,
  RAY_START,
} from './constants'

interface Spot {
  x: number
  y: number
}

const polar = (angle: number, reach: number): Spot => ({
  x: Math.sin(angle) * reach,
  y: -Math.cos(angle) * reach,
})

const pathPoint = ({ x, y }: Spot) => `${x.toFixed(2)} ${y.toFixed(2)}`

function kite(angle: number, length: number, halfWidth: number) {
  const tip = pathPoint(polar(angle, length))
  const left = pathPoint(polar(angle - Math.PI / 2, halfWidth))
  const right = pathPoint(polar(angle + Math.PI / 2, halfWidth))
  return {
    outline: `M${left} L${tip} L${right} L0 0 Z`,
    shading: `M${left} L${tip} L0 0 Z`,
  }
}

function buildCompassRose(radius: number, tiltDegrees: number) {
  const tilt = THREE.MathUtils.degToRad(tiltDegrees)
  const quarters = [0, 1, 2, 3].map((quarter) => tilt + (quarter * Math.PI) / 2)
  const diagonals = quarters.map((angle) => angle + Math.PI / 4)
  const minor = diagonals.map((angle) =>
    kite(angle, radius * MINOR_POINT_LENGTH, radius * MINOR_POINT_WIDTH)
  )
  const major = quarters.map((angle) => kite(angle, radius, radius * MAJOR_POINT_WIDTH))
  const points = [...minor, ...major]

  return {
    outline: points.map((part) => part.outline).join(' '),
    shading: points.map((part) => part.shading).join(' '),
    innerRing: radius * INNER_RING,
    outerRing: radius * OUTER_RING,
    rays: diagonals
      .map(
        (angle) =>
          `M${pathPoint(polar(angle, radius * RAY_START))} L${pathPoint(polar(angle, radius * RAY_END))}`
      )
      .join(' '),
    letters: quarters.map((angle, i) => ({
      label: PANEL_COPY.compassLetters[i],
      ...polar(angle, radius * LETTER_REACH),
    })),
  }
}

export const COMPASS_ROSE = buildCompassRose(COMPASS_RADIUS, COMPASS_TILT_DEGREES)
