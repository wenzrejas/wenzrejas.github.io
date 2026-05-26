import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDebug } from '../../Debug/DebugControls'

const POOL_SIZE = 8
const HANDLES_COUNT = 5
const CURVE_DIVISIONS = 40

const WIND_VERT = /* glsl */ `
  attribute float ratio;
  attribute float side;

  uniform float uProgress;
  uniform float uThickness;

  varying float vRatio;
  varying float vActive;

  void main() {
    vRatio = ratio;

    // Bruno-style: remap progress so the window sweeps ratio 0→1 as progress 0→1
    float remapped  = uProgress * 3.0 - 1.0;
    float baseTaper = smoothstep(0.0, 1.0, 1.0 - abs(ratio - 0.5) * 2.0);
    float envelope  = smoothstep(0.0, 1.0, 1.0 - abs(ratio - remapped));
    float thickness = uThickness * baseTaper * envelope;

    vActive = envelope;

    // Expand in local Z — perpendicular to the XY curve plane
    vec3 localPos = position + vec3(0.0, 0.0, side * thickness);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(localPos, 1.0);
  }
`

const WIND_FRAG = /* glsl */ `
  uniform float uProgress;
  uniform float uOpacity;

  varying float vRatio;
  varying float vActive;

  void main() {
    float endFade = smoothstep(0.0, 0.07, vRatio) * smoothstep(1.0, 0.93, vRatio);

    float remapped = uProgress * 3.0 - 1.0;
    float dist  = abs(vRatio - remapped);
    float pulse = exp(-dist * dist * 18.0);
    float trail = max(0.0, 1.0 - max(0.0, remapped - vRatio) * 4.0) * 0.25
                  * step(vRatio, remapped);

    float alpha = (pulse + trail) * endFade * uOpacity;
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

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
  const { windLines: wl } = useDebug()

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

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = clock.getElapsedTime()
    const ship = shipRef.current

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

    if (time >= nextSpawnAt.current) {
      const idx = states.current.findIndex((s) => !s.active)
      if (idx !== -1) {
        const state = states.current[idx]
        const mesh = meshRefs.current[idx]
        const mat = matRefs.current[idx]
        if (mesh && mat) {
          const rad = (wl.windAngle * Math.PI) / 180
          const cx = ship ? ship.position.x : 0
          const cz = ship ? ship.position.z : 0

          state.active = true
          state.progress = 0
          state.duration = wl.lineDuration
          // Local X after mesh.rotation.y = rad maps to world (cos rad, 0, –sin rad)
          state.vx = Math.cos(rad) * wl.windSpeed
          state.vz = -Math.sin(rad) * wl.windSpeed

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
