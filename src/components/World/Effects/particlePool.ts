import * as THREE from 'three'

export interface Particle {
  age: number
  life: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
}

const _dummy = new THREE.Object3D()

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
      vx: 0,
      vy: 0,
      vz: 0,
      size: 0,
    }))
  }

  spawn(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    size: number,
    life: number
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
      particle.vx = vx
      particle.vy = vy
      particle.vz = vz
      particle.size = size
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
  if (count > 0) mesh.instanceMatrix.needsUpdate = true
}

export function updateFoam(pool: ParticlePool, mesh: THREE.InstancedMesh, dt: number): void {
  const damping = Math.exp(-2 * dt)
  let count = 0
  for (const particle of pool.particles) {
    if (particle.age >= particle.life) continue
    particle.age += dt
    particle.x += particle.vx * dt
    particle.z += particle.vz * dt
    particle.vx *= damping
    particle.vz *= damping

    const progress = Math.min(particle.age / particle.life, 1)
    _dummy.position.set(particle.x, particle.y, particle.z)
    _dummy.rotation.set(0, 0, 0)
    _dummy.scale.setScalar(particle.size * Math.max(0, 1 - progress * 1.25))
    _dummy.updateMatrix()
    mesh.setMatrixAt(count++, _dummy.matrix)
  }
  commit(mesh, count)
}

export function updateDrops(
  pool: ParticlePool,
  mesh: THREE.InstancedMesh,
  dt: number,
  gravity: number
): void {
  let count = 0
  for (const particle of pool.particles) {
    if (particle.age >= particle.life) continue
    particle.age += dt
    particle.vy -= gravity * dt
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.z += particle.vz * dt
    if (particle.y < 0) {
      particle.age = particle.life
      continue
    }

    _dummy.position.set(particle.x, particle.y, particle.z)
    _dummy.rotation.set(particle.age * 7, particle.age * 5, 0)
    _dummy.scale.setScalar(particle.size)
    _dummy.updateMatrix()
    mesh.setMatrixAt(count++, _dummy.matrix)
  }
  commit(mesh, count)
}

export function updateSparks(pool: ParticlePool, mesh: THREE.InstancedMesh, dt: number): void {
  const damping = Math.exp(-1.5 * dt)
  let count = 0
  for (const particle of pool.particles) {
    if (particle.age >= particle.life) continue
    particle.age += dt
    particle.vx *= damping
    particle.vz *= damping
    particle.x += particle.vx * dt
    particle.z += particle.vz * dt

    const progress = Math.min(particle.age / particle.life, 1)
    const flicker = 0.75 + 0.25 * Math.sin(particle.age * 18 + particle.size * 50)
    const fade = Math.min(progress * 8, 1) * (1 - progress)
    _dummy.position.set(particle.x, particle.y, particle.z)
    _dummy.rotation.set(0, 0, 0)
    _dummy.scale.setScalar(particle.size * fade * flicker)
    _dummy.updateMatrix()
    mesh.setMatrixAt(count++, _dummy.matrix)
  }
  commit(mesh, count)
}
