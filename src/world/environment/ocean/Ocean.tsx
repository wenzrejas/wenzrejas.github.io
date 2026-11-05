import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { disposeAll } from '@/utils/dispose'
import { OCEAN_GRID_FRAME_PRIORITY, OCEAN_Y } from './constants'
import { createOceanGrid, showVisibleCells } from './oceanGrid'
import { paintOcean, swellWithWind } from './oceanLook'
import { createOceanMaterial } from './oceanModel'
import { useShoreCalm } from './useShoreCalm'

export default function Ocean() {
  const windSwell = useRef(1)
  const material = useMemo(() => createOceanMaterial(), [])
  const grid = useMemo(() => createOceanGrid(), [])
  useShoreCalm()

  useEffect(() => () => disposeAll(grid.geometry, material), [grid, material])

  useFrame(({ camera }) => showVisibleCells(grid, camera), OCEAN_GRID_FRAME_PRIORITY)

  useFrame(({ clock }, delta) => {
    paintOcean(material.uniforms, clock.getElapsedTime())
    windSwell.current = swellWithWind(material.uniforms, windSwell.current, delta)
  })

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, OCEAN_Y, 0]}
      geometry={grid.geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.ocean}
    />
  )
}
