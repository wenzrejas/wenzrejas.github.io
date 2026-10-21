import { useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { buildFlatQuad } from '@/utils/geometry'
import { pixelsPerUnit } from '@/utils/screen'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  GRID_LIFT,
  LABEL_GAP_PIXELS,
  SELECTION_HANDLE_PIXELS,
  SELECTION_PAD_PIXELS,
} from './constants'
import {
  buildScreenQuad,
  createLayerNameLabel,
  createLayerSizeLabel,
  createLayoutGridMaterial,
  createScreenLabelMaterial,
  createSelectionBoxMaterial,
  placeScreenLabel,
  placeSelectionBox,
  showLayoutGrid,
} from './designCanvasModel'
import {
  frameSelection,
  gridLevel,
  gridSweep,
  measureSelection,
  selectionGrowth,
  selectionLevel,
} from './layoutSelection'

const UP = new THREE.Vector3(0, 1, 0)
const _viewport = new THREE.Vector2()
const _boxHalf = new THREE.Vector2()
const _labelOffset = new THREE.Vector2()

interface DesignCanvasProps {
  gem: THREE.Mesh
  plazaCentre: THREE.Vector3
  plazaReach: number
  hover: HoverTimeline
}

export default function DesignCanvas({ gem, plazaCentre, plazaReach, hover }: DesignCanvasProps) {
  const pixelRatio = useThree((state) => state.gl.getPixelRatio())
  const gridRef = useRef<THREE.Mesh>(null)
  const overlayRef = useRef<THREE.Group>(null)

  const frame = useMemo(() => frameSelection(gem), [gem])
  const gridGeometry = useMemo(() => buildFlatQuad(), [])
  const screenQuad = useMemo(() => buildScreenQuad(), [])
  const gridMaterial = useMemo(() => createLayoutGridMaterial(), [])
  const boxMaterial = useMemo(() => createSelectionBoxMaterial(pixelRatio), [pixelRatio])
  const nameLabel = useMemo(() => createLayerNameLabel(pixelRatio), [pixelRatio])
  const sizeLabel = useMemo(() => createLayerSizeLabel(pixelRatio), [pixelRatio])
  const nameMaterial = useMemo(() => createScreenLabelMaterial(nameLabel), [nameLabel])
  const sizeMaterial = useMemo(() => createScreenLabelMaterial(sizeLabel), [sizeLabel])
  const gridPosition = useMemo(
    () => plazaCentre.clone().addScaledVector(UP, GRID_LIFT),
    [plazaCentre]
  )

  useEffect(
    () => () => {
      for (const resource of [gridGeometry, screenQuad, gridMaterial, boxMaterial])
        resource.dispose()
      for (const resource of [nameMaterial, sizeMaterial, nameLabel.texture, sizeLabel.texture]) {
        resource.dispose()
      }
    },
    [
      gridGeometry,
      screenQuad,
      gridMaterial,
      boxMaterial,
      nameMaterial,
      sizeMaterial,
      nameLabel,
      sizeLabel,
    ]
  )

  useFrame(({ camera, gl }) => {
    const grid = gridRef.current
    const overlay = overlayRef.current
    if (!grid || !overlay) return

    const gridShown = gridLevel(hover)
    grid.visible = gridShown > 0
    showLayoutGrid(gridMaterial, gridShown, gridSweep(hover))

    const level = selectionLevel(hover)
    overlay.visible = level > 0
    if (!overlay.visible) return

    gl.getDrawingBufferSize(_viewport)
    measureSelection(frame, camera, pixelsPerUnit(camera, gl), _boxHalf)
      .addScalar(SELECTION_PAD_PIXELS * pixelRatio)
      .multiplyScalar(selectionGrowth(hover))
    const gap = LABEL_GAP_PIXELS * pixelRatio

    placeSelectionBox(boxMaterial, _viewport, _boxHalf, SELECTION_HANDLE_PIXELS * pixelRatio, level)
    _labelOffset.set(nameLabel.halfSize.x - _boxHalf.x, _boxHalf.y + gap + nameLabel.halfSize.y)
    placeScreenLabel(nameMaterial, nameLabel, _viewport, _labelOffset, level)
    _labelOffset.set(0, -_boxHalf.y - gap - sizeLabel.halfSize.y)
    placeScreenLabel(sizeMaterial, sizeLabel, _viewport, _labelOffset, level)
  })

  return (
    <>
      <mesh
        ref={gridRef}
        geometry={gridGeometry}
        material={gridMaterial}
        position={gridPosition}
        scale={plazaReach * 2}
        visible={false}
        renderOrder={RENDER_LAYER.effects}
      />
      {createPortal(
        <group ref={overlayRef} visible={false}>
          {[boxMaterial, nameMaterial, sizeMaterial].map((material) => (
            <mesh
              key={material.uuid}
              geometry={screenQuad}
              material={material}
              frustumCulled={false}
              renderOrder={RENDER_LAYER.overGlow}
            />
          ))}
        </group>,
        gem
      )}
    </>
  )
}
