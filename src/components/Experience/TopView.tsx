import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import type * as THREE from 'three'
import { TOP_VIEW_HEIGHT, TOP_VIEW_MARGIN } from './constants'
import { useDebugStore } from '../../store/debugStore'

export default function TopView() {
  const get = useThree((s) => s.get)

  useLayoutEffect(() => {
    const camera = get().camera as THREE.OrthographicCamera
    const span = Math.min(camera.right - camera.left, camera.top - camera.bottom)
    const reach = useDebugStore.getState().boundary.radius * TOP_VIEW_MARGIN

    camera.position.set(0, TOP_VIEW_HEIGHT, 0)
    camera.zoom = span / (2 * reach)
    camera.updateProjectionMatrix()
  }, [get])

  return <MapControls makeDefault enableRotate={false} zoomToCursor />
}
