import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

const FONT_URL =
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json'

const TEXT_CFG = {
  font: FONT_URL,
  size: 1.35,
  height: 0.38,
  curveSegments: 32,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.025,
  bevelSegments: 8,
}

// ── 3-D "W" letter with wireframe overlay ───────────────────
function WText() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(t * 0.28) * 0.55
    groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.18
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.1
  })

  return (
    <group ref={groupRef}>
      <Center>
        <group>
          <Text3D {...TEXT_CFG}>
            W
            <meshStandardMaterial
              color="#4169e1"
              emissive="#38bdf8"
              emissiveIntensity={0.45}
              roughness={0.1}
              metalness={1.0}
            />
          </Text3D>
          <Text3D {...TEXT_CFG}>
            W
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.14} />
          </Text3D>
        </group>
      </Center>
    </group>
  )
}

// ── Orbital rings ────────────────────────────────────────────
function OrbitalRings() {
  const r1 = useRef()
  const r2 = useRef()
  const r3 = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    r1.current.rotation.z = t * 0.03
    r1.current.position.y = Math.sin(t * 0.38) * 0.18
    r2.current.rotation.y = t * 0.055
    r2.current.position.x = Math.sin(t * 0.28) * 0.12
    r3.current.rotation.x += 0.002
    r3.current.rotation.z += 0.001
  })

  return (
    <>
      <mesh ref={r1} rotation={[1.2, 0, 0]}>
        <torusGeometry args={[2.4, 0.007, 4, 128]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
      </mesh>
      <mesh ref={r2} rotation={[0.7, 0.4, 0]}>
        <torusGeometry args={[1.9, 0.005, 4, 128]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>
      <mesh ref={r3} rotation={[0.3, 1.0, 0]}>
        <torusGeometry args={[3.0, 0.004, 4, 128]} />
        <meshBasicMaterial color="#4169e1" transparent opacity={0.28} />
      </mesh>
    </>
  )
}

// ── Particle field (original — sparse sphere, multi-colour) ──
function ParticleField({ count = 500 }) {
  const pointsRef = useRef()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#4169e1'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#1e3a8a'),
    ]

    for (let i = 0; i < count; i++) {
      const r = 7 + Math.random() * 11
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi) - 2

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return [pos, col]
  }, [count])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.022
    pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.009) * 0.12
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.18} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// ── Scene group — shifts up on mobile ───────────────────────
function SceneGroup() {
  const { size } = useThree()
  const y = size.width <= 768 ? 1.2 : 0

  return (
    <group position={[0, y, 0]} scale={2}>
      <Suspense fallback={null}>
        <WText />
      </Suspense>
      <OrbitalRings />
      <ParticleField />
    </group>
  )
}

// ── Mouse parallax camera ────────────────────────────────────
// Camera rests at x = -3 so the model at x = 4 sits deep in the right half.
// lookAt stays straight-forward; calling lookAt(world-point) would re-centre
// the model on screen and cancel the offset.
function CameraRig() {
  useFrame(({ camera, mouse }) => {
    const mobile = window.innerWidth <= 768
    const targetX = mobile ? mouse.x * 0.3 : mouse.x * 0.6 - 3
    camera.position.x += (targetX - camera.position.x) * 0.04
    camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.04
    camera.lookAt(camera.position.x, camera.position.y, 0)
  })
  return null
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 65 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#ffffff']} />

      <ambientLight intensity={0.15} />
      <pointLight position={[6, 6, 6]} color="#4169e1" intensity={1.5} />
      <pointLight position={[-6, -6, -4]} color="#38bdf8" intensity={0.8} />
      <pointLight position={[0, -8, 4]} color="#f59e0b" intensity={0.5} />

      <SceneGroup />

      <CameraRig />
    </Canvas>
  )
}
