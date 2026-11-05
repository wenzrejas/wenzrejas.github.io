import * as THREE from 'three'
import { mix } from '@/utils/math'
import {
  BELL_GLOW,
  BELL_PROFILE,
  BELL_SEGMENTS,
  DEGENERATE_FACET_SIZE,
  JELLYFISH_LEAN,
  PULSE_SECONDS,
  PULSE_SQUEEZE,
  RIM_GLOW,
  RIM_POWER,
  TENTACLE_COUNT,
  TENTACLE_GLOW,
  TENTACLE_LENGTH,
  TENTACLE_RIM_REACH,
  TENTACLE_ROOT_WIDTH,
  TENTACLE_SEGMENTS,
  TENTACLE_SWAY,
  TENTACLE_SWAY_RATE,
  TENTACLE_TIP_WIDTH,
  TENTACLE_TRAIL,
} from './constants'

type Point = [number, number, number]

interface Body {
  positions: number[]
  normals: number[]
  shapes: number[]
}

export const JELLYFISH_BODY_DEFINES = {
  PULSE_SECONDS,
  PULSE_SQUEEZE,
  LEAN: JELLYFISH_LEAN,
  TENTACLE_SWAY,
  TENTACLE_SWAY_RATE,
  TENTACLE_TRAIL,
  BELL_GLOW,
  RIM_GLOW,
  RIM_POWER,
  TENTACLE_GLOW,
}

const BELL_RIM_Y = BELL_PROFILE[BELL_PROFILE.length - 1][1]

const _edge = new THREE.Vector3()
const _side = new THREE.Vector3()
const _facing = new THREE.Vector3()

function addFacet(body: Body, corners: Point[], shapes: Point[]) {
  const [cornerA, cornerB, cornerC] = corners
  _edge.set(cornerB[0] - cornerA[0], cornerB[1] - cornerA[1], cornerB[2] - cornerA[2])
  _side.set(cornerC[0] - cornerA[0], cornerC[1] - cornerA[1], cornerC[2] - cornerA[2])
  _facing.crossVectors(_edge, _side)
  if (_facing.lengthSq() < DEGENERATE_FACET_SIZE) return
  _facing.normalize()
  for (const [index, corner] of corners.entries()) {
    body.positions.push(...corner)
    body.normals.push(_facing.x, _facing.y, _facing.z)
    body.shapes.push(...shapes[index])
  }
}

function addBell(body: Body) {
  const ring = (radius: number, height: number, segment: number): Point => {
    const angle = (segment / BELL_SEGMENTS) * Math.PI * 2
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius]
  }
  const bellShapes: Point[] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let band = 0; band < BELL_PROFILE.length - 1; band++) {
    const [upperRadius, upperHeight] = BELL_PROFILE[band]
    const [lowerRadius, lowerHeight] = BELL_PROFILE[band + 1]
    for (let segment = 0; segment < BELL_SEGMENTS; segment++) {
      const cornerA = ring(upperRadius, upperHeight, segment)
      const cornerB = ring(upperRadius, upperHeight, segment + 1)
      const cornerC = ring(lowerRadius, lowerHeight, segment + 1)
      const cornerD = ring(lowerRadius, lowerHeight, segment)
      addFacet(body, [cornerA, cornerB, cornerC], bellShapes)
      addFacet(body, [cornerA, cornerC, cornerD], bellShapes)
    }
  }
}

function addTentacles(body: Body) {
  for (let strand = 0; strand < TENTACLE_COUNT; strand++) {
    const angle = ((strand + 0.5) / TENTACLE_COUNT) * Math.PI * 2
    const rootX = Math.cos(angle) * TENTACLE_RIM_REACH
    const rootZ = Math.sin(angle) * TENTACLE_RIM_REACH
    const strandShare = strand / TENTACLE_COUNT
    const edgeAt = (step: number, side: number): Point => {
      const along = step / TENTACLE_SEGMENTS
      const halfWidth = mix(TENTACLE_ROOT_WIDTH, TENTACLE_TIP_WIDTH, along) / 2
      return [rootX + side * halfWidth, BELL_RIM_Y - along * TENTACLE_LENGTH, rootZ]
    }
    const shapeAt = (step: number): Point => [1, step / TENTACLE_SEGMENTS, strandShare]
    for (let step = 0; step < TENTACLE_SEGMENTS; step++) {
      const upper = shapeAt(step)
      const lower = shapeAt(step + 1)
      addFacet(
        body,
        [edgeAt(step, -1), edgeAt(step, 1), edgeAt(step + 1, 1)],
        [upper, upper, lower]
      )
      addFacet(
        body,
        [edgeAt(step, -1), edgeAt(step + 1, 1), edgeAt(step + 1, -1)],
        [upper, lower, lower]
      )
    }
  }
}

export function setJellyfishBody(geometry: THREE.BufferGeometry) {
  const body: Body = { positions: [], normals: [], shapes: [] }
  addBell(body)
  addTentacles(body)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(body.positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(body.normals, 3))
  geometry.setAttribute('shape', new THREE.Float32BufferAttribute(body.shapes, 3))
}
