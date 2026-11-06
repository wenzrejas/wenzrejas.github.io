import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useSettingsStore } from '@/store/settingsStore'
import { disposeAll } from '@/utils/dispose'
import { OCEAN_GRID_FRAME_PRIORITY, OCEAN_Y } from './constants'
import { createOceanGrid, showVisibleCells } from './oceanGrid'
import { paintOcean, swellWithWind } from './oceanLook'
import { createOceanMaterial, createOceanUniforms } from './oceanModel'
import { useShoreCalm } from './useShoreCalm'

export default function Ocean() {
  const windSwell = useRef(1)
  const isSharp = useSettingsStore((state) => state.graphicsQuality === 'sharp')
  const uniforms = useMemo(() => createOceanUniforms(), [])
  const sharpMaterial = useMemo(() => createOceanMaterial(uniforms, false), [uniforms])
  const smoothMaterial = useMemo(() => createOceanMaterial(uniforms, true), [uniforms])
  const grid = useMemo(() => createOceanGrid(), [])
  useShoreCalm()

  useEffect(
    () => () => disposeAll(grid.geometry, sharpMaterial, smoothMaterial),
    [grid, sharpMaterial, smoothMaterial]
  )

  useFrame(({ camera }) => showVisibleCells(grid, camera), OCEAN_GRID_FRAME_PRIORITY)

  useFrame(({ clock }, delta) => {
    paintOcean(uniforms, clock.getElapsedTime())
    windSwell.current = swellWithWind(uniforms, windSwell.current, delta)
  })

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, OCEAN_Y, 0]}
      geometry={grid.geometry}
      material={isSharp ? sharpMaterial : smoothMaterial}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.ocean}
    />
  )
}
