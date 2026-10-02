import * as THREE from 'three'
import { mix, rand } from '@/utils/math'
import {
  SPARK_ARC_SEGMENTS,
  SPARK_ARCS,
  SPARK_BRIGHTNESS_MIN,
  SPARK_DROOP,
  SPARK_IDLE_CHANCE,
  SPARK_JITTER,
  SPARK_LENGTH_MAX,
  SPARK_LENGTH_MIN,
  SPARK_SHELL_INNER,
  SPARK_SHELL_OUTER,
} from './constants'

const _start = new THREE.Vector3()
const _end = new THREE.Vector3()
const _from = new THREE.Vector3()
const _to = new THREE.Vector3()
const _step = new THREE.Vector3()
const _kink = new THREE.Vector3()

interface ArcBuffers {
  positions: THREE.BufferAttribute
  directions: THREE.BufferAttribute
  brightness: THREE.BufferAttribute
}

function writeSegment(buffers: ArcBuffers, segment: number, glow: number) {
  _step.subVectors(_to, _from)
  for (let corner = 0; corner < 4; corner++) {
    const vertex = segment * 4 + corner
    const point = corner < 2 ? _from : _to
    buffers.positions.setXYZ(vertex, point.x, point.y, point.z)
    buffers.directions.setXYZ(vertex, _step.x, _step.y, _step.z)
    buffers.brightness.setX(vertex, glow)
  }
}

export function strikeArcs(geometry: THREE.BufferGeometry, charge: number) {
  const buffers: ArcBuffers = {
    positions: geometry.getAttribute('position') as THREE.BufferAttribute,
    directions: geometry.getAttribute('aDirection') as THREE.BufferAttribute,
    brightness: geometry.getAttribute('aBrightness') as THREE.BufferAttribute,
  }
  const litChance = mix(SPARK_IDLE_CHANCE, 1, charge)

  for (let arc = 0; arc < SPARK_ARCS; arc++) {
    const glow = Math.random() < litChance ? rand(SPARK_BRIGHTNESS_MIN, 1) : 0
    _start.randomDirection()
    _start.y -= SPARK_DROOP
    _start.normalize().multiplyScalar(rand(SPARK_SHELL_INNER, SPARK_SHELL_OUTER))
    _end.randomDirection().multiplyScalar(rand(SPARK_LENGTH_MIN, SPARK_LENGTH_MAX)).add(_start)
    const kinkSize = SPARK_JITTER * _start.distanceTo(_end)

    _from.copy(_start)
    for (let segment = 0; segment < SPARK_ARC_SEGMENTS; segment++) {
      const along = (segment + 1) / SPARK_ARC_SEGMENTS
      _to.lerpVectors(_start, _end, along)
      _to.addScaledVector(_kink.randomDirection(), kinkSize * Math.sin(Math.PI * along))
      writeSegment(buffers, arc * SPARK_ARC_SEGMENTS + segment, glow)
      _from.copy(_to)
    }
  }

  buffers.positions.needsUpdate = true
  buffers.directions.needsUpdate = true
  buffers.brightness.needsUpdate = true
}
