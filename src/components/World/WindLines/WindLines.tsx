import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDebugStore } from '../../../store/debugStore'
import { useWindStore } from '../../../store/windStore'
import { useWeatherStore } from '../../../store/weatherStore'
import WIND_VERT from './shaders/windlines.vert.glsl'
import WIND_FRAG from './shaders/windlines.frag.glsl'
import { CYCLE_DURATION } from '../DayNightCycle/DayNightCycle'

const POOL_SIZE = 8
const HANDLES_COUNT = 5
const CURVE_DIVISIONS = 40

// One vertex pair per curve point; shader expands each pair in local Z
function buildWindLineGeometry(handlesCount: number, divisions: number): THREE.BufferGeometry {
  const handles: THREE.Vector3[] = []
  for (let i = 0; i < handlesCount; i++) {
    handles.push(
      new THREE.Vector3(
        i / (handlesCount - 1) - 0.5, // X: –0.5 → +0.5 (scaled by mesh.scale.x)
        (i % 2 === 0 ? 1 : -1) * 0.5, // Y: ±0.5 (scaled by mesh.scale.y = waveAmplitude)
        0
      )
    )
  }

  const curve = new THREE.CatmullRomCurve3(handles)
  const points = curve.getPoints(divisions)
  const count = points.length

  const positions = new Float32Array(count * 2 * 3)
  const ratios = new Float32Array(count * 2)
  const sides = new Float32Array(count * 2)
  const indices: number[] = []

  for (let i = 0; i < count; i++) {
    const pt = points[i]
    const vi = i * 2
    const pi = i * 6

    positions[pi + 0] = pt.x
    positions[pi + 1] = pt.y
    positions[pi + 2] = pt.z
    positions[pi + 3] = pt.x
    positions[pi + 4] = pt.y
    positions[pi + 5] = pt.z

    ratios[vi] = ratios[vi + 1] = i / (count - 1)
    sides[vi] = -0.5
    sides[vi + 1] = 0.5

    if (i < count - 1) {
      indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('ratio', new THREE.BufferAttribute(ratios, 1))
  geo.setAttribute('side', new THREE.BufferAttribute(sides, 1))
  geo.setIndex(indices)
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
  return geo
}

interface LineState {
  active: boolean
  progress: number
  duration: number
  vx: number
  vz: number
}

export default function WindLines({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  const geometry = useMemo(() => buildWindLineGeometry(HANDLES_COUNT, CURVE_DIVISIONS), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  const meshRefs = useRef<(THREE.Mesh | null)[]>(Array(POOL_SIZE).fill(null))
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>(Array(POOL_SIZE).fill(null))

  const states = useRef<LineState[]>(
    Array.from({ length: POOL_SIZE }, () => ({
      active: false,
      progress: 0,
      duration: 3,
      vx: 0,
      vz: 0,
    }))
  )

  const nextSpawnAt = useRef(0)
  const windAngle = useRef(useWindStore.getState().angle)
  const windTarget = useRef(
    useWindStore.getState().angle + (0.5 + Math.random()) * Math.PI * (Math.random() < 0.5 ? 1 : -1)
  )
  const nextWindChange = useRef(CYCLE_DURATION / 2)

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = clock.getElapsedTime()
    const ship = shipRef.current
    const wl = useDebugStore.getState().windLines
    const wind = useWindStore.getState()

    // Animate wind direction — faster rate so the gap stays brief
    let diff = windTarget.current - windAngle.current
    diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI
    const absDiff = Math.abs(diff)
    windAngle.current += Math.max(-1.5 * dt, Math.min(1.5 * dt, diff))
    nextWindChange.current -= dt
    if (nextWindChange.current <= 0) {
      const shift = (0.5 + Math.random() * 0.8) * Math.PI * (Math.random() < 0.5 ? 1 : -1)
      windTarget.current = windAngle.current + shift
      nextWindChange.current = CYCLE_DURATION / 2
      // Kill all active lines so no old-direction streaks remain visible
      for (let i = 0; i < POOL_SIZE; i++) {
        states.current[i].active = false
        if (meshRefs.current[i]) meshRefs.current[i]!.visible = false
      }
    }
    wind.angle = windAngle.current
    wind.dir.set(Math.cos(windAngle.current), -Math.sin(windAngle.current))

    for (let i = 0; i < POOL_SIZE; i++) {
      const state = states.current[i]
      const mesh = meshRefs.current[i]
      const mat = matRefs.current[i]
      if (!mesh || !mat) continue

      if (!state.active || !wl.windEnabled) {
        if (mesh.visible) mesh.visible = false
        continue
      }

      state.progress += dt / state.duration
      mesh.position.x += state.vx * dt
      mesh.position.z += state.vz * dt
      mat.uniforms.uProgress.value = state.progress
      mat.uniforms.uOpacity.value = wl.windOpacity
      mat.uniforms.uThickness.value = wl.lineWidth
      if (!mesh.visible) mesh.visible = true

      if (state.progress >= 1.1) {
        state.active = false
        mesh.visible = false
      }
    }

    if (!wl.windEnabled) return

    // Don't spawn while direction is still changing — avoids mixed-angle lines
    if (absDiff > 0.1) return

    if (time >= nextSpawnAt.current) {
      const idx = states.current.findIndex((s) => !s.active)
      if (idx !== -1) {
        const state = states.current[idx]
        const mesh = meshRefs.current[idx]
        const mat = matRefs.current[idx]
        if (mesh && mat) {
          const { windMult } = useWeatherStore.getState()
          const rad = wind.angle
          const cx = ship ? ship.position.x : 0
          const cz = ship ? ship.position.z : 0

          state.active = true
          state.progress = 0
          state.duration = wl.lineDuration
          // Local X after mesh.rotation.y = rad maps to world (cos rad, 0, –sin rad)
          state.vx = Math.cos(rad) * wl.windSpeed * windMult
          state.vz = -Math.sin(rad) * wl.windSpeed * windMult

          mesh.position.set(
            cx + (Math.random() - 0.5) * 300,
            wl.lineY,
            cz + (Math.random() - 0.5) * 300
          )
          mesh.rotation.y = rad
          // scale: X = line length, Y = wave amplitude, Z = 1 (shader handles ribbon thickness)
          mesh.scale.set(wl.lineLength, wl.waveAmplitude, 1)
          mat.uniforms.uProgress.value = 0
          mat.uniforms.uThickness.value = wl.lineWidth
        }
      }
      nextSpawnAt.current = time + wl.spawnInterval * (0.5 + Math.random())
    }
  })

  return (
    <>
      {Array.from({ length: POOL_SIZE }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          geometry={geometry}
          visible={false}
          frustumCulled={false}
          renderOrder={5}
        >
          <shaderMaterial
            ref={(el) => {
              matRefs.current[i] = el as THREE.ShaderMaterial | null
            }}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            uniforms={{
              uProgress: { value: 0 },
              uOpacity: { value: 0.5 },
              uThickness: { value: 1.0 },
            }}
            vertexShader={WIND_VERT}
            fragmentShader={WIND_FRAG}
          />
        </mesh>
      ))}
    </>
  )
}
