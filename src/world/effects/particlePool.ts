import * as THREE from 'three'
import {
  DROP_TUMBLE_RATE_X,
  DROP_TUMBLE_RATE_Y,
  FOAM_SHRINK,
  SPARK_DRAG,
  SPARK_FADE_IN_RATE,
  SPARK_FLICKER_DEPTH,
  SPARK_FLICKER_FLOOR,
  SPARK_FLICKER_RATE,
  SPARK_FLICKER_SIZE_PHASE,
} from './constants'

interface Particle {
  age: number
  life: number
  x: number
  y: number
  z: number
  velocityX: number
  velocityY: number
  velocityZ: number
  size: number
  glow: number
}

interface GlowPaint {
  base: THREE.Color
  glow: THREE.Color
}

const _dummy = new THREE.Object3D()
const _color = new THREE.Color()

// ── Pool ──────────────────────────────────────────────────────────────────────

export class ParticlePool {
  readonly particles: Particle[]
  private cursor = 0

  constructor(size: number) {
    this.particles = Array.from({ length: size }, () => ({
      age: 0,
      life: 0,
      x: 0,
      y: 0,
      z: 0,
      velocityX: 0,
      velocityY: 0,
      velocityZ: 0,
      size: 0,
      glow: 0,
    }))
  }

  spawn(
    x: number,
    y: number,
    z: number,
    velocityX: number,
    velocityY: number,
    velocityZ: number,
    size: number,
    life: number,
    glow = 0
  ): boolean {
    const total = this.particles.length
    for (let offset = 0; offset < total; offset++) {
      const index = (this.cursor + offset) % total
      const particle = this.particles[index]
      if (particle.age < particle.life) continue

      particle.age = 0
      particle.life = life
      particle.x = x
      particle.y = y
      particle.z = z
      particle.velocityX = velocityX
      particle.velocityY = velocityY
      particle.velocityZ = velocityZ
      particle.size = size
      particle.glow = glow
      this.cursor = (index + 1) % total
      return true
    }
    return false
  }
}

// ── Simulation ────────────────────────────────────────────────────────────────

function commit(mesh: THREE.InstancedMesh, count: number): void {
  mesh.count = count
  mesh.visible = count > 0
  if (count === 0) return
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

function paintGlow(
  mesh: THREE.InstancedMesh,
  index: number,
  { glow }: Particle,
  paint: GlowPaint
): void {
  mesh.setColorAt(index, _color.copy(paint.base).lerp(paint.glow, glow))
}

export function updateFoam(
  pool: ParticlePool,
  mesh: THREE.InstancedMesh,
  dt: number,
  paint?: GlowPaint
): void {
  const damping = Math.exp(-2 * dt)
  let count = 0
  for (const particle of pool.particles) {
    if (particle.age >= particle.life) continue
    particle.age += dt
    particle.x += particle.velocityX * dt
    particle.z += particle.velocityZ * dt
    particle.velocityX *= damping
    particle.velocityZ *= damping

    const progress = Math.min(particle.age / particle.life, 1)
    _dummy.position.set(particle.x, particle.y, particle.z)
    _dummy.rotation.set(0, 0, 0)
    _dummy.scale.setScalar(particle.size * Math.max(0, 1 - progress * FOAM_SHRINK))
    _dummy.updateMatrix()
    if (paint) paintGlow(mesh, count, particle, paint)
    mesh.setMatrixAt(count++, _dummy.matrix)
  }
  commit(mesh, count)
}

const onFlatWater = () => 0

export function updateDrops(
  pool: ParticlePool,
  mesh: THREE.InstancedMesh,
  dt: number,
  gravity: number,
  surfaceAt: (x: number, z: number) => number = onFlatWater,
  paint?: GlowPaint
): void {
  let count = 0
  for (const particle of pool.particles) {
    if (particle.age >= particle.life) continue
    particle.age += dt
    particle.velocityY -= gravity * dt
    particle.x += particle.velocityX * dt
    particle.y += particle.velocityY * dt
    particle.z += particle.velocityZ * dt
    if (particle.y < surfaceAt(particle.x, particle.z)) {
      particle.age = particle.life
      continue
    }

    _dummy.position.set(particle.x, particle.y, particle.z)
    _dummy.rotation.set(particle.age * DROP_TUMBLE_RATE_X, particle.age * DROP_TUMBLE_RATE_Y, 0)
    _dummy.scale.setScalar(particle.size)
    _dummy.updateMatrix()
    if (paint) paintGlow(mesh, count, particle, paint)
    mesh.setMatrixAt(count++, _dummy.matrix)
  }
  commit(mesh, count)
}

export function updateSparks(pool: ParticlePool, mesh: THREE.InstancedMesh, dt: number): void {
  const damping = Math.exp(-SPARK_DRAG * dt)
  let count = 0
  for (const particle of pool.particles) {
    if (particle.age >= particle.life) continue
    particle.age += dt
    particle.velocityX *= damping
    particle.velocityZ *= damping
    particle.x += particle.velocityX * dt
    particle.z += particle.velocityZ * dt

    const progress = Math.min(particle.age / particle.life, 1)
    const flicker =
      SPARK_FLICKER_FLOOR +
      SPARK_FLICKER_DEPTH *
        Math.sin(particle.age * SPARK_FLICKER_RATE + particle.size * SPARK_FLICKER_SIZE_PHASE)
    const fade = Math.min(progress * SPARK_FADE_IN_RATE, 1) * (1 - progress)
    _dummy.position.set(particle.x, particle.y, particle.z)
    _dummy.rotation.set(0, 0, 0)
    _dummy.scale.setScalar(particle.size * fade * flicker)
    _dummy.updateMatrix()
    mesh.setMatrixAt(count++, _dummy.matrix)
  }
  commit(mesh, count)
}
