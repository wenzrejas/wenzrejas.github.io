import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { disposeAll } from '@/utils/dispose'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import {
  buildOrbGeometry,
  buildStardustGeometry,
  createLogoAtlas,
  createOrbMaterial,
  createStardustMaterial,
  paintLogoAtlas,
} from './logoOrbModel'
import { paintOrbs, paintStardust } from './logoOrbLook'
import type { LogoOrb, Orbit } from './orbits'
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
    paintLogoAtlas(atlas)
      .then(() => gl.initTexture(atlas.texture))
      .catch((error: unknown) => console.warn('Could not paint the logo atlas', error))
  }, [atlas, gl])

  useEffect(
    () => () =>
      disposeAll(atlas.texture, geometry, ...materials, stardustGeometry, stardustMaterial),
    [atlas, geometry, materials, stardustGeometry, stardustMaterial]
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const glow = orbGlow()
    paintOrbs(meshes.current, orbs, time, glow)
    const stardust = stardustRef.current
    if (stardust) paintStardust(stardust, orbits, time, glow, gl.getPixelRatio())
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
