import * as THREE from 'three'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import {
  MONITOR_SCREEN_NODE,
  PLAYHEAD_END_SHARE,
  PLAYHEAD_MIN_BRIGHTNESS,
  PLAYHEAD_START_SHARE,
  PLAYHEAD_SWEEP_SECONDS,
} from './constants'

export interface Playhead {
  screen: THREE.Mesh
  vertices: number[]
  restX: Float32Array
  restCentre: number
  centre: number
  start: number
  end: number
}

export function preparePlayhead(model: THREE.Object3D): Playhead | null {
  const node = nodeNamed(model, MONITOR_SCREEN_NODE)
  if (!node) return null

  const screen = meshesOf(node)[0]
  screen.geometry = screen.geometry.clone()
  screen.geometry.computeBoundingBox()
  const { min, max } = screen.geometry.boundingBox!
  const position = screen.geometry.getAttribute('position')
  const color = screen.geometry.getAttribute('color')
  const timelineTop = (min.y + max.y) / 2
  const vertices: number[] = []
  for (let i = 0; i < position.count; i++) {
    const isWhite = Math.min(color.getX(i), color.getY(i), color.getZ(i)) >= PLAYHEAD_MIN_BRIGHTNESS
    if (isWhite && position.getY(i) < timelineTop) vertices.push(i)
  }
  if (vertices.length === 0) return null

  const restX = Float32Array.from(vertices, (vertex) => position.getX(vertex))
  const restCentre = (Math.min(...restX) + Math.max(...restX)) / 2
  return {
    screen,
    vertices,
    restX,
    restCentre,
    centre: restCentre,
    start: THREE.MathUtils.lerp(min.x, max.x, PLAYHEAD_START_SHARE),
    end: THREE.MathUtils.lerp(min.x, max.x, PLAYHEAD_END_SHARE),
  }
}

export function sweepPlayhead(playhead: Playhead, level: number, dt: number): void {
  if (level === 0) return

  const span = playhead.end - playhead.start
  playhead.centre += (span / PLAYHEAD_SWEEP_SECONDS) * level * dt
  if (playhead.centre > playhead.end) playhead.centre -= span

  const shift = playhead.centre - playhead.restCentre
  const position = playhead.screen.geometry.getAttribute('position') as THREE.BufferAttribute
  playhead.vertices.forEach((vertex, index) => position.setX(vertex, playhead.restX[index] + shift))
  position.needsUpdate = true
}
