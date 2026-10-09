import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import {
  buildOrbGeometry,
  buildStardustGeometry,
  createLogoAtlas,
  createOrbMaterial,
  createStardustMaterial,
  paintLogoAtlas,
} from './logoOrbModel'
import { floatOrb, orbitReveal, type LogoOrb, type Orbit } from './orbits'
import { orbGlow } from '../sanctuaryGlow'

interface LogoOrbsProps {
  orbits: Orbit[]
  orbs: LogoOrb[]
}

export default function LogoOrbs({ orbits, orbs }: LogoOrbsProps) {
  const gl = useThree((state) => state.gl)
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const stardustRef = useRef<THREE.Points>(null)

  const atlas = useMemo(() => createLogoAtlas(orbs.map(({ tool }) => tool)), [orbs])
  const geometry = useMemo(() => buildOrbGeometry(), [])
  const materials = useMemo(
    () => orbs.map(({ tool }) => createOrbMaterial(atlas, tool)),
    [orbs, atlas]
  )
  const stardustGeometry = useMemo(() => buildStardustGeometry(orbits), [orbits])
  const stardustMaterial = useMemo(() => createStardustMaterial(orbits.length), [orbits])

  useEffect(() => {
    paintLogoAtlas(atlas).then(() => gl.initTexture(atlas.texture))
  }, [atlas, gl])

  useEffect(
    () => () => {
      atlas.texture.dispose()
      geometry.dispose()
      for (const material of materials) material.dispose()
      stardustGeometry.dispose()
      stardustMaterial.dispose()
    },
    [atlas, geometry, materials, stardustGeometry, stardustMaterial]
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const glow = orbGlow()
    orbs.forEach((orb, i) => {
      const mesh = meshes.current[i]
      if (!mesh) return
      if (orb.orbit.presence === 0) {
        mesh.visible = false
        return
      }
      floatOrb(orb, time)
      mesh.visible = orb.opacity > 0
      mesh.position.copy(orb.position)
      mesh.scale.setScalar(orb.size)
      const uniforms = uniformsOf(mesh)
      uniforms.uOpacity.value = orb.opacity
      uniforms.uGlow.value = glow
      uniforms.uTime.value = time
    })
    const stardust = stardustRef.current
    if (!stardust) return
    const uniforms = uniformsOf(stardust)
    const reveals: number[] = uniforms.uReveal.value
    orbits.forEach((orbit, i) => {
      reveals[i] = orbitReveal(orbit)
    })
    stardust.visible = reveals.some((reveal) => reveal > 0)
    if (!stardust.visible) return
    uniforms.uGlow.value = glow
    uniforms.uTime.value = time
    uniforms.uPixelRatio.value = gl.getPixelRatio()
  })

  return (
    <>
      <points
        ref={stardustRef}
        geometry={stardustGeometry}
        material={stardustMaterial}
        renderOrder={RENDER_LAYER.glow}
        visible={false}
      />
      {orbs.map((orb, i) => (
        <mesh
          key={`${orb.orbit.statue.grove}-${orb.tool}`}
          ref={(mesh) => {
            meshes.current[i] = mesh
          }}
          geometry={geometry}
          material={materials[i]}
          renderOrder={RENDER_LAYER.overGlow}
          visible={false}
        />
      ))}
    </>
  )
}
