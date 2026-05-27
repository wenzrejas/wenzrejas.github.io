import { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import RAIN_VERT from './shaders/rain.vert.glsl'
import RAIN_FRAG from './shaders/rain.frag.glsl'
import { useWeatherStore } from '../../../store/weatherStore'
import { useWindStore } from '../../../store/windStore'
import { useCycleStore } from '../../../store/cycleStore'

const RAIN_COUNT = 1000
const CORNERS = [
  [-0.5, 0],
  [0.5, 0],
  [-0.5, 1],
  [0.5, 1],
] as const

export default function Rain({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  const { geo, mat } = useMemo(() => {
    const verts = RAIN_COUNT * 4
    const seeds = new Float32Array(verts * 3)
    const corners = new Float32Array(verts * 2)
    const indices = new Uint32Array(RAIN_COUNT * 6)

    for (let i = 0; i < RAIN_COUNT; i++) {
      const xs = Math.random(),
        ps = Math.random(),
        ds = Math.random()
      for (let v = 0; v < 4; v++) {
        const vi = i * 4 + v
        seeds[vi * 3] = xs
        seeds[vi * 3 + 1] = ps
        seeds[vi * 3 + 2] = ds
        corners[vi * 2] = CORNERS[v][0]
        corners[vi * 2 + 1] = CORNERS[v][1]
      }
      const ii = i * 6,
        vi = i * 4
      indices[ii] = vi
      indices[ii + 1] = vi + 1
      indices[ii + 2] = vi + 2
      indices[ii + 3] = vi + 1
      indices[ii + 4] = vi + 3
      indices[ii + 5] = vi + 2
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
    g.setAttribute('aCorner', new THREE.BufferAttribute(corners, 2))
    g.setIndex(new THREE.BufferAttribute(indices, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)

    const m = new THREE.ShaderMaterial({
      vertexShader: RAIN_VERT,
      fragmentShader: RAIN_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uWindDir: { value: new THREE.Vector2() },
        uShipXZ: { value: new THREE.Vector2() },
        uColor: { value: useCycleStore.getState().foamColor },
      },
    })

    return { geo: g, mat: m }
  }, [])

  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat]
  )

  useFrame(({ clock }) => {
    const intensity = useWeatherStore.getState().rainIntensity
    mat.uniforms.uIntensity.value = intensity
    if (intensity <= 0.01) return

    const wind = useWindStore.getState()
    const ship = shipRef.current
    mat.uniforms.uTime.value = clock.getElapsedTime()
    mat.uniforms.uWindDir.value.set(wind.dir.x, wind.dir.y)
    mat.uniforms.uShipXZ.value.set(ship?.position.x ?? 0, ship?.position.z ?? 0)
  })

  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={9} />
}
