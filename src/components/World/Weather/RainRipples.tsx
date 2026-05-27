import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWeatherStore } from '../../../store/weatherStore'
import { useCycleStore } from '../../../store/cycleStore'
import RIPPLE_VERT from './shaders/rainRipple.vert.glsl'
import RIPPLE_FRAG from './shaders/rainRipple.frag.glsl'

const MAX_RIPPLES     = 250
const RIPPLE_LIFETIME = 1.8  // seconds per ring
const SPAWN_RATE      = 80   // ripples/second at full rain intensity

export default function RainRipples({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  const progress = useRef(new Float32Array(MAX_RIPPLES).fill(1))
  const centers  = useRef(new Float32Array(MAX_RIPPLES * 2))
  const spawnAcc = useRef(0)
  const nextSlot = useRef(0)

  const { geo, mat } = useMemo(() => {
    const positions = new Float32Array([
      -1, 0, -1,
       1, 0, -1,
       1, 0,  1,
      -1, 0,  1,
    ])
    const idxData = new Uint16Array([0, 2, 1,  0, 3, 2])

    const g = new THREE.InstancedBufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setIndex(new THREE.BufferAttribute(idxData, 1))
    g.instanceCount  = MAX_RIPPLES
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)

    const aProgress = new THREE.InstancedBufferAttribute(new Float32Array(MAX_RIPPLES).fill(1), 1)
    const aCenter   = new THREE.InstancedBufferAttribute(new Float32Array(MAX_RIPPLES * 2), 2)
    g.setAttribute('aProgress', aProgress)
    g.setAttribute('aCenter',   aCenter)

    const m = new THREE.ShaderMaterial({
      vertexShader:   RIPPLE_VERT,
      fragmentShader: RIPPLE_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uIntensity: { value: 0 },
        uColor:     { value: useCycleStore.getState().foamColor },
      },
    })

    return { geo: g, mat: m }
  }, [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame(({ camera }, delta) => {
    const intensity = useWeatherStore.getState().rainIntensity
    mat.uniforms.uIntensity.value = intensity

    const dt        = Math.min(delta, 0.05)
    const aProgress = geo.attributes.aProgress as THREE.InstancedBufferAttribute
    const aCenter   = geo.attributes.aCenter   as THREE.InstancedBufferAttribute
    const prog      = progress.current
    const ctr       = centers.current

    // Advance existing ripples
    for (let i = 0; i < MAX_RIPPLES; i++) {
      if (prog[i] < 1) {
        prog[i] = Math.min(1, prog[i] + dt / RIPPLE_LIFETIME)
        aProgress.array[i] = prog[i]
      }
    }

    if (intensity > 0.01) {
      spawnAcc.current += SPAWN_RATE * intensity * dt
      const ship = shipRef.current
      const cx = ship?.position.x ?? 0
      const cz = ship?.position.z ?? 0

      // Spawn in camera-aligned XZ so ripples cover the full visible ocean.
      // Camera right XZ: (0.7071, -0.7071), camera depth XZ: (-0.7071, -0.7071)
      const cam = camera as THREE.OrthographicCamera
      const hw  = (cam.right / cam.zoom) * 1.15  // slight overflow margin

      while (spawnAcc.current >= 1) {
        spawnAcc.current -= 1
        const slot = nextSlot.current % MAX_RIPPLES
        nextSlot.current++

        prog[slot] = 0
        const r = (Math.random() - 0.5) * hw * 2.0   // along cam right
        const d = (Math.random() - 0.5) * hw * 2.0   // along cam depth

        const rx = cx + r *  0.7071 + d * (-0.7071)
        const rz = cz + r * (-0.7071) + d * (-0.7071)

        ctr[slot * 2]     = rx
        ctr[slot * 2 + 1] = rz
        aCenter.array[slot * 2]     = rx
        aCenter.array[slot * 2 + 1] = rz
      }
    }

    aProgress.needsUpdate = true
    aCenter.needsUpdate   = true
  })

  return (
    <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={7} />
  )
}
